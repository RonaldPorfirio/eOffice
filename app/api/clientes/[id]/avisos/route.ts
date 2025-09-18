import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

interface Params { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params
    const avisos = await prisma.aviso.findMany({
      where: { clienteId: id },
      orderBy: { dataEnvio: "desc" },
    })
    return NextResponse.json(avisos)
  } catch (e) {
    return NextResponse.json({ error: "Erro ao listar avisos" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params
    await prisma.aviso.deleteMany({ where: { clienteId: id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Erro ao limpar avisos" }, { status: 500 })
  }
}
