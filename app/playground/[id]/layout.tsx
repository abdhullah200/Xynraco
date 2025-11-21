import { Sidebar } from "lucide-react";

export default function PlaygroundLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Sidebar>{children}</Sidebar>
    );
}