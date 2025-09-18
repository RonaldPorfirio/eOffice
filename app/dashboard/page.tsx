"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Calendar, Mail, AlertTriangle, CheckCircle, LogOut, User, FileText, Bell, ArrowRight, Eye } from "lucide-react"
import { RoomView } from "@/components/room-view"
import { getPlanoInfo } from "@/lib/data"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

const safeFormatDate = (value?: string | Date, fmt = "d 'de' MMM 'de' yyyy") => {
  if (!value) return "-"
  const d = new Date(value)
  return isNaN(d.getTime()) ? "-" : format(d, fmt, { locale: ptBR })
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dReservas, setDReservas] = useState<any[]>([])
  const [dCorrespondencias, setDCorrespondencias] = useState<any[]>([])
  const [dAudiencias, setDAudiencias] = useState<any[]>([])
  const [dAvisos, setDAvisos] = useState<any[]>([])
  const [dSalas, setDSalas] = useState<any[]>([])
  const [dCliente, setDCliente] = useState<any | null>(null)
  const [clearing, setClearing] = useState(false)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  useEffect(() => {
    // Verificar se usuário está logado
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.tipo === "admin") {
      router.push("/admin")
      return
    }

    setUser(parsedUser)

    Promise.all([
      fetch(`/api/clientes/${parsedUser.id}/reservas`).then((r) => r.json()),
      fetch(`/api/clientes/${parsedUser.id}/correspondencias`).then((r) => r.json()),
      fetch(`/api/clientes/${parsedUser.id}/audiencias`).then((r) => r.json()),
      fetch(`/api/clientes/${parsedUser.id}/avisos`).then((r) => r.json()),
      fetch(`/api/salas`).then((r) => r.json()),
      fetch(`/api/clientes`).then((r) => r.json()),
    ])
      .then(([resv, corr, aud, avs, salas, clientes]) => {
        setDReservas(resv || [])
        setDCorrespondencias(corr || [])
        setDAudiencias(aud || [])
        setDAvisos(avs || [])
        setDSalas(salas || [])
        setDCliente((clientes || []).find((c: any) => c.id === parsedUser.id) || null)
      })
      .finally(() => setLoading(false))
  }, [router])

  // Atualiza avisos periodicamente para refletir novas correspondências criadas no admin
  useEffect(() => {
    if (!user) return
    let stopped = false
    const load = () => {
      fetch(`/api/clientes/${user.id}/avisos`).then((r) => r.json()).then((avs) => {
        if (!stopped) setDAvisos(avs || [])
      }).catch(() => {})
    }
    load()
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    const iv = setInterval(load, 15000)
    return () => { stopped = true; window.removeEventListener('focus', onFocus); clearInterval(iv) }
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const cliente = dCliente || { id: user.id, nome: user.nome, plano: user.plano }
  const reservas = dReservas
  const correspondencias = dCorrespondencias
  const audiencias = dAudiencias
  const avisos = dAvisos
  const planoInfo = getPlanoInfo(user.plano)

  const podeReservarSalas = user.plano === 'mensalista'
  const temAcessoAudiencias = user.plano === 'mensalista'

  // Estatísticas
  const stats = {
    reservas: reservas.length,
    correspondenciasPendentes: correspondencias.filter((c) => c.status === "aguardando").length,
    audienciasPendentes: audiencias.filter((a) => a.status === "agendada").length,
    avisosNaoLidos: avisos.filter((a) => !a.lido).length,
  }

  const handleClearAvisos = async () => {
    if (!user) return
    setClearing(true)
    try {
      const r = await fetch(`/api/clientes/${user.id}/avisos`, { method: 'DELETE' })
      if (r.ok) {
        setDAvisos([])
      }
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-xl font-bold text-black">eOffice 1321</h1>
                <p className="text-sm text-gray-600">Dashboard do Cliente</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className={planoInfo.cor}>{planoInfo.nome}</Badge>

              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-600 hover:text-black">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Boas-vindas */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Olá, {user.nome}!</h1>
          <p className="text-gray-600">Bem-vindo ao seu painel de controle do eOffice 1321.</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {podeReservarSalas && (
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reservas</p>
                    <p className="text-2xl font-bold text-black">{stats.reservas}</p>
                    <p className="text-xs text-orange-600">Este mês</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Correspondências</p>
                  <p className="text-2xl font-bold text-black">{correspondencias.length}</p>
                  <p className="text-xs text-red-600">{stats.correspondenciasPendentes} pendentes</p>
                </div>
                <Mail className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          {temAcessoAudiencias && (
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Audiências</p>
                    <p className="text-2xl font-bold text-black">{audiencias.length}</p>
                    <p className="text-xs text-orange-600">{stats.audienciasPendentes} agendadas</p>
                  </div>
                  <FileText className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avisos</p>
                  <p className="text-2xl font-bold text-black">{avisos.length}</p>
                  <p className="text-xs text-red-600">{stats.avisosNaoLidos} não lidos</p>
                </div>
                <Bell className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-black">Ações Rápidas</CardTitle>
              <CardDescription className="text-gray-600">Acesso rápido às principais funcionalidades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {podeReservarSalas && (
                <Button
                  className="w-full justify-between bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => router.push("/calendar")}
                >
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Calendário de Salas
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}

              <Button
                className="w-full justify-between bg-transparent border-orange-500 text-orange-500 hover:bg-orange-50"
                variant="outline"
                onClick={() => router.push("/correspondencias")}
              >
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Correspondências
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>

              {temAcessoAudiencias && (
                <Button
                  className="w-full justify-between bg-transparent border-orange-500 text-orange-500 hover:bg-orange-50"
                  variant="outline"
                  onClick={() => router.push("/audiencias")}
                >
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Audiências
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}

              <Button
                className="w-full justify-between bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50"
                variant="outline"
                onClick={() => router.push("/perfil")}
              >
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-black">Informações do Plano</CardTitle>
              <CardDescription className="text-gray-600">Detalhes da sua assinatura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-black">Plano Atual:</span>
                  <Badge className={planoInfo.cor}>{planoInfo.nome}</Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-black">Benefícios Inclusos:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {planoInfo.beneficios.map((beneficio, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                        {beneficio}
                      </li>
                    ))}
                  </ul>
                </div>

                {cliente && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Cliente desde: {safeFormatDate(cliente?.dataInicio, "d 'de' MMM 'de' yyyy")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {correspondencias.length > 0 && (
            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-black">
                    <Bell className="h-5 w-5 mr-2" />
                    Avisos Recentes
                  </CardTitle>
                  {avisos.length > 0 && (
                    <Button size="sm" variant="outline" onClick={()=>setConfirmClearOpen(true)} disabled={clearing}>
                      {clearing ? 'Limpando...' : 'Limpar'}
                    </Button>
                  )}
                </div>
                <CardDescription className="text-gray-600">Últimas notificações importantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {avisos.slice(0, 3).map((aviso) => (
                    <div
                      key={aviso.id}
                      className={`p-3 rounded-lg border ${
                        aviso.urgencia === "alta"
                          ? "bg-red-50 border-red-200"
                          : aviso.urgencia === "media"
                            ? "bg-orange-50 border-orange-200"
                            : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-black">{aviso.titulo}</p>
                          <p className="text-xs text-gray-600 mt-1">{aviso.mensagem}</p>
                          <p className="text-xs text-gray-500 mt-2">{safeFormatDate(aviso?.dataEnvio, "d 'de' MMM")}</p>
                        </div>
                        {!aviso.lido && <div className="w-2 h-2 bg-orange-500 rounded-full mt-1"></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs com Detalhes */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Atividades e Informações</CardTitle>
            <CardDescription className="text-gray-600">{podeReservarSalas ? "Acompanhe suas atividades e conheça nossa sala" : "Acompanhe suas atividades"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="correspondencias" className="w-full">
              <TabsList className={`grid w-full ${podeReservarSalas ? "grid-cols-4" : "grid-cols-1"} bg-gray-100`}>
                <TabsTrigger
                  value="correspondencias"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  Correspondências
                </TabsTrigger>
                {podeReservarSalas && (
                  <>
                    <TabsTrigger
                      value="reservas"
                      className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                    >
                      Reservas
                    </TabsTrigger>
                    <TabsTrigger
                      value="room-view"
                      className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar Sala
                    </TabsTrigger>
                  </>
                )}
                {temAcessoAudiencias && (
                  <TabsTrigger
                    value="audiencias"
                    className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                  >
                    Audiências
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="correspondencias" className="space-y-4">
                {correspondencias.length > 0 ? (
                  correspondencias.slice(0, 5).map((corresp) => (
                    <div
                      key={corresp.id}
                      className="flex items-center justify-between p-4 border rounded-lg border-gray-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            corresp.urgente ? "bg-red-100" : "bg-orange-100"
                          }`}
                        >
                          <Mail className={`h-5 w-5 ${corresp.urgente ? "text-red-600" : "text-orange-600"}`} />
                        </div>
                        <div>
                          <p className="font-medium text-black">{corresp.remetente}</p>
                          <p className="text-sm text-gray-600 capitalize">
                            {corresp.tipo} • {corresp.dataRecebimento}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {corresp.urgente && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        <Badge
                          variant={corresp.status === "aguardando" ? "destructive" : "default"}
                          className={
                            corresp.status === "aguardando"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-green-100 text-green-800 border-green-200"
                          }
                        >
                          {corresp.status}
                        </Badge>
                        {corresp.status === 'aguardando' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async ()=>{
                              const r = await fetch(`/api/correspondencias/${corresp.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status: 'coletada' }) })
                              if (r.ok) {
                                const u = await r.json()
                                setDCorrespondencias((prev)=>prev.map((x:any)=>x.id===u.id?u:x))
                                // também refletir nos avisos locais, removendo os relacionados a esta correspondência
                                setDAvisos((prev)=>prev.filter((a:any)=>!(a.titulo==='Nova correspondencia' && (a.mensagem||'').includes(corresp.remetente))))
                              }
                            }}
                          >Marcar como coletada</Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma correspondência encontrada</p>
                  </div>
                )}
              </TabsContent>

              {podeReservarSalas && (
                <TabsContent value="reservas" className="space-y-4">
                  {reservas.length > 0 ? (
                    reservas.slice(0, 5).map((reserva) => {
                      const sala = dSalas.find((s:any) => s.id === reserva.salaId)
                      return (
                        <div
                          key={reserva.id}
                          className="flex items-center justify-between p-4 border rounded-lg border-gray-200"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium text-black">{sala?.nome}</p>
                              <p className="text-sm text-gray-600">
                                {reserva.data} • {reserva.horaInicio} - {reserva.horaFim}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={
                              reserva.status === "confirmada"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : reserva.status === "pendente"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  : "bg-red-100 text-red-800 border-red-200"
                            }
                          >
                            {reserva.status}
                          </Badge>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma reserva encontrada</p>
                      <Button
                        className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => router.push("/calendar")}
                      >
                        Fazer primeira reserva
                      </Button>
                    </div>
                  )}
                </TabsContent>
              )}

              {podeReservarSalas && (
                <TabsContent value="room-view" className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-black mb-2">Conheça Nossa Sala</h3>
                    <p className="text-gray-600">Veja todos os detalhes da sala disponível para suas reuniões</p>
                  </div>

                  <RoomView />
                </TabsContent>
              )}

              {temAcessoAudiencias && (
                <TabsContent value="audiencias" className="space-y-4">
                  {audiencias.length > 0 ? (
                    audiencias.slice(0, 5).map((audiencia) => (
                      <div
                        key={audiencia.id}
                        className="flex items-center justify-between p-4 border rounded-lg border-gray-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              audiencia.urgencia === "alta"
                                ? "bg-red-100"
                                : audiencia.urgencia === "media"
                                  ? "bg-orange-100"
                                  : "bg-blue-100"
                            }`}
                          >
                            <FileText
                              className={`h-5 w-5 ${
                                audiencia.urgencia === "alta"
                                  ? "text-red-600"
                                  : audiencia.urgencia === "media"
                                    ? "text-orange-600"
                                    : "text-blue-600"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-black">{audiencia.tribunal}</p>
                            <p className="text-sm text-gray-600">
                              {audiencia.data} • {audiencia.horario}
                            </p>
                            <p className="text-xs text-gray-500">{audiencia.processo}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={
                              audiencia.urgencia === "alta"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : audiencia.urgencia === "media"
                                  ? "bg-orange-100 text-orange-800 border-orange-200"
                                  : "bg-blue-100 text-blue-800 border-blue-200"
                            }
                          >
                            {audiencia.urgencia}
                          </Badge>
                          <Badge
                            className={
                              audiencia.status === "agendada"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-green-100 text-green-800 border-green-200"
                            }
                          >
                            {audiencia.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma audiência encontrada</p>
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>

    <AlertDialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Limpar avisos</AlertDialogTitle>
          <AlertDialogDescription>Tem certeza que deseja remover todos os avisos?</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleClearAvisos}>Limpar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </div>
  )
}



