"use client"

import React, { useMemo } from "react"
import {
  addDays,
  addWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  format,
} from "date-fns"
import { ptBR } from "date-fns/locale"

// use os tipos oficiais do projeto para evitar divergência
import type { Reserva as AppReserva, Sala as AppSala } from "@/lib/data"

type View = "month" | "week" | "day"

export interface CalendarGridProps {
  reservas: AppReserva[]
  salas: AppSala[]
  onDateClick: (date: Date) => void
  onEventClick: (reserva: AppReserva) => void
  view: View
  currentDate: Date
  onDateChange: (date: Date) => void
}

/**
 * Nunca use `new Date('YYYY-MM-DD')` direto: o JS trata como UTC e retrocede um dia em -03.
 * Em vez disso:
 *  - Se for 'YYYY-MM-DD', cria Date local com hora 12:00.
 *  - Se vier com 'T...' (sem Z), parse local e fixa ao meio-dia do mesmo Y/M/D.
 *  - Se vier Date, normaliza para o meio-dia local do mesmo dia.
 */
function toLocalNoon(dateInput: string | Date): Date {
  if (dateInput instanceof Date) {
    return new Date(
      dateInput.getFullYear(),
      dateInput.getMonth(),
      dateInput.getDate(),
      12, 0, 0, 0
    )
  }

  const s = String(dateInput)

  // 'YYYY-MM-DD'
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-").map(Number)
    return new Date(y, m - 1, d, 12, 0, 0, 0)
  }

  // 'YYYY-MM-DDTHH:mm(:ss)' (sem Z)
  if (/^\d{4}-\d{2}-\d{2}T/.test(s) && !s.endsWith("Z")) {
    const tmp = new Date(s) // parse local
    return new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate(), 12, 0, 0, 0)
  }

  // fallback
  const tmp = new Date(s)
  return new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate(), 12, 0, 0, 0)
}

function dayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  reservas,
  salas,
  onDateClick,
  onEventClick,
  view,
  currentDate,
  onDateChange,
}) => {
  // Normaliza reservas por dia local (meio-dia) para evitar “voltar um dia”
  const eventosPorDia = useMemo(() => {
    const map = new Map<string, AppReserva[]>()
    for (const r of reservas) {
      const d = toLocalNoon((r as any).data as string | Date)
      const key = dayKey(d)
      const arr = map.get(key) ?? []
      arr.push(r)
      map.set(key, arr)
    }
    return map
  }, [reservas])

  if (view === "day") {
    const dia = toLocalNoon(currentDate)
    const key = dayKey(dia)
    const eventos = (eventosPorDia.get(key) ?? []).sort((a, b) =>
      a.horaInicio.localeCompare(b.horaInicio)
    )

    return (
      <div className="border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b bg-white">
          <div className="font-semibold">
            {format(dia, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
          <div className="space-x-2">
            <button
              className="px-3 py-1 text-sm border rounded-md"
              onClick={() => onDateChange(addDays(currentDate, -1))}
            >
              Anterior
            </button>
            <button
              className="px-3 py-1 text-sm border rounded-md"
              onClick={() => onDateChange(addDays(currentDate, 1))}
            >
              Próximo
            </button>
          </div>
        </div>
        <div className="p-4 bg-gray-50">
          {eventos.length === 0 ? (
            <div className="text-sm text-gray-600">Sem reservas neste dia.</div>
          ) : (
            <ul className="space-y-2">
              {eventos.map((r) => {
                const sala = salas.find((s) => s.id === r.salaId)
                return (
                  <li
                    key={r.id}
                    className="p-3 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer"
                    onClick={() => onEventClick(r)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{sala?.nome ?? r.salaId}</div>
                      <div className="text-sm text-gray-600">
                        {r.horaInicio} – {r.horaFim}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 capitalize">{r.status}</div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    )
  }

  if (view === "week") {
    const inicioSemana = startOfWeek(currentDate, { weekStartsOn: 0 }) // domingo
    const dias = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i))

    return (
      <div className="border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b bg-white">
          <div className="font-semibold">
            Semana de {format(dias[0], "d 'de' MMM", { locale: ptBR })} a{" "}
            {format(dias[6], "d 'de' MMM 'de' yyyy", { locale: ptBR })}
          </div>
          <div className="space-x-2">
            <button
              className="px-3 py-1 text-sm border rounded-md"
              onClick={() => onDateChange(addWeeks(currentDate, -1))}
            >
              Anterior
            </button>
            <button
              className="px-3 py-1 text-sm border rounded-md"
              onClick={() => onDateChange(addWeeks(currentDate, 1))}
            >
              Próximo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-[1px] bg-gray-200">
          {dias.map((d) => {
            const key = dayKey(toLocalNoon(d))
            const eventos = (eventosPorDia.get(key) ?? []).sort((a, b) =>
              a.horaInicio.localeCompare(b.horaInicio)
            )

            return (
              <div key={key} className="bg-white min-h-[140px]">
                <div className="flex items-center justify-between p-2 border-b">
                  <button
                    className={`text-sm font-medium rounded px-1 ${isToday(d) ? "bg-blue-600 text-white" : "text-gray-800"
                      }`}
                    onClick={() => onDateClick(d)}
                  >
                    {format(d, "EEE d", { locale: ptBR })}
                  </button>
                </div>
                <div className="p-2 space-y-1">
                  {eventos.length === 0 ? (
                    <div className="text-xs text-gray-400">—</div>
                  ) : (
                    eventos.map((r) => {
                      const sala = salas.find((s) => s.id === r.salaId)
                      return (
                        <div
                          key={r.id}
                          className="text-xs p-2 rounded border bg-gray-50 hover:bg-gray-100 cursor-pointer"
                          onClick={() => onEventClick(r)}
                          title={`${r.horaInicio}–${r.horaFim} • ${sala?.nome ?? r.salaId}`}
                        >
                          <div className="font-medium truncate">{sala?.nome ?? r.salaId}</div>
                          <div className="text-gray-600">
                            {r.horaInicio} – {r.horaFim}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // view === "month"
  const inicioMes = startOfMonth(currentDate)
  const fimMes = endOfMonth(currentDate)
  const inicioGrade = startOfWeek(inicioMes, { weekStartsOn: 0 })
  const fimGrade = endOfWeek(fimMes, { weekStartsOn: 0 })

  const diasGrade: Date[] = []
  for (let d = inicioGrade; d <= fimGrade; d = addDays(d, 1)) {
    diasGrade.push(d)
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b bg-white">
        <div className="font-semibold">
          {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
        </div>
        <div className="space-x-2">
          <button
            className="px-3 py-1 text-sm border rounded-md"
            onClick={() => onDateChange(addDays(inicioMes, -1))}
          >
            Anterior
          </button>
          <button
            className="px-3 py-1 text-sm border rounded-md"
            onClick={() => onDateChange(addDays(fimMes, 1))}
          >
            Próximo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-xs bg-gray-50 border-b">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
          <div key={d} className="p-2 text-center font-medium text-gray-600">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-[1px] bg-gray-200">
        {diasGrade.map((d) => {
          const inMonth = isSameMonth(d, currentDate)
          const localNoon = toLocalNoon(d)
          const key = dayKey(localNoon)
          const eventos = (eventosPorDia.get(key) ?? []).sort((a, b) =>
            a.horaInicio.localeCompare(b.horaInicio)
          )

          return (
            <div key={key} className={`bg-white min-h-[120px]`}>
              <div className="flex items-center justify-between p-2 border-b">
                <button
                  className={`text-sm font-medium rounded px-1 ${isToday(d) ? "bg-blue-600 text-white" : "text-gray-800"
                    } ${inMonth ? "" : "opacity-40"}`}
                  onClick={() => onDateClick(d)}
                >
                  {format(d, "d", { locale: ptBR })}
                </button>
              </div>
              <div className="p-2 space-y-1">
                {eventos.length === 0 ? (
                  <div className="text-[11px] text-gray-400">—</div>
                ) : (
                  eventos.map((r) => {
                    const sala = salas.find((s) => s.id === r.salaId)
                    return (
                      <div
                        key={r.id}
                        className="text-[11px] p-1.5 rounded border bg-gray-50 hover:bg-gray-100 cursor-pointer"
                        onClick={() => onEventClick(r)}
                        title={`${r.horaInicio}–${r.horaFim} • ${sala?.nome ?? r.salaId}`}
                      >
                        <div className="font-medium truncate">{sala?.nome ?? r.salaId}</div>
                        <div className="text-gray-600">
                          {r.horaInicio} – {r.horaFim}
                        </div>
                        <div className="capitalize text-gray-500">{r.status}</div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
