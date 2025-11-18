import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { NextAuthConfig } from "next-auth";


export default{
    providers:[
        Github({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
    ]
} satisfies NextAuthConfig;