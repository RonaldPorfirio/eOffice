import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const { status, observacoes } = await req.json()
    const toDbStatus = (s?: string) => {
      if (!s) return undefined
      const normalized = s.replace("-", "_")
      const allowed = ["confirmada", "pendente", "cancelada", "em_andamento"] as const
      return (allowed.includes(normalized as any) ? normalized : undefined) as typeof allowed[number] | undefined
    }
    const toClient = (st: string) => (st === "em_andamento" ? "em-andamento" : st)

    const updated = await prisma.reserva.update({
      where: { id },
      data: { status: toDbStatus(status) as any, observacoes },
    })
    return NextResponse.json({ ...updated, status: toClient(updated.status) })
  } catch (e) {
    return NextResponse.json({ error: "Erro ao atualizar reserva" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params
    await prisma.reserva.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Erro ao excluir reserva" }, { status: 500 })
  }
}
