"use server";

import { headers } from "next/headers";
import {
  verifyRecaptchaToken,
  type RecaptchaVerifyResult,
} from "@/lib/recaptcha/verify-server";

/**
 * Server Action: verifies the client token before you run auth or other mutations.
 * Uses the caller IP when available (x-forwarded-for / x-real-ip) for Google's optional remoteip check.
 *
 * Note: files with "use server" may only export async functions. Types and
 * re-exports are stripped by the Next.js compiler and will crash at runtime.
 */
export async function verifyRecaptchaAction(
  token: string
): Promise<RecaptchaVerifyResult> {
  try {
    const trimmed = token?.trim();
    if (!trimmed) {
      return {
        ok: false,
        error: "Complete the reCAPTCHA challenge before continuing.",
      };
    }

    let remoteip: string | undefined;
    try {
      const h = await headers();
      const forwarded = h.get("x-forwarded-for");
      remoteip =
        forwarded?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? undefined;
    } catch (err) {
      console.error("[recaptcha-action] failed to read request headers", err);
    }

    return await verifyRecaptchaToken(trimmed, remoteip);
  } catch (err) {
    console.error("[recaptcha-action] unexpected exception", err);
    const message =
      err instanceof Error
        ? `${err.name}: ${err.message}`
        : typeof err === "string"
          ? err
          : "unknown error";
    return {
      ok: false,
      error: `Server error during reCAPTCHA verification: ${message}`,
    };
  }
}
