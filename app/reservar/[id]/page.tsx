"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, DollarSign, Clock, ArrowLeft, CheckCircle, AlertCircle, Building2 } from "lucide-react"
import { format, addDays } from "date-fns"
import type { Sala } from "@/lib/data"
import Image from "next/image"

// Mapeia imagens locais para cada sala
const getSalaImage = (sala: Sala) => {
  const map: Record<string, string> = {
    // Mapeamento organizado por sala (A, B, C, D)
    "sala-1": "/salas/sala-a.jpeg",
    "sala-2": "/salas/sala-b.jpeg",
    "sala-3": "/salas/sala-c.jpeg",
    "sala-4": "/salas/sala-d.jpeg",
  }
  return map[sala.id] || sala.imagem || "/placeholder.svg?height=200&width=400&query=meeting+room"
}

const horarios = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
]

export default function ReservarSalaPage() {
  const router = useRouter()
  const params = useParams()
  const salaId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [sala, setSala] = useState<Sala | null>(null)

  // Dados do formulÃ¡rio
  const [formData, setFormData] = useState({
    data: "",
    horaInicio: "",
    horaFim: "",
    observacoes: "",
  })

  // sala carregada via API

  useEffect(() => {
    // Verificar se usuÃ¡rio estÃ¡ logado
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Verificar se tem acesso Ã s salas
    if (parsedUser.plano !== "mensalista") {
      router.push("/dashboard")
      return
    }

    // Buscar sala
    fetch(`/api/salas/${salaId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) {
          router.push("/salas")
          return
        }
        setSala(data)
      })
      .finally(() => setLoading(false))

    // Definir data mÃ­nima como hoje
    const hoje = format(new Date(), "yyyy-MM-dd")
    setFormData((prev) => ({ ...prev, data: hoje }))

    setLoading(false)
  }, [router, salaId])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Calcular valor da reserva
  const valorReserva = (() => {
    if (!sala || !formData.horaInicio || !formData.horaFim || !user) return 0
    const inicio = new Date(`2024-01-01T${formData.horaInicio}`)
    const fim = new Date(`2024-01-01T${formData.horaFim}`)
    const horas = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60)
    let total = (sala.valorHora || 0) * horas
    if (user.plano === "mensalista") total *= 0.8
    return total
  })()

  // HorÃ¡rios disponÃ­veis para fim baseado no inÃ­cio
  const horariosDisponiveis = horarios.filter((h) => {
    if (!formData.horaInicio) return true
    return h > formData.horaInicio
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      // ValidaÃ§Ãµes
      if (!formData.data || !formData.horaInicio || !formData.horaFim) {
        setError("Todos os campos obrigatÃ³rios devem ser preenchidos")
        return
      }

      if (formData.horaInicio >= formData.horaFim) {
        setError("HorÃ¡rio de fim deve ser posterior ao horÃ¡rio de inÃ­cio")
        return
      }

      // Verificar se a data nÃ£o Ã© no passado
      const dataReserva = new Date(formData.data)
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      if (dataReserva < hoje) {
        setError("NÃ£o Ã© possÃ­vel reservar para datas passadas")
        return
      }

      // Verificar conflitos
      if (verificarConflito(salaId, formData.data, formData.horaInicio, formData.horaFim)) {
        setError("JÃ¡ existe uma reserva para este horÃ¡rio. Escolha outro horÃ¡rio.")
        return
      }

      // Simular criaÃ§Ã£o da reserva
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setSuccess("Reserva criada com sucesso! VocÃª serÃ¡ redirecionado para o calendÃ¡rio.")

      // Redirecionar apÃ³s 3 segundos
      setTimeout(() => {
        router.push("/calendar")
      }, 3000)
    } catch (err) {
      setError("Erro ao criar reserva. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !sala) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/salas")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar Ã s Salas
              </Button>
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Reservar {sala.nome}</h1>
                  <p className="text-sm text-gray-600">Preencha os dados para sua reserva</p>
                </div>
              </div>
            </div>

            <Badge className="bg-blue-100 text-blue-800">Mensalista</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FormulÃ¡rio de Reserva */}
          <div>
            {/* Mensagens */}
            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Dados da Reserva
                </CardTitle>
                <CardDescription>Preencha as informaÃ§Ãµes para sua reserva</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="data">Data da Reserva *</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data}
                      onChange={(e) => handleInputChange("data", e.target.value)}
                      min={format(new Date(), "yyyy-MM-dd")}
                      max={format(addDays(new Date(), 30), "yyyy-MM-dd")}
                      required
                      disabled={submitting}
                    />
                    <p className="text-xs text-gray-500">Reservas podem ser feitas com atÃ© 30 dias de antecedÃªncia</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="horaInicio">HorÃ¡rio de InÃ­cio *</Label>
                      <Select
                        value={formData.horaInicio}
                        onValueChange={(value) => handleInputChange("horaInicio", value)}
                        required
                        disabled={submitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="InÃ­cio" />
                        </SelectTrigger>
                        <SelectContent>
                          {horarios.map((horario) => (
                            <SelectItem key={horario} value={horario}>
                              {horario}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="horaFim">HorÃ¡rio de Fim *</Label>
                      <Select
                        value={formData.horaFim}
                        onValueChange={(value) => handleInputChange("horaFim", value)}
                        required
                        disabled={submitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Fim" />
                        </SelectTrigger>
                        <SelectContent>
                          {horariosDisponiveis.map((horario) => (
                            <SelectItem key={horario} value={horario}>
                              {horario}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes">ObservaÃ§Ãµes</Label>
                    <Textarea
                      id="observacoes"
                      placeholder="InformaÃ§Ãµes adicionais sobre a reuniÃ£o..."
                      value={formData.observacoes}
                      onChange={(e) => handleInputChange("observacoes", e.target.value)}
                      rows={4}
                      disabled={submitting}
                    />
                  </div>

                  {/* Resumo do Valor */}
                  {valorReserva > 0 && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                            <span className="font-medium text-green-900">Valor Total</span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">R$ {valorReserva.toFixed(2)}</div>
                            <div className="text-xs text-green-700">20% de desconto aplicado (Mensalista)</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting || !formData.data || !formData.horaInicio || !formData.horaFim}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Criando Reserva...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirmar Reserva
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Detalhes da Sala */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{sala.nome}</CardTitle>
                <CardDescription>{sala.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Imagem da sala */}
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={getSalaImage(sala)}
                    alt={sala.nome}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* InformaÃ§Ãµes bÃ¡sicas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Recomendado: 4 pessoas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Máximo: 6 pessoas</span>
                  </div>
                </div>


