import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { nome: "asc" },
    })
    return NextResponse.json(clientes)
  } catch (e) {
    return NextResponse.json({ error: "Erro ao listar clientes" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nome, email, telefone, plano, documento, endereco, status } = body || {}
    if (!nome || !email || !telefone || !plano) {
      return NextResponse.json({ error: "Campos obrigatorios: nome, email, telefone, plano" }, { status: 400 })
    }
    const exists = await prisma.cliente.findUnique({ where: { email } })
    if (exists) return NextResponse.json({ error: "Ja existe um cliente com este email" }, { status: 409 })

    const now = new Date()
    const novo = await prisma.cliente.create({
      data: {
        id: (email.split("@")[0] || `cli-${Date.now()}`).toLowerCase().replace(/[^a-z0-9_.-]/g, "-"),
        nome,
        email,
        telefone,
        plano,
        status: status || "ativo",
        dataInicio: now,
        documento: documento || null,
        endereco: endereco || null,
      },
    })
    return NextResponse.json(novo, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 })
  }
}
