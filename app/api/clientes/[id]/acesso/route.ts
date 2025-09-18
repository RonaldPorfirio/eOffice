import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

interface Params { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const { senha, email, nome } = body || {}
    if (!senha) {
      return NextResponse.json({ error: "Campo obrigatorio: senha" }, { status: 400 })
    }

    const cliente = await prisma.cliente.findUnique({ where: { id } })
    if (!cliente) return NextResponse.json({ error: "Cliente nao encontrado" }, { status: 404 })

    const senhaHash = bcrypt.hashSync(String(senha), 10)

    // procurar usuario existente pelo clienteId
    const existing = await prisma.usuario.findFirst({ where: { clienteId: id } })

    if (existing) {
      // opcionalmente atualiza email/nome, garantindo unicidade do email
      if (email && email !== existing.email) {
        const emailTaken = await prisma.usuario.findUnique({ where: { email } })
        if (emailTaken && emailTaken.id !== existing.id) {
          return NextResponse.json({ error: "Email ja em uso" }, { status: 409 })
        }
      }
      const user = await prisma.usuario.update({
        where: { id: existing.id },
        data: {
          senha: senhaHash,
          email: email || existing.email,
          nome: nome || existing.nome,
        },
        include: { cliente: true },
      })
      return NextResponse.json(user)
    }

    const finalEmail = email || cliente.email
    if (!finalEmail) return NextResponse.json({ error: "Cliente sem email. Informe email." }, { status: 400 })
    const emailTaken = await prisma.usuario.findUnique({ where: { email: finalEmail } })
    if (emailTaken) return NextResponse.json({ error: "Email ja em uso" }, { status: 409 })

    const user = await prisma.usuario.create({
      data: {
        nome: nome || cliente.nome,
        email: finalEmail,
        senha: senhaHash,
        role: "cliente",
        clienteId: cliente.id,
      },
      include: { cliente: true },
    })
    return NextResponse.json(user, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Erro ao criar/atualizar acesso" }, { status: 500 })
  }
}
