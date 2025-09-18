import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

const toDbStatus = (s?: string) => {
  if (!s) return undefined
  if (s === "pendente") return "aguardando"
  if (s === "coletada") return "retirada"
  if (s === "atrasada") return "aguardando"
  const allowed = ["aguardando", "retirada", "devolvida"]
  return allowed.includes(s) ? s : undefined
}

export async function GET() {
  try {
    const correspondencias = await prisma.correspondencia.findMany({ orderBy: { dataRecebimento: "desc" } })
    return NextResponse.json(correspondencias)
  } catch (e) {
    return NextResponse.json({ error: "Erro ao listar correspondências" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { clienteId, remetente, tipo, dataRecebimento, status, urgente, observacoes, prioridade } = body || {}
    if (!clienteId || !remetente || !tipo || !dataRecebimento) {
      return NextResponse.json({ error: "Campos obrigatórios: clienteId, remetente, tipo, dataRecebimento" }, { status: 400 })
    }
    const id = `corr-${Date.now()}`
    const dbStatus = toDbStatus(status) || "aguardando"
    const corr = await prisma.correspondencia.create({
      data: {
        id,
        clienteId,
        remetente,
        tipo,
        dataRecebimento: new Date(dataRecebimento),
        status: dbStatus as any,
        urgente: Boolean(urgente) || status === "atrasada" || ["alta", "urgente"].includes(String(prioridade || "").toLowerCase()),
        observacoes: observacoes || null,
      },
    })
    return NextResponse.json(corr, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Erro ao criar correspondência" }, { status: 500 })
  }
}
