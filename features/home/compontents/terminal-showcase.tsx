"use client";

import React from "react";
import { cn } from "@/lib/utils";

const entries = [
  {
    command: "ai-jokes",
    output: "🤖 Why did the neural network go to the comedy club? To work on its stand-up gradients.",
  },
  {
    command: "programming-jokes",
    output: "💻 Debugging is like being a detective in a crime movie where you are also the culprit.",
  },
  {
    command: "ai-jokes",
    output: "🧠 My LLM tried meditation—now it only answers in mindful completions.",
  },
  {
    command: "programming-jokes",
    output: "📦 I refactored my sleep schedule; now it only runs in production.",
  },
];

export function TerminalShowcase({ className }: { className?: string }) {
  const [index, setIndex] = React.useState(0);
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const hideTimeout = window.setTimeout(() => setVisible(false), 3800);
    const nextTimeout = window.setTimeout(() => {
      setIndex((prev) => (prev + 1) % entries.length);
      setVisible(true);
    }, 4400);

    return () => {
      window.clearTimeout(hideTimeout);
      window.clearTimeout(nextTimeout);
    };
  }, [index]);

  const entry = entries[index];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-sky-100/40 transition dark:border-slate-800 dark:bg-slate-950 dark:shadow-none",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-500" />
        <span className="ml-auto text-xs font-medium text-slate-500 dark:text-slate-400">Terminal</span>
      </div>
      <div className="bg-slate-950/5 px-4 py-6 font-mono text-sm leading-relaxed text-slate-800 dark:bg-slate-950 dark:text-slate-100">
        <div className={cn("space-y-3 transition-opacity duration-500", visible ? "opacity-100" : "opacity-0")}
          key={`${entry.command}-${index}`}
        >
          <p>
            <span className="text-sky-500">~/xynraco</span> <span className="text-slate-500">$</span> {entry.command}
          </p>
          <p>{entry.output}</p>
        </div>
      </div>
    </div>
  );
}
