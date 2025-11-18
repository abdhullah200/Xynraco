"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import type { LogoutButtonProp } from "../types";

const LogoutButton = ({ children }: LogoutButtonProp) => {
    const router = useRouter();

    const onLogout = async () => {
        await signOut({ redirect: false });
        router.refresh();
    };

    return (
        <span className="cursor-pointer" onClick={onLogout}>
            {children}
        </span>
    );
};

export default LogoutButton;