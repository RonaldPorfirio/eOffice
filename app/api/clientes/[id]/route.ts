import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

interface Params { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params
    const cliente = await prisma.cliente.findUnique({ where: { id } })
    if (!cliente) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    return NextResponse.json(cliente)
  } catch (e) {
    return NextResponse.json({ error: "Erro ao obter cliente" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const data = await req.json()
    const allowed: any = {}
    if (typeof data.nome === "string") allowed.nome = data.nome
    if (typeof data.email === "string") allowed.email = data.email
    if (typeof data.telefone === "string") allowed.telefone = data.telefone
    if (typeof data.endereco === "string" || data.endereco === null) allowed.endereco = data.endereco ?? null
    if (typeof data.documento === "string" || data.documento === null) allowed.documento = data.documento ?? null
    if (typeof data.plano === "string" && ["mensalista", "fiscal", "comercial"].includes(data.plano)) allowed.plano = data.plano
    if (typeof data.status === "string" && ["ativo", "inativo", "pendente"].includes(data.status)) allowed.status = data.status

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: "Nenhum campo válido para atualizar" }, { status: 400 })
    }

    const updated = await prisma.cliente.update({ where: { id }, data: allowed })
    return NextResponse.json(updated)
  } catch (e: any) {
    if (String(e?.code) === "P2002") {
      return NextResponse.json({ error: "Email já está em uso" }, { status: 409 })
    }
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params
    const hasReservas = await prisma.reserva.count({ where: { clienteId: id } })
    if (hasReservas > 0) {
      return NextResponse.json({ error: "Não é possível excluir: cliente possui reservas" }, { status: 409 })
    }
    // Remove registros vinculados primeiro
    await prisma.aviso.deleteMany({ where: { clienteId: id } })
    await prisma.audiencia.deleteMany({ where: { clienteId: id } })
    await prisma.correspondencia.deleteMany({ where: { clienteId: id } })
    await prisma.usuario.deleteMany({ where: { clienteId: id } })
    await prisma.cliente.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Erro ao excluir cliente" }, { status: 500 })
  }
}
