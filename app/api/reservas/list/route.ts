import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const reservas = await prisma.reserva.findMany()
    const toClient = (st: string) => (st === "em_andamento" ? "em-andamento" : st)
    const mapped = reservas.map((r) => ({ ...r, status: toClient(r.status) }))
    return NextResponse.json(mapped)
  } catch (e) {
    return NextResponse.json({ error: "Erro ao listar reservas" }, { status: 500 })
  }
}
