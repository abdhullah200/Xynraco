"use client";

import React from "react";
import { cn } from "@/lib/utils";

const BASE_GRID = "[background-image:linear-gradient(to_right,#6746d4_1px,transparent_1px),linear-gradient(to_bottom,#6746d4_1px,transparent_1px)]";
const DARK_GRID = "dark:[background-image:linear-gradient(to_right,#3f5be4_1px,transparent_1px),linear-gradient(to_bottom,#3f5be4_1px,transparent_1px)]";

export function BackgroundGrid() {
  const [cursor, setCursor] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const updateCenter = () => {
      setCursor({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    };

    const handlePointerMove = (event: PointerEvent) => {
      setCursor({ x: event.clientX, y: event.clientY });
    };

    updateCenter();
    window.addEventListener("resize", updateCenter, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("resize", updateCenter);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-0",
        BASE_GRID,
        DARK_GRID,
        "bg-[linear-gradient(to_bottom,#ffffff_0%,#f0f0f0_35%,transparent_100%)]",
        "opacity-20"
      )}
    >
      <div
        className="absolute h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-[120px] transition-transform duration-200"
        style={{
          left: cursor.x,
          top: cursor.y,
          background: "radial-gradient(circle at center, rgba(5,205,255,0.5) 0%, rgba(103,70,212,0.25) 55%, transparent 100%)",
        }}
      />
      <div className="absolute -top-24 left-1/2 h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,#05cdff_0%,transparent_65%)] blur-3xl" />
      <div className="absolute bottom-[-160px] right-[-80px] h-[380px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,#6746d4_0%,transparent_70%)] blur-3xl" />
      <div className="absolute top-1/3 left-1/4 h-[280px] w-[360px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,#3f5be4_0%,transparent_60%)] blur-2xl opacity-80 mix-blend-screen dark:mix-blend-soft-light" />
    </div>
  );
}
