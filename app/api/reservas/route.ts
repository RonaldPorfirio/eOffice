import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, clienteId, salaId, data, horaInicio, horaFim, observacoes, valorTotal } = body
    let { status } = body as { status?: string }

    if (!id || !clienteId || !salaId || !data || !horaInicio || !horaFim) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 })
    }

    // conflito simples por sobreposição
    const existentes = await prisma.reserva.findMany({
      where: { salaId, data: new Date(data), status: { not: "cancelada" } },
    })
    const conflito = existentes.some((r) => {
      const inicioExistente = new Date(`${data}T${r.horaInicio}`)
      const fimExistente = new Date(`${data}T${r.horaFim}`)
      const novoInicio = new Date(`${data}T${horaInicio}`)
      const novoFim = new Date(`${data}T${horaFim}`)
      return (
        (novoInicio >= inicioExistente && novoInicio < fimExistente) ||
        (novoFim > inicioExistente && novoFim <= fimExistente) ||
        (novoInicio <= inicioExistente && novoFim >= fimExistente)
      )
    })
    if (conflito) {
      return NextResponse.json({ error: "Conflito de horário" }, { status: 409 })
    }

    const toDbStatus = (s?: string) => {
      const normalized = (s || "pendente").replace("-", "_")
      const allowed = ["confirmada", "pendente", "cancelada", "em_andamento"] as const
      return (allowed.includes(normalized as any) ? normalized : "pendente") as typeof allowed[number]
    }
    const toClient = (st: string) => (st === "em_andamento" ? "em-andamento" : st)
    const statusDb = toDbStatus(status)

    const reserva = await prisma.reserva.create({
      data: {
        id,
        clienteId,
        salaId,
        data: new Date(data),
        horaInicio,
        horaFim,
        status: statusDb,
        observacoes,
        valorTotal,
        dataReserva: new Date(),
      },
    })
    const json = { ...reserva, status: toClient(reserva.status) }
    return NextResponse.json(json, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Erro ao criar reserva" }, { status: 500 })
  }
}
