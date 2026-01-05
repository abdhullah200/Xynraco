"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import type { TerminalRef } from "./terminal";

// Dynamically import the terminal component with SSR disabled
// This is necessary because xterm uses browser-only APIs (self, window)
const TerminalComponent = dynamic(() => import("./terminal"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-black text-white">
      Loading terminal...
    </div>
  ),
});

interface TerminalWrapperProps {
  webcontainerUrl?: string;
  className?: string;
  theme?: "dark" | "light";
  webContainerInstance?: any;
}

// Re-export the TerminalRef type for convenience
export type { TerminalRef };

// Create a wrapper that forwards the ref
const TerminalWrapper = forwardRef<TerminalRef, TerminalWrapperProps>(
  (props, ref) => {
    return <TerminalComponent {...props} ref={ref} />;
  }
);

TerminalWrapper.displayName = "TerminalWrapper";

export default TerminalWrapper;
