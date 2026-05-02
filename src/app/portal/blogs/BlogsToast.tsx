"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

type Props = {
  value?: string;
};

export default function BlogsToast({ value }: Props) {
  const hasShownRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!value || hasShownRef.current) return;

    if (value === "blog-deleted") toast.success("Blog verwijderd");
    if (value === "blog-unauthorized") toast.error("Niet geautoriseerd");
    if (value === "blog-delete-error") toast.error("Blog verwijderen mislukt");

    hasShownRef.current = true;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl);
  }, [pathname, router, searchParams, value]);

  return null;
}
