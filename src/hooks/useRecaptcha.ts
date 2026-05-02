"use client";

import { useCallback, useState } from "react";

/**
 * Holds the v2 response token and a remount key so the widget can be reset after
 * failed submits or expiry (avoids ref + `next/dynamic` typing friction).
 */
export function useRecaptcha() {
  const [widgetKey, setWidgetKey] = useState(0);
  const [token, setToken] = useState<string | null>(null);

  const reset = useCallback(() => {
    setWidgetKey((k) => k + 1);
    setToken(null);
  }, []);

  const siteKeyConfigured = Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);

  return { widgetKey, token, setToken, reset, siteKeyConfigured };
}
