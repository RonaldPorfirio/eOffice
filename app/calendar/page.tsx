"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"

import { CalendarIcon, Grid3X3, List, Eye, Plus, Building2, LogOut, Clock, CheckCircle, TrendingUp } from "lucide-react"
import { CalendarGrid } from "@/components/calendar/calendar-grid"
import { BookingModal, type BookingData } from "@/components/calendar/booking-modal"
import type { Reserva, Sala } from "@/lib/data"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function CalendarPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [salas, setSalas] = useState<Sala[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Apenas mensalista acessa o calendário
    if (parsedUser.plano !== "mensalista") {
      router.push("/dashboard")
      return
    }

    Promise.all([
      fetch("/api/salas").then((r) => r.json()),
      fetch("/api/reservas/list").then((r) => r.json()),
    ])
      .then(([salasData, reservasData]) => {
        setSalas(salasData)
        const normalized: Reserva[] = (reservasData || []).map((r: any) => ({
          ...r,
          data: format(new Date(r.data), "yyyy-MM-dd"),
        }))
        setReservas(normalized)
      })
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowBookingModal(true)
  }

  const handleEventClick = (reserva: Reserva) => {
    setSelectedReserva(reserva)
    setShowEventModal(true)
  }

  const handleBookingConfirm = async (bookingData: BookingData) => {
    const id = `res-${Date.now()}`
    const sala = salas.find((s) => s.id === bookingData.salaId)
    const inicio = new Date(`2024-01-01T${bookingData.horaInicio}`)
    const fim = new Date(`2024-01-01T${bookingData.horaFim}`)
    const horas = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60)
    let valorTotal = (sala?.valorHora || 0) * horas
    if (user?.plano === "mensalista") valorTotal *= 0.8

    const resp = await fetch("/api/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        clienteId: user.id,
        salaId: bookingData.salaId,
        data: bookingData.data,
        horaInicio: bookingData.horaInicio,
        horaFim: bookingData.horaFim,
        observacoes: bookingData.observacoes,
        valorTotal,
      }),
    })

    if (resp.ok) {
      const criada = await resp.json()
      const criadaNorm: Reserva = { ...criada, data: format(new Date(criada.data), "yyyy-MM-dd") }
      setReservas((prev) => [...prev, criadaNorm])
      setMessage("Reserva criada com sucesso! Aguardando confirmação.")
      setTimeout(() => setMessage("") , 5000)
      try {
        const titulo = 'Agendamento criado'
        const salaNome = salas.find(s=>s.id===bookingData.salaId)?.nome || bookingData.salaId
        const mensagem = `Reserva em ${criadaNorm.data} ${bookingData.horaInicio}-${bookingData.horaFim} | Sala ${salaNome}`
        await fetch(`/api/clientes/${user.id}/avisos`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ titulo, mensagem, tipo:'info', urgencia:'baixa' }) })
      } catch {}
    } else if (resp.status === 409) {
      setMessage("Conflito de horário. Escolha outro horário.")
      setTimeout(() => setMessage("") , 5000)
    } else {
      setMessage("Erro ao criar reserva.")
      setTimeout(() => setMessage("") , 5000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return null

  // Filtrar reservas do usuário
  const userReservas = reservas.filter((r) => r.clienteId === user.id)

  // Estatísticas
  const stats = {
    total: userReservas.length,
    confirmadas: userReservas.filter((r) => r.status === "confirmada").length,
    pendentes: userReservas.filter((r) => r.status === "pendente").length,
    esteMes: userReservas.filter((r) => {
      const reservaDate = new Date(r.data)
      const now = new Date()
      return reservaDate.getMonth() === now.getMonth() && reservaDate.getFullYear() === now.getFullYear()
    }).length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">calendário de Reservas</h1>
                <p className="text-sm text-gray-600">Gerencie suas reservas de salas</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-800">Mensalista</Badge>

              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>Voltar ao Dashboard</Button>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Mensagem de sucesso */}
        {message && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Reservas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.confirmadas}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Este Mês</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.esteMes}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controles do calendário */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>calendário de Salas</CardTitle>
                <CardDescription>Clique em qualquer data para criar uma nova reserva</CardDescription>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setShowBookingModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Reserva
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={view} onValueChange={(v) => setView(v as "month" | "week" | "day")}>
              <TabsList className="flex w-full overflow-x-auto gap-2">
                <TabsTrigger value="month" className="flex items-center min-w-[120px]">
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Mês
                </TabsTrigger>
                <TabsTrigger value="week" className="flex items-center min-w-[120px]">
                  <List className="h-4 w-4 mr-2" />
                  Semana
                </TabsTrigger>
                <TabsTrigger value="day" className="flex items-center min-w-[120px]">
                  <Eye className="h-4 w-4 mr-2" />
                  Dia
                </TabsTrigger>
              </TabsList>

              <TabsContent value="month" className="mt-6">
                <CalendarGrid
                  reservas={userReservas}
                  salas={salas}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                  view="month"
                  currentDate={currentDate}
                  onDateChange={setCurrentDate}
                />
              </TabsContent>

              <TabsContent value="week" className="mt-6">
                <CalendarGrid
                  reservas={userReservas}
                  salas={salas}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                  view="week"
                  currentDate={currentDate}
                  onDateChange={setCurrentDate}
                />
              </TabsContent>

              <TabsContent value="day" className="mt-6">
                <CalendarGrid
                  reservas={userReservas}
                  salas={salas}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                  view="day"
                  currentDate={currentDate}
                  onDateChange={setCurrentDate}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Lista de Próximas Reservas */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Reservas</CardTitle>
            <CardDescription>Suas reservas confirmadas e pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            {userReservas.length > 0 ? (
              <div className="space-y-3">
                {userReservas
                  .filter((r) => new Date(r.data) >= new Date(new Date().toDateString()))
                  .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
                  .slice(0, 5)
                  .map((reserva) => {
                    const sala = salas.find((s) => s.id === reserva.salaId)
                    return (
                      <div
                        key={reserva.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                        onClick={() => handleEventClick(reserva)}
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              reserva.status === "confirmada"
                                ? "bg-green-500"
                                : reserva.status === "pendente"
                                  ? "bg-yellow-500"
                                  : reserva.status === "em-andamento"
                                    ? "bg-blue-500"
                                    : "bg-red-500"
                            }`}
                          />
                          <div>
                            <p className="font-medium">{sala?.nome}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(reserva.data), "d 'de' MMM", { locale: ptBR })} â€¢ {reserva.horaInicio} - {reserva.horaFim}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            reserva.status === "confirmada"
                              ? "default"
                              : reserva.status === "pendente"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {reserva.status}
                        </Badge>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma reserva encontrada</p>
                <p className="text-sm">Clique em uma data no calendário para criar sua primeira reserva</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Nova Reserva */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false)
          setSelectedDate(null)
        }}
        onConfirm={handleBookingConfirm}
        selectedDate={selectedDate}
        salas={salas}
        userPlan={user.plano}
      />

      {/* Modal de Detalhes da Reserva */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Reserva</DialogTitle>
            <DialogDescription>Informações completas sobre sua reserva</DialogDescription>
          </DialogHeader>

          {selectedReserva && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Sala</Label>
                  <p className="font-medium">{salas.find((s) => s.id === selectedReserva.salaId)?.nome}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge
                    className="mt-1"
                    variant={
                      selectedReserva.status === "confirmada"
                        ? "default"
                        : selectedReserva.status === "pendente"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {selectedReserva.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data</Label>
                  <p className="font-medium">
                    {format(new Date(selectedReserva.data), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">horário</Label>
                  <p className="font-medium">
                    {selectedReserva.horaInicio} - {selectedReserva.horaFim}
                  </p>
                </div>
              </div>

              {selectedReserva.observacoes && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Observações</Label>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded-lg">{selectedReserva.observacoes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Valor Total</Label>
                  <p className="text-lg font-bold text-green-600">R$ {selectedReserva.valorTotal.toFixed(2)}</p>
                </div>

                {selectedReserva.status === "pendente" && (
                  <Button variant="outline" size="sm">
                    Cancelar Reserva
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}





