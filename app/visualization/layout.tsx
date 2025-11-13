import { DashboardLayout } from "@/components/dashboard-layout"

export default function VisualizationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}

