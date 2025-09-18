import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { email, senha } = await req.json()
    if (!email || !senha) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { cliente: true },
    })

    if (!usuario || !bcrypt.compareSync(senha, usuario.senha)) {
      return NextResponse.json({ error: "Email ou senha incorretos" }, { status: 401 })
    }

    const isAdmin = usuario.role === "admin"
    if (!isAdmin) {
      // Bloqueia acesso de cliente desativado
      if (!usuario.cliente || usuario.cliente.status !== "ativo") {
        return NextResponse.json({ error: "Conta desativada. Contate o administrador." }, { status: 403 })
      }
    }
    const userPayload = {
      id: isAdmin ? "admin" : usuario.cliente?.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: isAdmin ? "admin" : "cliente",
      plano: isAdmin ? "admin" : usuario.cliente?.plano,
    }

    const redirect = isAdmin ? "/admin" : "/dashboard"
    return NextResponse.json({ success: true, user: userPayload, redirect })
  } catch (e) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
