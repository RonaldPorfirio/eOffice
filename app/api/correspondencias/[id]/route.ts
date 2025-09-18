import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

interface Params { params: Promise<{ id: string }> }

const toDbStatus = (s?: string) => {
  if (!s) return undefined
  if (s === "pendente") return "aguardando"
  if (s === "coletada") return "retirada"
  if (s === "atrasada") return "aguardando"
  const allowed = ["aguardando", "retirada", "devolvida"]
  return allowed.includes(s) ? s : undefined
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const body = await req.json()
    const { id } = await params
    const current = await prisma.correspondencia.findUnique({ where: { id } })
    const data: any = {}
    if (body.remetente !== undefined) data.remetente = String(body.remetente)
    if (body.tipo !== undefined) data.tipo = String(body.tipo)
    if (body.dataRecebimento !== undefined) data.dataRecebimento = new Date(body.dataRecebimento)
    if (body.observacoes !== undefined) data.observacoes = body.observacoes || null
    if (body.urgente !== undefined) data.urgente = Boolean(body.urgente)
    if (body.prioridade !== undefined) {
      const pr = String(body.prioridade || '').toLowerCase()
      data.urgente = pr === 'alta' || pr === 'urgente'
    }
    if (body.status !== undefined) {
      const st = toDbStatus(body.status)
      if (st) data.status = st as any
      if (body.status === "atrasada") data.urgente = true
    }
    const updated = await prisma.correspondencia.update({ where: { id }, data })

    // Se status mudou para retirada/coletada, remover avisos relacionados
    const willRetirar = (data.status && String(data.status) === 'retirada') || String(body.status||'') === 'coletada'
    if (willRetirar && (current || updated)) {
      const corr = updated || current!
      const msgs = [
        `Recebemos uma correspondencia (${corr.tipo}) de ${corr.remetente}.`,
        `Recebemos uma correspondência (${corr.tipo}) de ${corr.remetente}.`,
      ]
      for (const m of msgs) {
        await prisma.aviso.deleteMany({ where: { clienteId: corr.clienteId, titulo: 'Nova correspondencia', mensagem: m } })
      }
      await prisma.aviso.deleteMany({
        where: { clienteId: corr.clienteId, titulo: 'Nova correspondencia', mensagem: { contains: corr.remetente } },
      })
    }
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: "Erro ao atualizar correspondência" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params
    // Remove aviso relacionado (se existir) antes de apagar a correspondência
    const corr = await prisma.correspondencia.findUnique({ where: { id } })
    if (corr) {
      // Remover avisos criados junto com a correspondência
      const msgs = [
        `Recebemos uma correspondencia (${corr.tipo}) de ${corr.remetente}.`,
        `Recebemos uma correspondência (${corr.tipo}) de ${corr.remetente}.`,
      ]
      for (const m of msgs) {
        await prisma.aviso.deleteMany({
          where: { clienteId: corr.clienteId, titulo: 'Nova correspondencia', mensagem: m },
        })
      }
      // Fallback: se variar acentuação/espacos, apaga por "contains" do remetente
      await prisma.aviso.deleteMany({
        where: {
          clienteId: corr.clienteId,
          titulo: 'Nova correspondencia',
          mensagem: { contains: corr.remetente },
        },
      })
    }

    const res = await prisma.correspondencia.deleteMany({ where: { id } })
    // Idempotente: se já não existir, tratamos como sucesso
    return NextResponse.json({ ok: true, deleted: res.count })
  } catch (e) {
    return NextResponse.json({ error: "Erro ao excluir correspondência" }, { status: 500 })
  }
}
