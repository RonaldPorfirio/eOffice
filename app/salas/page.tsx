"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Building2,
  Users,
  Wifi,
  Monitor,
  Snowflake,
  Calendar,
  Clock,
  DollarSign,
  LogOut,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import type { Sala } from "@/lib/data"
import Image from "next/image"

export default function SalasPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [salas, setSalas] = useState<Sala[]>([])
  useEffect(() => {
    // Verificar se usuário está logado
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Verificar se tem acesso às salas
    if (parsedUser.plano !== "mensalista") {
      router.push("/dashboard")
      return
    }

    fetch("/api/salas").then((r)=>r.json()).then((data)=>setSalas(data)).finally(()=>setLoading(false))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const getResourceIcon = (resource: string) => {
    if (resource.toLowerCase().includes("wi-fi")) return <Wifi className="h-4 w-4" />
    if (resource.toLowerCase().includes("projetor") || resource.toLowerCase().includes("tela"))
      return <Monitor className="h-4 w-4" />
    if (resource.toLowerCase().includes("ar condicionado")) return <Snowflake className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Salas de Reunião</h1>
                  <p className="text-sm text-gray-600">Escolha a sala ideal para sua Reunião</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-800">Mensalista</Badge>

              <Button variant="ghost" size="sm" onClick={() => router.push("/calendar")}>
                <Calendar className="h-4 w-4 mr-2" />
                Ver Calendário
              </Button>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Informações do Plano */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-blue-800">
            <strong>Plano Mensalista:</strong> Você tem acesso completo às salas de Reunião com 20% de desconto em todas
            as reservas!
          </AlertDescription>
        </Alert>

        {/* Grid de Salas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {salas.map((sala) => (
            <Card key={sala.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-100 overflow-hidden">
                <Image
                  src={sala.imagem || "/placeholder.svg?height=200&width=300&query=meeting+room"}
                  alt={sala.nome}
                  width={300}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>

              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{sala.nome}</CardTitle>
                  <Badge variant={sala.disponivel ? "default" : "destructive"}>
                    {sala.disponivel ? "Disponível" : "InDisponível"}
                  </Badge>
                </div>
                <CardDescription>{sala.descricao}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Informações básicas */}
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

                {/* Valor com desconto */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-900">Seu preço (Mensalista)</span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-600">
                        R$ {(sala.valorHora * 0.8).toFixed(2)}/hora
                      </span>
                      <div className="text-xs text-green-700">20% de desconto</div>
                    </div>
                  </div>
                </div>

                {/* Recursos disponíveis */}
                <div>
                  <h4 className="font-medium mb-2">Recursos disponíveis</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {sala.recursos.map((recurso, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {getResourceIcon(recurso)}
                        <span className="text-sm">{recurso}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botão de reserva */}
                <Button
                  className="w-full"
                  onClick={() => router.push(`/reservar/${sala.id}`)}
                  disabled={!sala.disponivel}
                >
                  {sala.disponivel ? (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Reservar Sala
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      InDisponível
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Informações Adicionais */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Políticas de Uso</CardTitle>
              <CardDescription>Regras importantes para o uso das salas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Horário de Funcionamento</p>
                  <p className="text-sm text-gray-600">Segunda a Sexta: 8h às 18h | Sábado: 8h às 12h</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Cancelamento</p>
                  <p className="text-sm text-gray-600">Cancelamento gratuito até 2 horas antes do Horário</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Users className="h-4 w-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Tolerância</p>
                  <p className="text-sm text-gray-600">15 minutos de Tolerância para atraso</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Building2 className="h-4 w-4 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium">Limpeza</p>
                  <p className="text-sm text-gray-600">Mantenha o ambiente limpo e organizado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benefícios do Plano Mensalista</CardTitle>
              <CardDescription>Vantagens exclusivas para mensalistas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <DollarSign className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">20% de Desconto</p>
                  <p className="text-sm text-gray-600">Em todas as reservas de salas</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Calendar className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Reserva Prioritária</p>
                  <p className="text-sm text-gray-600">Acesso antecipado para reservas</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Flexibilidade</p>
                  <p className="text-sm text-gray-600">Alterações até 1 hora antes</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium">Suporte Dedicado</p>
                  <p className="text-sm text-gray-600">Atendimento personalizado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}





