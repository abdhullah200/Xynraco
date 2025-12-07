"use server";
import {currentUser} from "@/features/auth/action";
import { db } from "@/lib/db";
import { TemplateFolder } from "../lib/path-to-json";
import { revalidatePath } from "next/cache";

export const getPlaygroundById = async(id:string)=>{
  try{
    const playground = await db.playground.findUnique({
      where:{id},
      select:{
        title:true,
        description:true,
        templateFiles:{
          select:{
            content:true
          }
        }
      }
    });
    return playground;
  }catch(error){
    console.log(error);
  }
}

export const SaveUpdatedCode = async(playgroundId:string, data:TemplateFolder)=>{
    const user = await currentUser();
    if (!user) return null;

    try{
        const updatedPlayground = await db.templateFile.upsert({
            where:{
              playgroundId
            },
            update:{
              content: JSON.stringify(data)
            },
            create:{
              playgroundId,
              content: JSON.stringify(data)
            }
        })

    }catch(error){

    }
}