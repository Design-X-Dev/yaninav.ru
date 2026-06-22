"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const COUNTER_ID = "3762873";

export default function TopMailRuPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window._tmr?.push({
      id: COUNTER_ID,
      type: "pageView",
      start: Date.now(),
    });
  }, [pathname, searchParams]);

  return null;
}
