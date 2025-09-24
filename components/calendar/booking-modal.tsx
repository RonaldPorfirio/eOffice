"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Users, Wifi, Monitor, Coffee, AlertCircle, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Sala } from "@/lib/data"

export interface BookingData {
  salaId: string
  data: string
  horaInicio: string
  horaFim: string
  observacoes?: string
  clienteId?: string
  valorTotal?: number
  audiencia?: boolean
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: BookingData) => void
  selectedDate: Date | null
  salas: Sala[]
  userPlan: string
  isAdmin?: boolean
  clientes?: { id: string; nome: string; plano: string }[]
}

export function BookingModal({
  isOpen,
  onClose,
  onConfirm,
  selectedDate,
  salas,
  userPlan,
  isAdmin = false,
  clientes = [],
}: BookingModalProps) {
  const [selectedSala, setSelectedSala] = useState<string>("")
  const [selectedCliente, setSelectedCliente] = useState<string>("")
  const [horaInicio, setHoraInicio] = useState<string>("")
  const [horaFim, setHoraFim] = useState<string>("")
  const [observacoes, setObservacoes] = useState<string>("")
  const [audiencia, setAudiencia] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (isOpen) {
      setSelectedSala("")
      setSelectedCliente("")
      setHoraInicio("")
      setHoraFim("")
      setObservacoes("")
      setAudiencia(false)
      setError("")
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && isAdmin && !selectedCliente && clientes.length > 0) {
      setSelectedCliente(clientes[0].id)
    }
  }, [isOpen, isAdmin, clientes, selectedCliente])

  const selectedSalaData = salas.find((s) => s.id === selectedSala)

  const getSalaImage = (s: Sala | undefined) => {
    if (!s) return "/placeholder.svg"
    const map: Record<string, string> = {
      "sala-1": "/salas/sala-a.jpeg",
      "sala-2": "/salas/sala-b.jpeg",
      "sala-3": "/salas/sala-c.jpeg",
      "sala-4": "/salas/sala-d.jpeg",
    }
    return map[s.id] || s.imagem || "/placeholder.svg"
  }
  const getSalaLetter = (id?: string) => {
    const map: Record<string, string> = { 'sala-1': 'A', 'sala-2': 'B', 'sala-3': 'C', 'sala-4': 'D' }
    return id ? (map[id] || id) : ""
  }

  const valorEstimado = (() => {
    if (!selectedSalaData || !horaInicio || !horaFim) return 0
    const inicio = new Date(`2024-01-01T${horaInicio}`)
    const fim = new Date(`2024-01-01T${horaFim}`)
    const horas = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60)
    let total = (selectedSalaData?.valorHora || 0) * horas
    if (userPlan === "mensalista") total *= 0.8
    return total
  })()

  const getResourceIcon = (resource: string) => {
    switch (resource.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-4 w-4" />
      case "projetor":
        return <Monitor className="h-4 w-4" />
      case "coffee":
      case "café":
        return <Coffee className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (!selectedSala || !horaInicio || !horaFim) {
        setError("Por favor, preencha todos os campos obrigatórios")
        return
      }
      if (isAdmin && !selectedCliente) {
        setError("Por favor, selecione um cliente")
        return
      }
      const dataStr = format(selectedDate ?? new Date(), "yyyy-MM-dd", { locale: ptBR })
      onConfirm({
        salaId: selectedSala,
        data: dataStr,
        horaInicio,
        horaFim,
        observacoes: observacoes || undefined,
        clienteId: isAdmin ? selectedCliente : undefined,
        audiencia,
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const horarios = [
    "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
    "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
    "16:00","16:30","17:00","17:30","18:00","18:30",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-black">{isAdmin ? "Nova Reserva - Admin" : "Nova Reserva"}</DialogTitle>
          <DialogDescription className="text-gray-600">
            {selectedDate && `Reserva para ${format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isAdmin && (
                <div className="space-y-2">
                  <Label className="text-black">Cliente *</Label>
                  <Select value={selectedCliente} onValueChange={setSelectedCliente}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nome} - {c.plano}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-black">Sala *</Label>
                <Select value={selectedSala} onValueChange={setSelectedSala}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Selecione uma sala" />
                  </SelectTrigger>
                  <SelectContent>
                    {salas.map((s) => {
                      const map: Record<string,string> = { 'sala-1':'A', 'sala-2':'B', 'sala-3':'C', 'sala-4':'D' }
                      const label = map[s.id] ? `Sala ${map[s.id]}` : s.nome
                      return <SelectItem key={s.id} value={s.id}>{label}</SelectItem>
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-black">Hora Início *</Label>
                  <Select value={horaInicio} onValueChange={setHoraInicio}>
                    <SelectTrigger className="border-gray-300"><SelectValue placeholder="Início"/></SelectTrigger>
                    <SelectContent>
                      {horarios.map((h)=> (<SelectItem key={h} value={h}>{h}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-black">Hora Fim *</Label>
                  <Select value={horaFim} onValueChange={setHoraFim}>
                    <SelectTrigger className="border-gray-300"><SelectValue placeholder="Fim"/></SelectTrigger>
                    <SelectContent>
                      {horarios.map((h)=> (<SelectItem key={h} value={h}>{h}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-black">Observações</Label>
                <Textarea value={observacoes} onChange={(e)=>setObservacoes(e.target.value)} rows={3} className="border-gray-300" />
              </div>

              <div className="flex items-center gap-2">
                <input id="audiencia" type="checkbox" checked={audiencia} onChange={(e)=>setAudiencia(e.target.checked)} />
                <Label htmlFor="audiencia" className="text-black">Audiência</Label>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white">
                  {loading ? "Criando..." : "Confirmar Reserva"}
                </Button>
              </div>
            </form>
          </div>

          {/* Detalhes da Sala */}
          <div className="space-y-4">
            {selectedSalaData ? (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-black">Sala {getSalaLetter(selectedSalaData.id)}</CardTitle>
                  <CardDescription className="text-gray-600">Sala com infraestrutura completa para reuniões.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                    <img src={getSalaImage(selectedSalaData)} alt={selectedSalaData.nome} className="w-full h-full object-cover rounded-lg" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2"><Users className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Recomendado: 4 pessoas</span>
                    </div>
                    <div className="flex items-center space-x-2"><Users className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Máximo: 6 pessoas</span>
                    </div>
                  </div>

                  {/* Descrição da Sala */}
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-medium text-black mb-2">Descrição da Sala</h4>
                    <p className="text-sm text-gray-700 mb-2">Sala {getSalaLetter(selectedSalaData.id)} — infraestrutura padronizada:</p>
                    <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                      <li><span className="font-medium">Ar Condicionado</span> — Climatização controlada</li>
                      <li><span className="font-medium">Móveis Planejados</span> — Mesa de reunião e cadeiras executivas</li>
                      <li><span className="font-medium">Decoração Moderna</span> — Ambiente profissional e acolhedor</li>
                      <li><span className="font-medium">Wi‑Fi de Alta Velocidade</span> — Internet rápida e estável</li>
                      <li><span className="font-medium">Para apresentações e videoconferências</span></li>
                      <li><span className="font-medium">Iluminação Natural</span> — Amplas janelas com vista panorâmica</li>
                    </ul>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="text-sm text-gray-700">Recomendado: 4 pessoas</div>
                      <div className="text-sm text-gray-700">Máximo: 6 pessoas</div>
                    </div>
                  </div>

                  {valorEstimado > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-orange-900">Valor Estimado:</span>
                        <span className="text-lg font-bold text-orange-600">R$ {valorEstimado.toFixed(2)}</span>
                      </div>
                      {userPlan === "mensalista" && (
                        <p className="text-xs text-orange-700 mt-1">* Desconto de 20% aplicado para mensalistas</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-gray-200">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Selecione uma sala para ver os detalhes</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

