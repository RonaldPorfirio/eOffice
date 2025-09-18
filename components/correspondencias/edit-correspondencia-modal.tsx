"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Correspondencia = {
  id: string
  clienteId: string
  remetente: string
  tipo: "documento" | "carta" | "sedex" | "ar" | "telegrama"
  dataRecebimento: string
  status: string
  observacoes?: string
}

type Cliente = { id: string; nome: string; email?: string }

export function EditCorrespondenciaModal({
  open,
  onClose,
  correspondencia,
  clientes,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  correspondencia: Correspondencia | null
  clientes: Cliente[]
  onSaved: (updated: any) => void
}) {
  const [form, setForm] = useState({
    clienteId: "",
    remetente: "",
    tipo: "documento" as Correspondencia["tipo"],
    dataRecebimento: "",
    status: "pendente",
    prioridade: "media",
    observacoes: "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (correspondencia) {
      setForm({
        clienteId: correspondencia.clienteId,
        remetente: correspondencia.remetente || "",
        tipo: (correspondencia.tipo as any) || "documento",
        dataRecebimento: (new Date(correspondencia.dataRecebimento).toISOString().slice(0, 10)),
        status:
          correspondencia.status === "aguardando"
            ? "pendente"
            : correspondencia.status === "retirada"
              ? "coletada"
              : correspondencia.status,
        prioridade: "media",
        observacoes: correspondencia.observacoes || "",
      })
    }
  }, [correspondencia])

  const handleSave = async () => {
    if (!correspondencia) return
    setSaving(true)
    setError("")
    try {
      const resp = await fetch(`/api/correspondencias/${correspondencia.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          remetente: form.remetente,
          tipo: form.tipo,
          dataRecebimento: form.dataRecebimento,
          status: form.status,
          prioridade: form.prioridade,
          observacoes: form.observacoes,
        }),
      })
      if (!resp.ok) {
        const e = await resp.json().catch(() => ({}))
        throw new Error(e.error || "Falha ao salvar alterações")
      }
      const updated = await resp.json()
      onSaved(updated)
      onClose()
    } catch (e: any) {
      setError(e.message || "Erro inesperado")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-xl bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-black">Editar Correspondência</DialogTitle>
          <DialogDescription className="text-gray-600">
            Altere os dados da correspondência selecionada.
          </DialogDescription>
        </DialogHeader>

        {!correspondencia ? (
          <div className="text-sm text-gray-500">Nenhuma correspondência selecionada</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Cliente</label>
                <select
                  className="w-full border p-2 rounded"
                  value={form.clienteId}
                  onChange={(e) => setForm((p) => ({ ...p, clienteId: e.target.value }))}
                  disabled
                >
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome} {c.email ? `(${c.email})` : ""}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Data de recebimento</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded"
                  value={form.dataRecebimento}
                  onChange={(e) => setForm((p) => ({ ...p, dataRecebimento: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Remetente</label>
                <input
                  className="w-full border p-2 rounded"
                  value={form.remetente}
                  onChange={(e) => setForm((p) => ({ ...p, remetente: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Tipo</label>
                <select
                  className="w-full border p-2 rounded"
                  value={form.tipo}
                  onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value as any }))}
                >
                  <option value="documento">Documento</option>
                  <option value="carta">Carta</option>
                  <option value="sedex">SEDEX</option>
                  <option value="ar">AR</option>
                  <option value="telegrama">Telegrama</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Status</label>
                <select
                  className="w-full border p-2 rounded"
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                >
                  <option value="pendente">Pendente</option>
                  <option value="atrasada">Atrasada</option>
                  <option value="coletada">Coletada</option>
                  <option value="devolvida">Devolvida</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Prioridade</label>
                <select
                  className="w-full border p-2 rounded"
                  value={form.prioridade}
                  onChange={(e) => setForm((p) => ({ ...p, prioridade: e.target.value }))}
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Observações</label>
              <textarea
                className="w-full border p-2 rounded min-h-[80px]"
                value={form.observacoes}
                onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))}
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

