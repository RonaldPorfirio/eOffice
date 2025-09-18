import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

interface Params { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params
    const audiencias = await prisma.audiencia.findMany({
      where: { clienteId: id },
      orderBy: [{ data: "desc" }, { horario: "asc" }],
    })
    return NextResponse.json(audiencias)
  } catch (e) {
    return NextResponse.json({ error: "Erro ao listar audiências" }, { status: 500 })
  }
}
