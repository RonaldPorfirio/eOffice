"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CalendarGrid } from "@/components/calendar/calendar-grid"
import { BookingModal, type BookingData } from "@/components/calendar/booking-modal"
import { RoomView } from "@/components/room-view"
import { NovoClienteModal } from "@/components/admin/novo-cliente-modal"
import { TrocarSenhaModal } from "@/components/admin/trocar-senha-modal"
import { EditCorrespondenciaModal } from "@/components/correspondencias/edit-correspondencia-modal"
import type { Reserva, Sala } from "@/lib/data"
import { salas as mockSalas } from "@/lib/data"
import { format } from "date-fns"

type AdminView = 'month' | 'week' | 'day' | 'clients' | 'corresp' | 'room'
export const dynamic = 'force-dynamic'
export const revalidate = false

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  const [salas, setSalas] = useState([] as Sala[])
  const [reservas, setReservas] = useState([] as Reserva[])
  const [clientes, setClientes] = useState([] as any[])
  const [correspondencias, setCorrespondencias] = useState([] as any[])
  const [audiencias, setAudiencias] = useState([] as any[])
  const [editCorr, setEditCorr] = useState(null as any)
  const [showEditCorr, setShowEditCorr] = useState(false)
  const [showNovoCliente, setShowNovoCliente] = useState(false)
  const [confirmDeleteCorrOpen, setConfirmDeleteCorrOpen] = useState(false)
  const [toDeleteCorrId, setToDeleteCorrId] = useState<string | null>(null)
  const [confirmDeleteReservaOpen, setConfirmDeleteReservaOpen] = useState(false)
  const [toDeleteReservaId, setToDeleteReservaId] = useState<string | null>(null)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('month' as AdminView)
  const [selectedDate, setSelectedDate] = useState(null as Date | null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedReserva, setSelectedReserva] = useState<any>(null)
  const [showEventModal, setShowEventModal] = useState(false)

  // inline edit
  const [editingId, setEditingId] = useState(null as string | null)
  const [editForm, setEditForm] = useState({ nome: "", email: "", telefone: "", plano: "mensalista", status: "ativo" } as any)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDeleteId, setToDeleteId] = useState<string | null>(null)
  const [senhaOpen, setSenhaOpen] = useState(false)
  const [senhaCliente, setSenhaCliente] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) { router.push("/login"); return }
    const parsed = JSON.parse(userData)
    if (parsed.tipo !== "admin") { router.push("/dashboard"); return }
    setUser(parsed)

    Promise.all([
      fetch("/api/salas").then((r) => r.json()),
      fetch("/api/reservas/list").then((r) => r.json()),
      fetch("/api/clientes").then((r) => r.json()),
      fetch("/api/correspondencias").then((r) => r.json()).catch(() => []),
      fetch("/api/audiencias").then((r) => r.json()).catch(() => []),
    ])
      .then(([salasData, reservasData, clientesData, corrData, audData]) => {
        setSalas((salasData && salasData.length > 0) ? salasData : mockSalas)
        const normalized = (reservasData || []).map((r: any) => ({ ...r, data: format(new Date(r.data), "yyyy-MM-dd") }))
        setReservas(normalized)
        setClientes(clientesData)
        setCorrespondencias(corrData)
        setAudiencias(audData)
      })
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = () => { localStorage.removeItem("user"); router.push("/login") }

  const handleBookingConfirm = async (data: BookingData) => {
    const id = `res-${Date.now()}`
    const sala = salas.find((s) => s.id === data.salaId)
    const inicio = new Date(`2024-01-01T${data.horaInicio}`)
    const fim = new Date(`2024-01-01T${data.horaFim}`)
    const horas = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60)
    let valorTotal = (sala?.valorHora || 0) * horas
    const observacoes = data.audiencia ? `[AUDIENCIA] ${data.observacoes || ''}`.trim() : data.observacoes
    const resp = await fetch("/api/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        clienteId: data.clienteId || (clientes[0]?.id ?? ""),
        salaId: data.salaId,
        data: data.data,
        horaInicio: data.horaInicio,
        horaFim: data.horaFim,
        observacoes,
        valorTotal,
        status: "confirmada",
      }),
    })
    if (resp.ok) {
      const nova = await resp.json()
      const novaNorm = { ...nova, data: format(new Date(nova.data), "yyyy-MM-dd") }
      setReservas((prev) => [...prev, novaNorm])
      setMessage("Reserva criada e confirmada com sucesso!")

      try {
        // Aviso padrão de agendamento
        const cliId = data.clienteId || clientes[0]?.id
        const cli = clientes.find((c: any) => c.id === cliId)
        if (cli) {
          const titulo = 'Agendamento criado'
          const salaNome = salas.find(s => s.id === data.salaId)?.nome || data.salaId
          const mensagem = `Reserva em ${novaNorm.data} ${data.horaInicio}-${data.horaFim} | Sala ${salaNome}`
          await fetch(`/api/clientes/${cli.id}/avisos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titulo, mensagem, tipo: 'info', urgencia: 'baixa' }) })
        }
        if (data.audiencia) {
          const cli = clientes.find((c: any) => c.id === (data.clienteId || clientes[0]?.id))
          if (cli && cli.plano === 'mensalista') {
            const titulo = 'Audiência agendada'
            const salaNome = salas.find(s => s.id === data.salaId)?.nome || data.salaId
            const mensagem = `Audiência em ${novaNorm.data} ${data.horaInicio}-${data.horaFim} | Sala ${salaNome} | Usuário: ${cli.nome}`
            await fetch(`/api/clientes/${cli.id}/avisos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titulo, mensagem, tipo: 'info', urgencia: 'media' }) })
          }
        }
      } catch { }
    } else if (resp.status === 409) {
      setMessage("Conflito de horario. Escolha outro horario.")
    } else {
      setMessage("Erro ao criar reserva.")
    }
    setTimeout(() => setMessage(""), 3000)
  }

  const handleStatusChange = async (id: string, status: string) => {
    const resp = await fetch(`/api/reservas/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
    if (resp.ok) { const upd = await resp.json(); setReservas((prev) => prev.map((r) => (r.id === id ? upd : r))) }
  }
  const handleDelete = async (id: string) => {
    const resp = await fetch(`/api/reservas/${id}`, { method: "DELETE" })
    if (resp.ok) setReservas((prev) => prev.filter((r) => r.id !== id))
  }

  if (loading) return (<div className="p-8">Carregando...</div>)
  if (!user) return null

  const stats = {
    totalClientes: clientes.length,
    totalReservas: reservas.length,
    correspondencias: correspondencias.length,
    salas: salas.length,
  };

  const content = (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">eOffice 1321 - Admin</h1>
        <div className="space-x-2">
          <Button onClick={() => { setSelectedDate(new Date()); setShowBookingModal(true) }}>Nova Reserva</Button>
          <Button variant="outline" onClick={() => setShowNovoCliente(true)}>Novo Cliente</Button>
          <Button variant="outline" onClick={handleLogout}>Sair</Button>
        </div>
      </div>

      {message && (<Alert><AlertDescription>{message}</AlertDescription></Alert>)}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader><CardTitle>Clientes</CardTitle><CardDescription>Total</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold">{stats.totalClientes}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Reservas</CardTitle><CardDescription>Total</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold">{stats.totalReservas}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Correspondencias</CardTitle><CardDescription>Total</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold">{stats.correspondencias}</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Salas</CardTitle><CardDescription>Total</CardDescription></CardHeader><CardContent><div className="text-3xl font-bold">{stats.salas}</div></CardContent></Card>
      </div>

      <Tabs value={view} onValueChange={(v: any) => setView(v)} className="space-y-4">
        <TabsList className="grid grid-cols-6 max-w-3xl">
          <TabsTrigger value="month">Calendario</TabsTrigger>
          <TabsTrigger value="week">Semana</TabsTrigger>
          <TabsTrigger value="day">Dia</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="corresp">Correspondencias</TabsTrigger>
          <TabsTrigger value="room">Room View</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Calendario</CardTitle><CardDescription>Visualize e gerencie reservas</CardDescription></CardHeader>
            <CardContent>
              <CalendarGrid reservas={reservas} salas={salas} onDateClick={(d) => { setSelectedDate(d); setShowBookingModal(true) }} onEventClick={(r) => { setSelectedReserva(r); setShowEventModal(true) }} view="month" currentDate={currentDate} onDateChange={setCurrentDate} />
            </CardContent></Card>
        </TabsContent>

        <TabsContent value="week">
          <CalendarGrid reservas={reservas} salas={salas} onDateClick={(d) => { setSelectedDate(d); setShowBookingModal(true) }} onEventClick={(r) => { setSelectedReserva(r); setShowEventModal(true) }} view="week" currentDate={currentDate} onDateChange={setCurrentDate} />
        </TabsContent>

        <TabsContent value="day">
          <CalendarGrid reservas={reservas} salas={salas} onDateClick={(d) => { setSelectedDate(d); setShowBookingModal(true) }} onEventClick={(r) => { setSelectedReserva(r); setShowEventModal(true) }} view="day" currentDate={currentDate} onDateChange={setCurrentDate} />
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader><CardTitle>Clientes</CardTitle><CardDescription>Lista resumida</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {clientes.map((c) => (
                  <div key={c.id} className="border p-3 rounded-md">
                    {editingId === c.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                        <input className="border p-2 rounded" value={editForm.nome} onChange={(e) => setEditForm((p: any) => ({ ...p, nome: e.target.value }))} placeholder="Nome" />
                        <input className="border p-2 rounded" value={editForm.email} onChange={(e) => setEditForm((p: any) => ({ ...p, email: e.target.value }))} placeholder="Email" />
                        <input className="border p-2 rounded" value={editForm.telefone || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, telefone: e.target.value }))} placeholder="Telefone" />
                        <select className="border p-2 rounded" value={editForm.plano} onChange={(e) => setEditForm((p: any) => ({ ...p, plano: e.target.value }))}>
                          <option value="mensalista">Mensalista</option>
                          <option value="fiscal">Fiscal</option>
                          <option value="comercial">Comercial</option>
                        </select>
                        <select className="border p-2 rounded" value={editForm.status} onChange={(e) => setEditForm((p: any) => ({ ...p, status: e.target.value }))}>
                          <option value="ativo">Ativo</option>
                          <option value="inativo">Inativo</option>
                          <option value="pendente">Pendente</option>
                        </select>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" onClick={async () => {
                            const resp = await fetch(`/api/clientes/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) })
                            if (resp.ok) { const upd = await resp.json(); setClientes((prev) => prev.map((x) => x.id === c.id ? upd : x)); setMessage('Cliente atualizado'); setEditingId(null) } else { const e = await resp.json().catch(() => ({})); setMessage(e.error || 'Falha ao atualizar cliente') }
                            setTimeout(() => setMessage(''), 3000)
                          }}>Salvar</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{c.nome}</div>
                          <div className="text-sm text-gray-600">{c.email}</div>
                          {c.dataInicio && (
                            <div className="text-xs text-gray-500">Desde {format(new Date(c.dataInicio), "dd/MM/yyyy")}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{c.plano}</Badge>
                          <Badge className={c.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}>{c.status}</Badge>
                          <Button size="sm" variant="outline" onClick={() => { setSenhaCliente(c); setSenhaOpen(true) }}>Senha</Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditingId(c.id); setEditForm({ nome: c.nome, email: c.email, telefone: c.telefone || '', plano: c.plano, status: c.status }) }}>Editar</Button>
                          {c.status !== 'inativo' ? (
                            <Button size="sm" variant="outline" onClick={async () => {
                              const r = await fetch(`/api/clientes/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'inativo' }) })
                              if (r.ok) { const u = await r.json(); setClientes((p) => p.map(x => x.id === c.id ? u : x)); setMessage('Cliente desativado') } else { const e = await r.json().catch(() => ({})); setMessage(e.error || 'Falha ao desativar') }
                              setTimeout(() => setMessage(''), 3000)
                            }}>Desativar</Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={async () => {
                              const r = await fetch(`/api/clientes/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'ativo' }) })
                              if (r.ok) { const u = await r.json(); setClientes((p) => p.map(x => x.id === c.id ? u : x)); setMessage('Cliente ativado') } else { const e = await r.json().catch(() => ({})); setMessage(e.error || 'Falha ao ativar') }
                              setTimeout(() => setMessage(''), 3000)
                            }}>Ativar</Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => { setToDeleteId(c.id); setConfirmOpen(true) }}>Excluir</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {clientes.length === 0 && (<div className="text-sm text-gray-500">Nenhum cliente cadastrado</div>)}
              </div>

              {/* moved */}

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="corresp">          <Card>
          <CardHeader>
            <CardTitle>Correspondencias</CardTitle>
            <CardDescription>Verifique todas as correspondencias</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Criar Correspondencia */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-7 gap-3">
              <select name="clienteId" id="corr-cliente" className="border p-2 rounded md:col-span-2" defaultValue="">
                <option value="" disabled>Selecione o cliente</option>
                {clientes.map((c) => (<option key={c.id} value={c.id}>{c.nome} ({c.email})</option>))}
              </select>
              <input id="corr-rem" placeholder="Remetente" className="border p-2 rounded" />
              <select id="corr-tipo" className="border p-2 rounded">
                <option value="documento">Documento</option>
                <option value="carta">Carta</option>
                <option value="sedex">SEDEX</option>
                <option value="ar">AR</option>
                <option value="telegrama">Telegrama</option>
              </select>
              <input id="corr-data" type="date" className="border p-2 rounded" />
              <select id="corr-status" className="border p-2 rounded">
                <option value="pendente">Pendente</option>
                <option value="atrasada">Atrasada</option>
                <option value="coletada">Coletada</option>
              </select>
              <select id="corr-prioridade" className="border p-2 rounded">
                <option value="baixa">Baixa</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
              <input id="corr-obs" placeholder="Observacoes" className="border p-2 rounded md:col-span-2" />
              <div className="md:col-span-7">
                <Button type="button" onClick={async () => {
                  const clienteId = (document.getElementById('corr-cliente') as HTMLSelectElement).value
                  const remetente = (document.getElementById('corr-rem') as HTMLInputElement).value
                  const tipo = (document.getElementById('corr-tipo') as HTMLSelectElement).value
                  const dataRecebimento = (document.getElementById('corr-data') as HTMLInputElement).value || new Date().toISOString().slice(0, 10)
                  const status = (document.getElementById('corr-status') as HTMLSelectElement).value
                  const prioridade = (document.getElementById('corr-prioridade') as HTMLSelectElement).value
                  const observacoes = (document.getElementById('corr-obs') as HTMLInputElement).value
                  if (!clienteId || !remetente) { setMessage('Selecione cliente e informe remetente'); setTimeout(() => setMessage(''), 3000); return }
                  const r = await fetch('/api/correspondencias', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clienteId, remetente, tipo, dataRecebimento, status, prioridade, observacoes }) })
                  if (r.ok) {
                    const nova = await r.json(); setCorrespondencias((prev) => [nova, ...prev]); setMessage('Correspondencia criada');
                    // cria aviso no dashboard do cliente
                    const msg = `Recebemos uma correspondencia (${tipo}) de ${remetente}.`;
                    const urg = prioridade === 'urgente' ? 'alta' : (prioridade as any);
                    await fetch('/api/avisos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clienteId, titulo: 'Nova correspondencia', mensagem: msg, tipo: 'info', urgencia: urg }) })
                  } else { const e = await r.json().catch(() => ({})); setMessage(e.error || 'Falha ao criar correspondencia') }
                  setTimeout(() => setMessage(''), 3000)
                }}>Criar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
          <Card>
            <CardHeader>
              <CardTitle>Correspondencias</CardTitle>
              <CardDescription>Verifique todas as correspondencias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {correspondencias.map((c: any) => {
                  const cliente = clientes.find((x: any) => x.id === c.clienteId)
                  const statusUi = c.status === 'aguardando' ? 'pendente' : (c.status === 'retirada' ? 'coletada' : c.status)
                  return (
                    <div key={c.id} className="p-3 border rounded-md flex items-center justify-between">
                      <div>
                        <div className="font-medium">{c.remetente} <span className="text-xs text-gray-500">({c.tipo})</span></div>
                        <div className="text-sm text-gray-600">{cliente?.nome || c.clienteId} • {new Date(c.dataRecebimento).toISOString().slice(0, 10)} • {statusUi}</div>
                        {c.observacoes && <div className="text-xs text-gray-500">{c.observacoes}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          className="border p-1 rounded text-sm"
                          defaultValue={statusUi}
                          onChange={async (e) => {
                            const val = e.target.value
                            const r = await fetch(`/api/correspondencias/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: val }) })
                            if (r.ok) { const u = await r.json(); setCorrespondencias((p) => p.map(x => x.id === c.id ? u : x)); setMessage('Status atualizado') } else { const err = await r.json().catch(() => ({})); setMessage(err.error || 'Falha ao atualizar status') }
                            setTimeout(() => setMessage(''), 3000)
                          }}
                        >
                          <option value="pendente">Pendente</option>
                          <option value="atrasada">Atrasada</option>
                          <option value="coletada">Coletada</option>
                        </select>
                        <Button size="sm" variant="outline" onClick={() => { setEditCorr(c); setShowEditCorr(true) }}>Editar</Button>
                        <Button size="sm" variant="destructive" onClick={() => { setToDeleteCorrId(c.id); setConfirmDeleteCorrOpen(true) }}>Excluir</Button>
                      </div>
                    </div>
                  )
                })}
                {correspondencias.length === 0 && (<div className="text-sm text-gray-500">Sem correspondencias</div>)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="room">
          <RoomView />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader><CardTitle>Todas as Reservas</CardTitle><CardDescription>Gerencie as reservas</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reservas.slice().sort((a, b) => a.data.localeCompare(b.data)).map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <div className="font-medium">{salas.find((s) => s.id === r.salaId)?.nome || r.salaId}</div>
                  <div className="text-sm text-gray-600">{r.data} • {r.horaInicio} - {r.horaFim}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{r.status}</Badge>
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange(r.id, 'confirmada')}>Confirmar</Button>
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange(r.id, 'cancelada')}>Cancelar</Button>
                  <Button size="sm" variant="destructive" onClick={() => { setToDeleteReservaId(r.id); setConfirmDeleteReservaOpen(true) }}>Excluir</Button>
                </div>
              </div>
            ))}
            {reservas.length === 0 && <div className="text-sm text-gray-500">Nenhuma reserva</div>}
          </div>
        </CardContent>
      </Card>

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => { setShowBookingModal(false); setSelectedDate(null) }}
        onConfirm={handleBookingConfirm}
        selectedDate={selectedDate}
        salas={salas}
        userPlan="admin"
        isAdmin={true}
        clientes={clientes.map((c) => ({ id: c.id, nome: c.nome, plano: c.plano }))}
      />

      <NovoClienteModal
        open={showNovoCliente}
        onClose={() => setShowNovoCliente(false)}
        onCreated={(novo) => { setClientes((prev) => [novo, ...prev]); setMessage('Cliente criado'); setTimeout(() => setMessage(''), 3000) }}
      />

      {/* Modal de Detalhes da Reserva */}
      <AlertDialog open={showEventModal} onOpenChange={setShowEventModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Detalhes da Reserva</AlertDialogTitle>
            <AlertDialogDescription>Informações da reserva selecionada.</AlertDialogDescription>
          </AlertDialogHeader>
          {selectedReserva && (
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Cliente:</span> {clientes.find((c: any) => c.id === selectedReserva.clienteId)?.nome || selectedReserva.clienteId}</div>
              <div><span className="font-medium">Sala:</span> {salas.find((s) => s.id === selectedReserva.salaId)?.nome || selectedReserva.salaId}</div>
              <div><span className="font-medium">Dia:</span> {selectedReserva.data}</div>
              <div><span className="font-medium">Horário:</span> {selectedReserva.horaInicio} - {selectedReserva.horaFim}</div>
              {selectedReserva.observacoes && (<div><span className="font-medium">Observações:</span> {selectedReserva.observacoes}</div>)}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowEventModal(false)}>Fechar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TrocarSenhaModal
        open={senhaOpen}
        onClose={() => setSenhaOpen(false)}
        cliente={senhaCliente}
        onChanged={() => { setMessage('Senha atualizada'); setTimeout(() => setMessage(''), 3000) }}
      />

      {/* Confirmar exclusão de correspondência */}
      <AlertDialog open={confirmDeleteCorrOpen} onOpenChange={setConfirmDeleteCorrOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir correspondência</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!toDeleteCorrId) return
              const r = await fetch(`/api/correspondencias/${toDeleteCorrId}`, { method: 'DELETE' })
              if (r.ok) { setCorrespondencias((p) => p.filter((x: any) => x.id !== toDeleteCorrId)); setMessage('Correspondência excluída') } else { const e = await r.json().catch(() => ({})); setMessage(e.error || 'Falha ao excluir correspondência') }
              setTimeout(() => setMessage(''), 3000)
              setToDeleteCorrId(null)
            }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmar exclusão de reserva */}
      <AlertDialog open={confirmDeleteReservaOpen} onOpenChange={setConfirmDeleteReservaOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir reserva</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir esta reserva?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (!toDeleteReservaId) return
              const r = await fetch(`/api/reservas/${toDeleteReservaId}`, { method: 'DELETE' })
              if (r.ok) { setReservas((p) => p.filter((x: any) => x.id !== toDeleteReservaId)); setMessage('Reserva excluída') } else { const e = await r.json().catch(() => ({})); setMessage(e.error || 'Falha ao excluir reserva') }
              setTimeout(() => setMessage(''), 3000)
              setToDeleteReservaId(null)
            }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Tem certeza que deseja excluir este cliente?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!toDeleteId) return
                const r = await fetch(`/api/clientes/${toDeleteId}`, { method: 'DELETE' })
                if (r.ok) {
                  setClientes((p) => p.filter((x) => x.id !== toDeleteId))
                  setMessage('Cliente excluído')
                } else {
                  const e = await r.json().catch(() => ({}))
                  setMessage(e.error || 'Falha ao excluir')
                }
                setTimeout(() => setMessage(''), 3000)
                setToDeleteId(null)
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditCorrespondenciaModal
        open={showEditCorr}
        onClose={() => { setShowEditCorr(false); setEditCorr(null) }}
        correspondencia={editCorr}
        clientes={clientes.map((c) => ({ id: c.id, nome: c.nome, email: c.email }))}
        onSaved={(u) => { setCorrespondencias((p) => p.map((x: any) => x.id === u.id ? u : x)); setMessage('Correspondência atualizada'); setTimeout(() => setMessage(''), 3000) }}
      />
    </div>
  )

  return content
}
