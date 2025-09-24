// app/api/audiencias/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// (opcional, mas seguro)
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const lista = await prisma.audiencia.findMany()
    // normalize datas se precisar:
    const data = lista.map((a: any) => ({
      ...a,
      data: a.data instanceof Date ? a.data.toISOString() : a.data,
    }))
    return NextResponse.json(data)
  } catch (e) {
    console.error("Erro GET /api/audiencias:", e)
    return NextResponse.json({ error: "Erro ao listar audiências" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const criado = await prisma.audiencia.create({ data: body })
    return NextResponse.json(criado, { status: 201 })
  } catch (e) {
    console.error("Erro POST /api/audiencias:", e)
    return NextResponse.json({ error: "Erro ao criar audiência" }, { status: 500 })
  }
}
