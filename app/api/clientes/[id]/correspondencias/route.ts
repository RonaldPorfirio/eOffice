import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

interface Params { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params
    const correspondencias = await prisma.correspondencia.findMany({
      where: { clienteId: id },
      orderBy: { dataRecebimento: "desc" },
    })
    return NextResponse.json(correspondencias)
  } catch (e) {
    return NextResponse.json({ error: "Erro ao listar correspondências" }, { status: 500 })
  }
}
