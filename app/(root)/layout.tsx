import React from "react";
import Header from "@/features/home/compontents/header";
import Footer from "@/features/home/compontents/footer";
import { BackgroundGrid } from "@/features/home/compontents/background-grid";

export default function HomeLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden">
            <Header />

            <BackgroundGrid />

            <main className="relative z-10 flex-1 w-full pt-0 md:pt-0">
                {children}
            </main>
            <Footer />
        </div>
    )
}