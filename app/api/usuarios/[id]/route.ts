import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

interface Params { params: Promise<{ id: string }> }

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params
    const usuario = await prisma.usuario.findUnique({ where: { id }, include: { cliente: true } })
    if (!usuario) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    if (usuario.clienteId) {
      const hasReservas = await prisma.reserva.count({ where: { clienteId: usuario.clienteId } })
      if (hasReservas > 0) {
        return NextResponse.json({ error: "Não é possível excluir: cliente possui reservas" }, { status: 409 })
      }
      await prisma.usuario.delete({ where: { id } })
      await prisma.cliente.delete({ where: { id: usuario.clienteId } })
      return NextResponse.json({ ok: true })
    }

    await prisma.usuario.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 500 })
  }
}
