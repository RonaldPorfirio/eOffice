import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { clienteIds, clienteId, titulo, mensagem, tipo = "info", urgencia = "baixa" } = body || {}

    const ids: string[] = Array.isArray(clienteIds) ? clienteIds : (clienteId ? [clienteId] : [])
    if (ids.length === 0 || !titulo || !mensagem) {
      return NextResponse.json({ error: "Campos obrigatórios: clienteId(s), titulo, mensagem" }, { status: 400 })
    }

    const now = new Date()
    const created = await Promise.all(
      ids.map((id) =>
        prisma.aviso.create({
          data: {
            id: `av-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            clienteId: id,
            titulo,
            mensagem,
            tipo,
            urgencia,
            dataEnvio: now,
            lido: false,
            resolvido: false,
          },
        }),
      ),
    )

    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Erro ao criar aviso" }, { status: 500 })
  }
}

