import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const audiencias = await prisma.audiencia.findMany()
    return NextResponse.json(audiencias)
  } catch (e) {
    return NextResponse.json({ error: "Erro ao listar audiências" }, { status: 500 })
  }
}

