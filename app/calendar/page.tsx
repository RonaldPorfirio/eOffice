"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import NextDynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import { CalendarIcon, Grid3X3, List, Eye, Plus, Building2, LogOut, Clock, CheckCircle, TrendingUp } from "lucide-react"

// CalendarGrid sem SSR para evitar hidratação/fuso
const CalendarGrid = NextDynamic(
  () => import("@/components/calendar/calendar-grid").then((m) => m.CalendarGrid),
  { ssr: false }
)

import { BookingModal, type BookingData } from "@/components/calendar/booking-modal"
import type { Reserva, Sala } from "@/lib/data"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// util: converte "YYYY-MM-DD" (string) para Date LOCAL (00:00:00 local)
function parseLocalYmd(ymd: string): Date {
  return new Date(`${ymd}T00:00:00`)
}

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

    // Carrega dados da API
    Promise.all([
      fetch("/api/salas").then((r) => r.json()),
      fetch("/api/reservas").then((r) => r.json()),
    ])
      .then(([salasData, reservasData]) => {
        setSalas(salasData as Sala[])
        // API já devolve data em 'YYYY-MM-DD'; não converta aqui
        setReservas((reservasData || []) as Reserva[])
      })
      .catch(error => {
        console.error('Erro ao carregar dados:', error)
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

    // garantir 'YYYY-MM-DD' para a API (se for Date, montar manualmente)
    let dataYmd: string
    if (typeof bookingData.data === "string") {
      dataYmd = bookingData.data.slice(0, 10)
    } else {
      const dt = new Date((bookingData as any).data)
      const y = dt.getFullYear()
      const m = String(dt.getMonth() + 1).padStart(2, "0")
      const d = String(dt.getDate()).padStart(2, "0")
      dataYmd = `${y}-${m}-${d}`
    }

    const resp = await fetch("/api/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        clienteId: user.id,
        salaId: bookingData.salaId,
        data: dataYmd, // envia somente 'YYYY-MM-DD'
        horaInicio: bookingData.horaInicio,
        horaFim: bookingData.horaFim,
        observacoes: bookingData.observacoes,
        valorTotal,
      }),
    })

    if (resp.ok) {
      // REMENDO RÁPIDO: refetch total (igual ao F5) para padronizar a normalização
      const todas: Reserva[] = await fetch("/api/reservas").then((r) => r.json())
      setReservas(todas)

      setMessage("Reserva criada com sucesso! Aguardando confirmação.")
      setTimeout(() => setMessage(""), 5000)

      // (opcional) criar aviso
      try {
        const titulo = 'Agendamento criado'
        const salaNome = salas.find(s => s.id === bookingData.salaId)?.nome || bookingData.salaId
        const msg = `Reserva em ${dataYmd} ${bookingData.horaInicio}-${bookingData.horaFim} | Sala ${salaNome}`
        await fetch(`/api/clientes/${user.id}/avisos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo, mensagem: msg, tipo: 'info', urgencia: 'baixa' })
        })
      } catch { /* silencioso */ }
    } else if (resp.status === 409) {
      setMessage("Conflito de horário. Escolha outro horário.")
      setTimeout(() => setMessage(""), 5000)
    } else {
      setMessage("Erro ao criar reserva.")
      setTimeout(() => setMessage(""), 5000)
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

  // Exibir todas as reservas para todos os clientes
  const userReservas = reservas;

  // Estatísticas somente do usuário logado
  const stats = {
    total: reservas.filter((r) => r.clienteId === user.id).length,
    confirmadas: reservas.filter((r) => r.clienteId === user.id && r.status === "confirmada").length,
    pendentes: reservas.filter((r) => r.clienteId === user.id && r.status === "pendente").length,
    esteMes: reservas.filter((r) => {
      const reservaDate = parseLocalYmd((r as any).data as string)
      const now = new Date()
      return r.clienteId === user.id && reservaDate.getMonth() === now.getMonth() && reservaDate.getFullYear() === now.getFullYear()
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
                  .filter((r) => parseLocalYmd((r as any).data as string) >= new Date(new Date().toDateString()))
                  .sort((a, b) => parseLocalYmd((a as any).data as string).getTime() - parseLocalYmd((b as any).data as string).getTime())
                  .slice(0, 5)
                  .map((reserva) => {
                    const sala = salas.find((s) => s.id === reserva.salaId)
                    const dataLocal = parseLocalYmd((reserva as any).data as string)
                    return (
                      <div
                        key={reserva.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                        onClick={() => handleEventClick(reserva)}
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-3 h-3 rounded-full ${reserva.status === "confirmada"
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
                              {format(dataLocal, "d 'de' MMM", { locale: ptBR })} • {reserva.horaInicio} - {reserva.horaFim}
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
                    {format(parseLocalYmd((selectedReserva as any).data as string), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
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

                {/* Só permite edição/cancelamento para admin ou criador */}
                {selectedReserva.status === "pendente" && (user.isAdmin || selectedReserva.clienteId === user.id) && (
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
