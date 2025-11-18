"use client";

import type { Session } from "next-auth";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { PropsWithChildren } from "react";

interface SessionProviderProps {
  session: Session | null;
}

export function SessionProvider({ session, children }: PropsWithChildren<SessionProviderProps>) {
  return <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>;
}
