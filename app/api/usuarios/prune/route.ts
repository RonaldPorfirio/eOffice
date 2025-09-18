import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST() {
  try {
    const usuarios = await prisma.usuario.findMany({ where: { role: "cliente" }, include: { cliente: true } })
    let removed = 0
    for (const u of usuarios) {
      if (u.clienteId) {
        const count = await prisma.reserva.count({ where: { clienteId: u.clienteId } })
        if (count === 0) {
          await prisma.usuario.delete({ where: { id: u.id } })
          await prisma.cliente.delete({ where: { id: u.clienteId } })
          removed++
        }
      }
    }
    return NextResponse.json({ removed })
  } catch (e) {
    return NextResponse.json({ error: "Erro ao limpar usuários" }, { status: 500 })
  }
}

