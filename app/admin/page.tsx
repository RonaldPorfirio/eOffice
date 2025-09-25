import AdminPageClient from "./admin-page-client"

export const revalidate = 0
export const dynamic = "force-dynamic"

export default function AdminPage() {
  return <AdminPageClient />
}