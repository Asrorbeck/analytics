import { DashboardLayout } from "@/components/dashboard-layout"

export default function AILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}

