import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/portal";
  const errorParam = searchParams.get("error");

  const base = process.env.NEXT_PUBLIC_SITE_URL || origin;

  console.log("[auth/callback] Redirecting to:", next);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.user_metadata?.invitation_token) {
        const processed = await processInvitationToken(user);
        if (processed) {
          return NextResponse.redirect(`${base}/portal`);
        }
      }

      if (errorParam) {
        return NextResponse.redirect(
          new URL(`${next}?error=${errorParam}`, request.url)
        );
      }

      return NextResponse.redirect(`${base}${next}`);
    }
  }

  if (next && next !== "/portal") {
    return NextResponse.redirect(
      new URL(`${next}?error=auth_failed`, request.url)
    );
  }

  return NextResponse.redirect(`${base}/login?error=auth_callback_failed`);
}

async function processInvitationToken(user: {
  id: string;
  email?: string;
  user_metadata: Record<string, unknown>;
}): Promise<boolean> {
  const token = user.user_metadata.invitation_token as string;
  const admin = createAdminClient();

  console.log("[auth/callback] Processing invitation token for user:", user.id);

  try {
    const { data: invitation, error: invErr } = await admin
      .from("invitations")
      .select("id, firm_id, status")
      .eq("token", token)
      .eq("status", "pending")
      .maybeSingle();

    if (invErr || !invitation) {
      console.warn("[auth/callback] Invitation not found or already used:", token);
      return false;
    }

    console.log("[auth/callback] Found invitation — firm_id:", invitation.firm_id);

    const profilePayload = {
      firm_id: invitation.firm_id,
      role: "employer" as const,
    };

    // Link user to the firm — try update first, fall back to insert
    const { data: updated, error: updateErr } = await admin
      .from("profiles")
      .update(profilePayload)
      .eq("id", user.id)
      .select("id");

    if (updateErr) {
      console.error("[auth/callback] Profile update failed:", updateErr.message);
    }

    if (!updated?.length) {
      console.log("[auth/callback] No existing profile found, inserting new profile");
      const { error: insertErr } = await admin.from("profiles").insert({
        id: user.id,
        email: user.email!,
        full_name: (user.user_metadata.contact_person as string) || null,
        role: "employer",
        firm_id: invitation.firm_id,
      });

      if (insertErr) {
        console.log("[auth/callback] Insert failed (trigger race), retrying update:", insertErr.message);
        const { error: retryErr } = await admin
          .from("profiles")
          .update(profilePayload)
          .eq("id", user.id);

        if (retryErr) {
          console.error("[auth/callback] Profile retry-update failed:", retryErr.message);
          return false;
        }
      }
    }

    console.log("[auth/callback] Profile linked to firm_id:", invitation.firm_id);

    // Mark invitation as accepted
    const { error: acceptErr } = await admin
      .from("invitations")
      .update({ status: "accepted" })
      .eq("id", invitation.id);

    if (acceptErr) {
      console.error("[auth/callback] Failed to mark invitation as accepted:", acceptErr.message);
    } else {
      console.log("[auth/callback] Invitation marked as accepted:", invitation.id);
    }

    // Remove the token from user metadata so it's not processed again
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        invitation_token: null,
      },
    });

    return true;
  } catch (err) {
    console.error("[auth/callback] Failed to process invitation:", err);
    return false;
  }
}
