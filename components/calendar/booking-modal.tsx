"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
// Sem dependência de dados mockados; cálculo e verificação via props/API

export interface BookingData {
  salaId: string
  data: string
  horaInicio: string
  horaFim: string
  observacoes?: string
  clienteId?: string
  valorTotal?: number
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
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setSelectedSala("")
      setSelectedCliente("")
      setHoraInicio("")
      setHoraFim("")
      setObservacoes("")
      setError("")
    }
  }, [isOpen])

  // Para admin, pré-seleciona o primeiro cliente para evitar bloqueio
  useEffect(() => {
    if (isOpen && isAdmin && !selectedCliente && clientes && clientes.length > 0) {
      setSelectedCliente(clientes[0].id)
    }
  }, [isOpen, isAdmin, clientes, selectedCliente])

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

      const dataStr = format(selectedDate ?? new Date(), "yyyy-MM-dd")
      // Validar horários
      const inicio = new Date(`2024-01-01T${horaInicio}`)
      const fim = new Date(`2024-01-01T${horaFim}`)

      if (fim <= inicio) {
        setError("O horário de fim deve ser posterior ao horário de início")
        return
      }

      const bookingData: BookingData = {
        salaId: selectedSala,
        data: dataStr,
        horaInicio,
        horaFim,
        observacoes: observacoes || undefined,
        clienteId: isAdmin ? selectedCliente : undefined,
      }

      onConfirm(bookingData)
      onClose()
    } catch (err) {
      setError("Erro ao criar reserva. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const selectedSalaData = salas.find((s) => s.id === selectedSala)
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
                  <Label htmlFor="cliente" className="text-black">
                    Cliente *
                  </Label>
                  <Select value={selectedCliente} onValueChange={setSelectedCliente}>
                    <SelectTrigger className="border-gray-300 focus:border-orange-500">
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome} - {cliente.plano}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="sala" className="text-black">
                  Sala *
                </Label>
                <Select value={selectedSala} onValueChange={setSelectedSala}>
                  <SelectTrigger className="border-gray-300 focus:border-orange-500">
                    <SelectValue placeholder="Selecione uma sala" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {salas
                      .filter((s) => s.disponivel)
                      .map((sala) => (
                        <SelectItem key={sala.id} value={sala.id}>
                          {sala.nome} - {sala.capacidade} pessoas
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horaInicio" className="text-black">
                    Hora Início *
                  </Label>
                  <Input
                    id="horaInicio"
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="border-gray-300 focus:border-orange-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaFim" className="text-black">
                    Hora Fim *
                  </Label>
                  <Input
                    id="horaFim"
                    type="time"
                    value={horaFim}
                    onChange={(e) => setHoraFim(e.target.value)}
                    className="border-gray-300 focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-black">
                  Observações
                </Label>
                <Textarea
                  id="observacoes"
                  placeholder="Informações adicionais sobre a reserva..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="border-gray-300 focus:border-orange-500"
                  rows={3}
                />
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Criando...
                    </>
                  ) : (
                    "Confirmar Reserva"
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Detalhes da Sala */}
          <div className="space-y-4">
            {selectedSalaData ? (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-black">{selectedSalaData.nome}</CardTitle>
                  <CardDescription className="text-gray-600">{selectedSalaData.descricao}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                    <img
                      src={selectedSalaData.imagem || "/placeholder.svg"}
                      alt={selectedSalaData.nome}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Até {selectedSalaData.capacidade} pessoas</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-600">{selectedSalaData.area}m²</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-black mb-2">Recursos Inclusos</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSalaData.recursos.map((resource, index) => (
                        <Badge key={index} variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                          <span className="mr-1">{getResourceIcon(resource)}</span>
                          {resource}
                        </Badge>
                      ))}
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

            {/* Resumo da Reserva */}
            {selectedDate && selectedSala && horaInicio && horaFim && (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-black">Resumo da Reserva</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium text-black">
                      {format(selectedDate, "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Horário:</span>
                    <span className="font-medium text-black">
                      {horaInicio} - {horaFim}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duração:</span>
                    <span className="font-medium text-black">
                      {(() => {
                        const inicio = new Date(`2024-01-01T${horaInicio}`)
                        const fim = new Date(`2024-01-01T${horaFim}`)
                        const horas = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60)
                        return `${horas}h`
                      })()}
                    </span>
                  </div>
                  {selectedSalaData && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sala:</span>
                      <span className="font-medium text-black">{selectedSalaData.nome}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}





