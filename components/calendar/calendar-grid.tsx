"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isSameMonth,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Reserva, Sala } from "@/lib/data"

interface CalendarGridProps {
  reservas: Reserva[]
  salas: Sala[]
  onDateClick: (date: Date) => void
  onEventClick: (reserva: Reserva) => void
  view: "month" | "week" | "day"
  currentDate: Date
  onDateChange: (date: Date) => void
  isAdmin?: boolean
}

export function CalendarGrid({
  reservas,
  salas,
  onDateClick,
  onEventClick,
  view,
  currentDate,
  onDateChange,
  isAdmin = false,
}: CalendarGridProps) {
  const navigateDate = (direction: "prev" | "next") => {
    if (view === "month") {
      onDateChange(direction === "next" ? addMonths(currentDate, 1) : subMonths(currentDate, 1))
    } else if (view === "week") {
      onDateChange(direction === "next" ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1))
    } else {
      onDateChange(direction === "next" ? addDays(currentDate, 1) : subDays(currentDate, 1))
    }
  }

  const getDateRange = () => {
    if (view === "month") {
      const start = startOfWeek(startOfMonth(currentDate))
      const end = endOfWeek(endOfMonth(currentDate))
      return eachDayOfInterval({ start, end })
    } else if (view === "week") {
      const start = startOfWeek(currentDate)
      const end = endOfWeek(currentDate)
      return eachDayOfInterval({ start, end })
    } else {
      return [currentDate]
    }
  }

  const getReservasForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return reservas.filter((reserva) => reserva.data === dateStr)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmada":
        return "bg-green-100 text-green-800 border-green-200"
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "em-andamento":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "cancelada":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSalaName = (salaId: string) => {
    return salas.find((s) => s.id === salaId)?.nome || "Sala não encontrada"
  }

  const dates = getDateRange()

  return (
    <div className="space-y-4">
      {/* Header de Navegação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate("prev")}
            className="border-orange-500 text-orange-500 hover:bg-orange-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <h2 className="text-lg font-semibold text-black">
            {view === "month" && format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
            {view === "week" &&
              `${format(startOfWeek(currentDate), "d 'de' MMM", { locale: ptBR })} - ${format(endOfWeek(currentDate), "d 'de' MMM 'de' yyyy", { locale: ptBR })}`}
            {view === "day" && format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </h2>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate("next")}
            className="border-orange-500 text-orange-500 hover:bg-orange-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onDateChange(new Date())}
          className="border-orange-500 text-orange-500 hover:bg-orange-50"
        >
          Hoje
        </Button>
      </div>

      {/* Grid do Calendário */}
      {view === "month" && (
        <div className="grid grid-cols-7 gap-1">
          {/* Cabeçalho dos dias da semana */}
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200"
            >
              {day}
            </div>
          ))}

          {/* Dias do mês */}
          {dates.map((date) => {
            const reservasDate = getReservasForDate(date)
            const isCurrentMonth = isSameMonth(date, currentDate)
            const isToday = isSameDay(date, new Date())

            return (
              <Card
                key={date.toISOString()}
                className={`min-h-[120px] cursor-pointer transition-colors border-gray-200 ${
                  isCurrentMonth ? "bg-white hover:bg-orange-50" : "bg-gray-50 hover:bg-gray-100"
                } ${isToday ? "ring-2 ring-orange-500" : ""}`}
                onClick={() => onDateClick(date)}
              >
                <CardContent className="p-2">
                  <div
                    className={`text-sm font-medium mb-2 ${
                      isCurrentMonth ? (isToday ? "text-orange-600" : "text-black") : "text-gray-400"
                    }`}
                  >
                    {format(date, "d")}
                  </div>

                  <div className="space-y-1">
                    {reservasDate.slice(0, 3).map((reserva) => (
                      <div
                        key={reserva.id}
                        className="text-xs p-1 rounded cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: isAdmin ? "#f97316" : "#22c55e", color: "white" }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick(reserva)
                        }}
                      >
                        <div className="font-medium truncate">{getSalaName(reserva.salaId)}</div>
                        <div className="truncate">
                          {reserva.horaInicio} - {reserva.horaFim}
                        </div>
                      </div>
                    ))}

                    {reservasDate.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">+{reservasDate.length - 3} mais</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {view === "week" && (
        <div className="space-y-2">
          {dates.map((date) => {
            const reservasDate = getReservasForDate(date)
            const isToday = isSameDay(date, new Date())

            return (
              <Card
                key={date.toISOString()}
                className={`cursor-pointer transition-colors border-gray-200 hover:bg-orange-50 ${
                  isToday ? "ring-2 ring-orange-500" : ""
                }`}
                onClick={() => onDateClick(date)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-medium ${isToday ? "text-orange-600" : "text-black"}`}>
                      {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                    </h3>
                    <Badge variant="outline" className="border-gray-300 text-gray-600">
                      {reservasDate.length} reserva{reservasDate.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {reservasDate.map((reserva) => (
                      <div
                        key={reserva.id}
                        className="p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick(reserva)
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-black">{getSalaName(reserva.salaId)}</span>
                          <Badge size="sm" className={getStatusColor(reserva.status)}>
                            {reserva.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          {reserva.horaInicio} - {reserva.horaFim}
                        </div>
                      </div>
                    ))}

                    {reservasDate.length === 0 && <div className="text-sm text-gray-500 italic">Nenhuma reserva</div>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {view === "day" && (
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-black">
                {format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </h3>
              <Button onClick={() => onDateClick(currentDate)} className="bg-orange-500 hover:bg-orange-600 text-white">
                <Calendar className="h-4 w-4 mr-2" />
                Nova Reserva
              </Button>
            </div>

            <div className="space-y-4">
              {getReservasForDate(currentDate).length > 0 ? (
                getReservasForDate(currentDate).map((reserva) => (
                  <div
                    key={reserva.id}
                    className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => onEventClick(reserva)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-black">{getSalaName(reserva.salaId)}</h4>
                      <Badge className={getStatusColor(reserva.status)}>{reserva.status}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {reserva.horaInicio} - {reserva.horaFim}
                    </div>
                    {reserva.observacoes && <div className="text-sm text-gray-500 italic">{reserva.observacoes}</div>}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma reserva para este dia</p>
                  <p className="text-sm">Clique no botão acima para criar uma nova reserva</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
