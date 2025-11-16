import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar"
import { getAllPlaygroundForUser } from "@/features/playground/actions"
import type React from "react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const playgroundData = await getAllPlaygroundForUser()

  // Store icon names instead of the components themselves
  const technologyIconMap: Record<string, string> = {
    REACT: "Zap",
    NEXTJS: "Lightbulb",
    EXPRESS: "Database",
    VUE: "Compass",
    HONO: "FlameIcon",
    ANGULAR: "Terminal",
    FLASK: "Cloud",
    DOTNET: "Server",
  }

  const formattedPlaygroundData =
    playgroundData?.map((playground) => ({
      id: playground.id,
      name: playground.title,
      starred: playground.Starmark?.[0]?.isMarked || false,
      icon: playground.template ? technologyIconMap[playground.template] || "Code2" : "Code2",
    })) || [];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        {/* Pass the formatted data with string icon names */}
        <DashboardSidebar initialPlaygroundData={formattedPlaygroundData} />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  )
}
