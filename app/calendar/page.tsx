import CalendarPageClient from "./calendar-page-client"

export const revalidate = 0
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export default function CalendarPage() {
  return <CalendarPageClient />
}