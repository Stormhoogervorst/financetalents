"use client";

import { useRef, useEffect, useState } from "react";

const RADIUS_OPTIONS = [
  { value: "0", label: "+0 km" },
  { value: "5", label: "+5 km" },
  { value: "25", label: "+25 km" },
  { value: "50", label: "+50 km" },
  { value: "100", label: "+100 km" },
];

interface RadiusSelectProps {
  name: string;
  defaultValue?: string;
  locationInputId: string;
  className?: string;
}

export default function RadiusSelect({
  name,
  defaultValue = "0",
  locationInputId,
  className,
}: RadiusSelectProps) {
  const [locationFilled, setLocationFilled] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const check = () => {
      const input = document.getElementById(locationInputId) as HTMLInputElement | null;
      setLocationFilled(!!input?.value.trim());
    };

    check();
    intervalRef.current = setInterval(check, 300);

    const input = document.getElementById(locationInputId) as HTMLInputElement | null;
    if (input) {
      input.addEventListener("input", check);
      return () => {
        input.removeEventListener("input", check);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [locationInputId]);

  if (!locationFilled) return null;

  return (
    <div className="relative">
      <select
        name={name}
        defaultValue={defaultValue}
        className={className}
      >
        {RADIUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
