import type { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";

export type { JWT };

export type ExtendedUser = DefaultSession["user"] & {
    role: UserRole;
};

declare module "next-auth" {
    interface Session {
        user: ExtendedUser;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: UserRole;
    }
}
