import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";

export type { JWT };

export type ExtendedUser = DefaultSession["user"] & {
    role: Role;
};

declare module "next-auth" {
    interface Session {
        user: ExtendedUser;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: Role;
    }
}
