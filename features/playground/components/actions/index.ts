"use sever";
import {currentUser} from "@clerk/nextjs";
import {db} from "@/lib/db";
import { TemplateFolder } from "@/features/playground/lib/path-to-json";
import { revalidatePath } from "next/cache";

export const getAllPlaygroundById = async ()=>{
    try{
        const playground = await db.playground.findMany({
            where:{id},
            select
        })
    }catch(error){

    }
}