import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TerminalShowcase } from "@/features/home/compontents/terminal-showcase";
export default function Home() {
   
  return (
    <div className=" z-20 flex flex-col items-center justify-start min-h-screen py-2 mt-10">
      
      <div className="flex flex-col justify-center items-center my-5">
      <Image src={"/hero.svg"} alt="Hero-Section" height={500}  width={500}/>

      <h1 className=" z-20 text-6xl mt-5 font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-[#05cdff] via-[#05cdff] to-[#6746d4] dark:from-[#05cdff] dark:via-[#3f5be4] dark:to-[#6746d4] tracking-tight leading-[1.3] ">
        Xynraco With AI Assistance
      </h1>
      </div>
     

      <p className="mt-2 text-lg text-center text-gray-600 dark:text-gray-400 px-5 py-10 max-w-2xl">
        Xynraco Editor is a powerful and intelligent code editor that enhances
        your coding experience with advanced features and seamless integration.
        It is designed to help you write, debug, and optimize your code
        efficiently.
      </p>

  <TerminalShowcase className="w-full max-w-3xl px-5 mt-4" />

      <Link href={"/dashboard"} className="mt-6">
        <Button variant="default" className="mb-4" size={"lg"}>
          Get Started
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Button>
      </Link>
    </div>
  );
}