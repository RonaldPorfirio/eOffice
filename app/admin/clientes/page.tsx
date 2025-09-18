"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Search, Plus, ArrowLeft, Eye, Edit, Trash2, Mail, Phone, Calendar, FileText, Key } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Cliente } from "@/lib/data"

export default function ClientesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPlano, setFilterPlano] = useState("todos")
  const [filterStatus, setFilterStatus] = useState("todos")
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [reservasCliente, setReservasCliente] = useState<any[]>([])
  const [correspondenciasCliente, setCorrespondenciasCliente] = useState<any[]>([])
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [toDeleteId, setToDeleteId] = useState<string | null>(null)

  // Modal de Acesso (definir senha)
  const [showAcessoModal, setShowAcessoModal] = useState(false)
  const [acessoEmail, setAcessoEmail] = useState("")
  const [acessoNome, setAcessoNome] = useState("")
  const [acessoSenha, setAcessoSenha] = useState("")
  const [acessoConfirma, setAcessoConfirma] = useState("")
  const [savingAcesso, setSavingAcesso] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Verificar se usuário está logado e é admin
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.tipo !== "admin") {
      router.push("/dashboard")
      return
    }

    setUser(parsedUser)
    // carregar clientes
    fetch("/api/clientes")
      .then((r) => r.json())
      .then((data) => setClientes(data))
      .finally(() => setLoading(false))
  }, [router])

  // Filtrar clientes
  const clientesFiltrados = clientes.filter((cliente) => {
    const matchSearch =
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchPlano = filterPlano === "todos" || cliente.plano === filterPlano
    const matchStatus = filterStatus === "todos" || cliente.status === filterStatus

    return matchSearch && matchPlano && matchStatus
  })

  const handleViewDetails = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    // carregar detalhes do cliente
    Promise.all([
      fetch(`/api/clientes/${cliente.id}/reservas`).then((r) => r.json()),
      fetch(`/api/clientes/${cliente.id}/correspondencias`).then((r) => r.json()),
    ]).then(([reservas, correspondencias]) => {
      setReservasCliente(reservas)
      setCorrespondenciasCliente(correspondencias)
      setShowDetailsModal(true)
    })
  }

  const openAcessoModal = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setAcessoEmail(cliente.email || "")
    setAcessoNome(cliente.nome || "")
    setAcessoSenha("")
    setAcessoConfirma("")
    setShowAcessoModal(true)
  }

  const handleSalvarAcesso = async () => {
    if (!selectedCliente) return
    if (!acessoSenha) {
      toast({ title: "Informe a senha", description: "O campo senha é obrigatório" })
      return
    }
    if (acessoSenha !== acessoConfirma) {
      toast({ title: "Senhas não conferem", description: "Verifique a confirmação da senha" })
      return
    }
    try {
      setSavingAcesso(true)
      const res = await fetch(`/api/clientes/${selectedCliente.id}/acesso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha: acessoSenha, email: acessoEmail, nome: acessoNome }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Erro ao salvar acesso", description: data?.error || "Tente novamente" })
        return
      }
      toast({ title: "Acesso definido", description: "O cliente já pode fazer login" })
      setShowAcessoModal(false)
    } catch (e) {
      toast({ title: "Erro inesperado", description: "Não foi possível salvar o acesso" })
    } finally {
      setSavingAcesso(false)
    }
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
              <Button variant="ghost" size="sm" onClick={() => router.push("/admin")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Gerenciar Clientes</h1>
                  <p className="text-sm text-gray-600">Visualize e gerencie todos os clientes</p>
                </div>
              </div>
            </div>

            <Button onClick={() => router.push("/admin/cadastro")}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Use os filtros abaixo para encontrar clientes específicos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Plano</label>
                <Select value={filterPlano} onValueChange={setFilterPlano}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os planos</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="fiscal">Fiscal</SelectItem>
                    <SelectItem value="mensalista">Mensalista</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Resultados</label>
                <div className="flex items-center h-10 px-3 bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-600">{clientesFiltrados.length} cliente(s) encontrado(s)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>Todos os clientes cadastrados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Início</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesFiltrados.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{cliente.nome}</p>
                          <p className="text-sm text-gray-600">{cliente.documento}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {cliente.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {cliente.telefone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            cliente.plano === "mensalista"
                              ? "bg-blue-100 text-blue-800"
                              : cliente.plano === "fiscal"
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                          }
                        >
                          {cliente.plano}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            cliente.status === "ativo"
                              ? "default"
                              : cliente.status === "pendente"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {cliente.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{cliente.dataInicio}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewDetails(cliente)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            onClick={() => openAcessoModal(cliente)}
                          >
                            <Key className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                            onClick={() => {
                              const user = {
                                id: cliente.id,
                                nome: cliente.nome,
                                email: cliente.email,
                                tipo: "cliente",
                                plano: cliente.plano,
                              }
                              localStorage.setItem("user", JSON.stringify(user))
                              window.location.href = "/dashboard"
                            }}
                          >
                            Entrar como
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 bg-transparent" onClick={()=>{ setToDeleteId(cliente.id); setConfirmDeleteOpen(true) }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {clientesFiltrados.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum cliente encontrado com os filtros aplicados</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <DialogDescription>Informações completas e histórico de atividades</DialogDescription>
          </DialogHeader>

          {selectedCliente && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informações Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nome</label>
                      <p className="font-medium">{selectedCliente.nome}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p>{selectedCliente.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Telefone</label>
                      <p>{selectedCliente.telefone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Documento</label>
                      <p>{selectedCliente.documento}</p>
                    </div>
                    {selectedCliente.endereco && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Endereço</label>
                        <p>{selectedCliente.endereco}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informações da Conta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Plano</label>
                      <Badge
                        className={
                          selectedCliente.plano === "mensalista"
                            ? "bg-blue-100 text-blue-800"
                            : selectedCliente.plano === "fiscal"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                        }
                      >
                        {selectedCliente.plano}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <Badge
                        variant={
                          selectedCliente.status === "ativo"
                            ? "default"
                            : selectedCliente.status === "pendente"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {selectedCliente.status}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Data de Início</label>
                      <p>{selectedCliente.dataInicio}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Reservas</p>
                        <p className="text-2xl font-bold">{reservasCliente.length}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Correspondências</p>
                        <p className="text-2xl font-bold">
                          {correspondenciasCliente.length}
                        </p>
                      </div>
                      <Mail className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Valor Mensal</p>
                        <p className="text-2xl font-bold text-green-600">
                          R${" "}
                          {selectedCliente.plano === "mensalista"
                            ? "450"
                            : selectedCliente.plano === "fiscal"
                              ? "280"
                              : "180"}
                        </p>
                      </div>
                      <FileText className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Histórico de Reservas */}
              {selectedCliente.plano === "mensalista" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Reservas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reservasCliente
                        .slice(0, 5)
                        .map((reserva) => (
                          <div key={reserva.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">Sala {reserva.salaId}</p>
                              <p className="text-sm text-gray-600">
                                {reserva.data} • {reserva.horaInicio} - {reserva.horaFim}
                              </p>
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
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Histórico de Correspondências */}
              <Card>
                <CardHeader>
                  <CardTitle>Correspondências Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {correspondenciasCliente
                      .slice(0, 5)
                      .map((corresp) => (
                        <div key={corresp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{corresp.remetente}</p>
                            <p className="text-sm text-gray-600 capitalize">
                              {corresp.tipo} • {corresp.dataRecebimento}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {corresp.urgente && (
                              <Badge variant="destructive" className="text-xs">
                                Urgente
                              </Badge>
                            )}
                            <Badge variant={corresp.status === "aguardando" ? "destructive" : "default"}>
                              {corresp.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Acesso (definir senha/email) */}
      <Dialog open={showAcessoModal} onOpenChange={setShowAcessoModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Definir acesso do cliente</DialogTitle>
            <DialogDescription>Informe a senha e, se necessário, ajuste email/nome.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Nome</label>
              <Input value={acessoNome} onChange={(e) => setAcessoNome(e.target.value)} placeholder="Nome do usuário" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email para login</label>
              <Input type="email" value={acessoEmail} onChange={(e) => setAcessoEmail(e.target.value)} placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Senha</label>
              <Input type="password" value={acessoSenha} onChange={(e) => setAcessoSenha(e.target.value)} placeholder="Defina uma senha" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Confirmar senha</label>
              <Input type="password" value={acessoConfirma} onChange={(e) => setAcessoConfirma(e.target.value)} placeholder="Repita a senha" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAcessoModal(false)}>Cancelar</Button>
              <Button onClick={handleSalvarAcesso} disabled={savingAcesso}>{savingAcesso ? "Salvando..." : "Salvar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={async ()=>{
            if (!toDeleteId) return
            const r = await fetch(`/api/clientes/${toDeleteId}`, { method: 'DELETE' })
            if (r.ok) {
              setClientes((prev)=>prev.filter(c=>c.id!==toDeleteId))
            } else {
              const e = await r.json().catch(()=>({})); alert(e.error||'Falha ao excluir cliente')
            }
            setToDeleteId(null)
          }}>Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
