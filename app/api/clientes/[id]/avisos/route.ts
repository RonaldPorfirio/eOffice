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

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json().catch(()=>({}))
    const { titulo, mensagem, tipo = 'info', urgencia = 'media' } = body || {}
    if (!titulo || !mensagem) {
      return NextResponse.json({ error: 'Campos obrigatórios: titulo, mensagem' }, { status: 400 })
    }
    const aviso = await prisma.aviso.create({
      data: {
        id: `av-${Date.now()}`,
        clienteId: id,
        titulo,
        mensagem,
        tipo,
        urgencia,
        dataEnvio: new Date(),
        lido: false,
        resolvido: false,
      },
    })
    return NextResponse.json(aviso, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao criar aviso' }, { status: 500 })
  }
}
