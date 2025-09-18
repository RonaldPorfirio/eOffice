import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

interface Params { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params
    const reservas = await prisma.reserva.findMany({
      where: { clienteId: id },
      orderBy: [{ data: "desc" }, { horaInicio: "asc" }],
    })
    const toClient = (st: string) => (st === "em_andamento" ? "em-andamento" : st)
    const mapped = reservas.map((r) => ({ ...r, status: toClient(r.status) }))
    return NextResponse.json(mapped)
  } catch (e) {
    return NextResponse.json({ error: "Erro ao listar reservas" }, { status: 500 })
  }
}
