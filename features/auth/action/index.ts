"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";


export const getUserById = async (id:string)=>{
    const { ensureConnection } = await import("@/lib/db");
    
    try {
        // Check connection with retry logic
        const isConnected = await ensureConnection();
        if (!isConnected) {
            console.error("Could not establish database connection");
            return null;
        }
        
        const user = await db.user.findUnique({
            where:{id},
            include:{accounts:true}
        })
        return user
    } catch (error) {
        console.error("Database error in getUserById:", error);
        
        // For connection errors, try one more time with fresh connection
        if (error.code === 'P2010' || error.message.includes('Server selection timeout')) {
            console.log("Attempting final retry with fresh connection...");
            try {
                await db.$disconnect();
                const isConnected = await ensureConnection(1);
                if (isConnected) {
                    const user = await db.user.findUnique({
                        where:{id},
                        include:{accounts:true}
                    });
                    return user;
                }
            } catch (retryError) {
                console.error("Final retry failed:", retryError);
            }
        }
        
        return null
    }
}

export const getAccountByUserId = async (userId:string)=>{
    try {
        const account = await db.account.findFirst({
            where:{
                userId
            }
        })
        return account
    } catch (error) {
        console.log(error)
        return null
    }
}

export const currentUser = async()=>{
    const user = await auth()
    return user?.user;
}