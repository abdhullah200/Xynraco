"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Templates } from "@prisma/client";
import { revalidatePath } from "next/cache";


export const createPlayground = async (data:{
    title:string,
    template: Templates,
    description?:string,
    userId:string;
})=>{
    const {title,template,description} = data;

    const session = await auth();
    const user = session?.user;

    try{
        const playground = await db.playground.create({
            data:{
                title,
                description,
                template,
                userId: user?.id || ""
            }
        });
        return playground;
    }catch(error){
        console.log(error);
        return null;
    }
}

export const getAllPlaygroundForUser = async()=>{
    const user = await auth();
    try{
        const playground = await db.playground.findMany({
            where:{
                userId: user?.user.id
            },
            include:{
                user:true,
                Starmark:{
                    where:{
                        userId: user?.user.id
                    },
                    select:{
                        isMarked:true
                    }
                }
            }
    })
        return playground;
    }catch(error){
        console.log(error);
        return [];
    }
}

export const deletePlaygroundById = async (id: string) => {
    try{
        await db.playground.delete({
            where: { id }
        })

        revalidatePath("/dashboard");
    }catch(error){
        console.log("Error deleting playground:", error);
    }
}

export const editPlaygroundById = async (id: string, data: { title: string; description?: string }) => {
    try{
        await db.playground.update({
            where: { id },
            data: data
        });
    }catch(error){
        console.log("Error editing playground:", error);
    }
}

export const duplicateProjectById = async (id: string) => {
    try {
        // Fetch the original playground data
        const originalPlayground = await db.playground.findUnique({
            where: { id },
        });

        if (!originalPlayground) {
            throw new Error("Original playground not found");
        }

        // Create a new playground with the same data but a new ID
        const duplicatedPlayground = await db.playground.create({
            data: {
                title: `${originalPlayground.title} (Copy)`,
                description: originalPlayground.description,
                template: originalPlayground.template,
                userId: originalPlayground.userId,
            },
        })
        revalidatePath ("/dashboard");
        return duplicatedPlayground;
    }
    catch (error) {
        console.log("Error duplicating playground:", error);
    }
}