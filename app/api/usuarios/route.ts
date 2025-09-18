import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({ include: { cliente: true } })
    return NextResponse.json(usuarios)
  } catch (e) {
    return NextResponse.json({ error: "Erro ao listar usuarios" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { nome, email, senha, plano, telefone } = await req.json()
    if (!nome || !email || !senha || !plano) {
      return NextResponse.json({ error: "Campos obrigatorios: nome, email, senha, plano" }, { status: 400 })
    }

    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } })
    if (usuarioExistente) {
      return NextResponse.json({ error: "Usuario ja existe" }, { status: 409 })
    }

    const clienteExistente = await prisma.cliente.findUnique({ where: { email } })
    if (clienteExistente) {
      return NextResponse.json({ error: "Ja existe um cliente com este email" }, { status: 409 })
    }

    const baseId = String(email).split("@")[0].toLowerCase().replace(/[^a-z0-9_.-]/g, "-")
    let clienteId = baseId || `cli-${Date.now()}`
    let i = 1
    while (await prisma.cliente.findUnique({ where: { id: clienteId } })) {
      clienteId = `${baseId}-${i++}`
    }

    const senhaHash = bcrypt.hashSync(senha, 10)
    const now = new Date()

    const cliente = await prisma.cliente.create({
      data: {
        id: clienteId,
        nome,
        email,
        telefone: telefone || "",
        plano,
        status: "ativo",
        dataInicio: now,
      },
    })

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        role: "cliente",
        clienteId: cliente.id,
      },
      include: { cliente: true },
    })

    return NextResponse.json(usuario, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Erro ao criar usuario" }, { status: 500 })
  }
}