// app/api/auth/login/route.ts
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

// Garanta que esta rota NÃO rode no Edge
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Opcional: evite qualquer cache
export const revalidate = 0

type LoginBody = {
  email?: string
  senha?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LoginBody
    const email = (body.email || "").trim().toLowerCase()
    const senha = body.senha || ""

    // validações básicas
    if (!email || !senha) {
      return NextResponse.json(
        { error: "Informe e-mail e senha." },
        { status: 400 }
      )
    }

    // busca usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      // Se precisar de dados do cliente para preencher plano depois:
      select: {
        id: true,
        nome: true,
        email: true,
        senha: true,
        role: true,       // 'admin' | 'cliente'
        clienteId: true,  // pode ser null
      },
    })

    // não achou
    if (!usuario) {
      // log leve pra debug sem vazar senha
      console.error("[AUTH] Usuario não encontrado:", email)
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 }
      )
    }

    // compara senha (bcryptjs funciona em serverless/Node)
    const ok = await bcrypt.compare(senha, usuario.senha)
    if (!ok) {
      console.error("[AUTH] Senha incorreta para:", email)
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 }
      )
    }

    // Monta objeto esperado pelo front:
    // - Você usa `user.tipo` (admin/cliente) e, no calendário, verifica `user.plano`
    //   quando o tipo é cliente. Para admin, o AdminPage espera `parsed.tipo === "admin"`.
    let payload: any = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.role, // "admin" | "cliente"
    }

    if (usuario.role === "cliente" && usuario.clienteId) {
      // busca o cliente para trazer o plano (comercial/fiscal/mensalista)
      const cliente = await prisma.cliente.findUnique({
        where: { id: usuario.clienteId },
        select: { id: true, plano: true },
      })

      // Plano é usado no calendário do cliente
      payload = {
        ...payload,
        clienteId: cliente?.id ?? usuario.clienteId,
        plano: cliente?.plano ?? "mensalista", // fallback conservador
      }
    } else {
      // Admin: alguns trechos checam isAdmin/tipo; aqui mantemos 'tipo'
      payload = {
        ...payload,
        isAdmin: true, // se há algum trecho antigo lendo isso
      }
    }

    // Retorna JSON consumido pelo front (ele faz localStorage.setItem("user", ...))
    return NextResponse.json(payload, { status: 200 })
  } catch (err: any) {
    // Loga stack no runtime da Vercel para você ver nos Logs
    console.error("[AUTH] Erro inesperado no login:", {
      message: err?.message,
      stack: err?.stack,
    })
    return NextResponse.json(
      { error: "Erro interno ao autenticar." },
      { status: 500 }
    )
  }
}
