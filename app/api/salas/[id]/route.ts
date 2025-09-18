import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

interface Params { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params
    const sala = await prisma.sala.findUnique({ where: { id } })
    if (!sala) return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 })
    return NextResponse.json(sala)
  } catch (e) {
    return NextResponse.json({ error: "Erro ao buscar sala" }, { status: 500 })
  }
}
