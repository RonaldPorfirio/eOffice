"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export function NovoClienteModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (c: any) => void }) {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", plano: "mensalista", documento: "", endereco: "" })
  const [senha, setSenha] = useState("")
  const [senhaConfirma, setSenhaConfirma] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      if (!form.nome || !form.email || !form.telefone || !form.plano) {
        setError("Preencha nome, email, telefone e plano")
        return
      }
      if (senha && senha !== senhaConfirma) {
        setError("As senhas não conferem")
        return
      }
      const resp = await fetch('/api/clientes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!resp.ok) { const e = await resp.json().catch(()=>({})); throw new Error(e.error||'Falha ao criar cliente') }
      const novo = await resp.json()
      if (senha) {
        try {
          const r2 = await fetch(`/api/clientes/${novo.id}/acesso`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senha, email: form.email, nome: form.nome })
          })
          if (!r2.ok) {
            const e2 = await r2.json().catch(()=>({}))
            toast({ title: 'Cliente criado', description: 'Erro ao definir o acesso: ' + (e2.error || 'tente novamente em Clientes > chave') })
          } else {
            toast({ title: 'Cliente criado com acesso', description: 'O cliente já pode fazer login.' })
          }
        } catch {
          toast({ title: 'Cliente criado', description: 'Não foi possível definir o acesso agora.' })
        }
      } else {
        toast({ title: 'Cliente criado', description: 'Você pode definir a senha depois nas ações do cliente.' })
      }
      onCreated(novo)
      onClose()
      setForm({ nome: "", email: "", telefone: "", plano: "mensalista", documento: "", endereco: "" })
      setSenha("")
      setSenhaConfirma("")
    } catch (e:any) {
      setError(e.message||'Erro inesperado')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v)=>{ if(!v) onClose() }}>
      <DialogContent className="max-w-lg bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-black">Novo Cliente</DialogTitle>
          <DialogDescription className="text-gray-600">Cadastre um novo cliente rapidamente.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nome</label>
            <Input value={form.nome} onChange={(e)=>setForm(p=>({...p, nome:e.target.value}))} placeholder="Nome completo" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <Input type="email" value={form.email} onChange={(e)=>setForm(p=>({...p, email:e.target.value}))} placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Telefone</label>
              <Input value={form.telefone} onChange={(e)=>setForm(p=>({...p, telefone:e.target.value}))} placeholder="(11) 99999-9999" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Plano</label>
              <select className="w-full border p-2 rounded" value={form.plano} onChange={(e)=>setForm(p=>({...p, plano:e.target.value}))}>
                <option value="mensalista">Mensalista</option>
                <option value="fiscal">Fiscal</option>
                <option value="comercial">Comercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Documento (opcional)</label>
              <Input value={form.documento} onChange={(e)=>setForm(p=>({...p, documento:e.target.value}))} placeholder="CPF/CNPJ" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Endereço (opcional)</label>
            <Input value={form.endereco} onChange={(e)=>setForm(p=>({...p, endereco:e.target.value}))} placeholder="Endereço completo" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Senha (opcional)</label>
              <Input type="password" value={senha} onChange={(e)=>setSenha(e.target.value)} placeholder="Defina a senha de acesso" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Confirmar senha</label>
              <Input type="password" value={senhaConfirma} onChange={(e)=>setSenhaConfirma(e.target.value)} placeholder="Repita a senha" />
            </div>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving? 'Salvando...' : 'Criar'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

