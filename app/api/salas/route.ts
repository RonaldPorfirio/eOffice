import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const salas = await prisma.sala.findMany({ orderBy: { nome: "asc" } })
    return NextResponse.json(salas)
  } catch (e) {
    return NextResponse.json({ error: "Erro ao listar salas" }, { status: 500 })
  }
}

