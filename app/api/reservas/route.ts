import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { format } from "date-fns"

/**
 * Lista reservas.
 * Devolve a data SEM fuso, como 'YYYY-MM-DD', para o front tratar sempre como local.
 */
export async function GET() {
  try {
    const reservas = await prisma.reserva.findMany()

    const mapped = reservas.map((r: any) => ({
      id: r.id,
      clienteId: r.clienteId,
      salaId: r.salaId,
      // Sempre normalize para 'yyyy-MM-dd' (sem UTC) ao enviar ao front
      data:
        r.data instanceof Date
          ? format(r.data, "yyyy-MM-dd")
          : format(new Date(r.data), "yyyy-MM-dd"),
      horaInicio: r.horaInicio,
      horaFim: r.horaFim,
      observacoes: r.observacoes,
      status: r.status === "em_andamento" ? "em-andamento" : r.status,
      valorTotal: r.valorTotal,
      dataReserva: r.dataReserva,
    }))

    return NextResponse.json(mapped)
  } catch (e) {
    console.error("Erro ao listar reservas:", e)
    return NextResponse.json({ error: "Erro ao listar reservas" }, { status: 500 })
  }
}

/**
 * Cria reserva.
 * Espera receber `data` como 'YYYY-MM-DD' (sem Z/UTC).
 * Salva como Date local (00:00:00 local) para não “voltar” um dia no Brasil.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      id,
      clienteId,
      salaId,
      data,
      horaInicio,
      horaFim,
      observacoes,
      valorTotal,
      status = "pendente",
    } = body

    // Validações básicas
    if (!clienteId || !salaId || !data || !horaInicio || !horaFim) {
      return NextResponse.json(
        { error: "Campos obrigatórios: clienteId, salaId, data, horaInicio, horaFim" },
        { status: 400 },
      )
    }

    // `data` vem como 'YYYY-MM-DD' → monta Date LOCAL (meia-noite local)
    const [year, month, day] = (data as string).split("-").map(Number)
    const dataLocal = new Date(year, month - 1, day, 0, 0, 0)

    // Verificar conflito de horário
    const conflito = await prisma.reserva.findFirst({
      where: {
        salaId,
        data: dataLocal,
        status: { not: "cancelada" },
        OR: [
          { AND: [{ horaInicio: { lte: horaInicio } }, { horaFim: { gt: horaInicio } }] },
          { AND: [{ horaInicio: { lt: horaFim } }, { horaFim: { gte: horaFim } }] },
          { AND: [{ horaInicio: { gte: horaInicio } }, { horaFim: { lte: horaFim } }] },
        ],
      },
    })

    if (conflito) {
      return NextResponse.json(
        { error: "Conflito de horário. Já existe uma reserva neste período." },
        { status: 409 },
      )
    }

    // Criar a reserva
    const reserva = await prisma.reserva.create({
      data: {
        id: id || `res-${Date.now()}`,
        clienteId,
        salaId,
        data: dataLocal,
        horaInicio,
        horaFim,
        observacoes: observacoes || null,
        valorTotal: valorTotal || 0,
        status: status === "em-andamento" ? "em_andamento" : status,
        dataReserva: new Date(),
      },
    })

    // Retornar com status e data normalizados (data em 'YYYY-MM-DD', sem UTC)
    const reservaNormalizada = {
      ...reserva,
      data: format(reserva.data, "yyyy-MM-dd"),
      status: reserva.status === "em_andamento" ? "em-andamento" : reserva.status,
    }

    return NextResponse.json(reservaNormalizada, { status: 201 })
  } catch (e) {
    console.error("Erro ao criar reserva:", e)
    return NextResponse.json({ error: "Erro ao criar reserva" }, { status: 500 })
  }
}
