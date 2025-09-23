"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Props {
  open: boolean
  onClose: () => void
  cliente: { id: string; nome: string; email?: string } | null
  onChanged?: () => void
}

export function TrocarSenhaModal({ open, onClose, cliente, onChanged }: Props) {
  const [senha, setSenha] = useState("")
  const [confirma, setConfirma] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [ok, setOk] = useState("")

  useEffect(() => {
    if (open) {
      setSenha("")
      setConfirma("")
      setError("")
      setOk("")
    }
  }, [open])

  const submit = async () => {
    setError("")
    setOk("")
    if (!cliente) return
    if (!senha || senha.length < 6) { setError("A senha deve ter pelo menos 6 caracteres"); return }
    if (senha !== confirma) { setError("As senhas não conferem"); return }
    try {
      setLoading(true)
      const r = await fetch(`/api/clientes/${cliente.id}/acesso`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ senha }) })
      if (r.ok) { setOk("Senha atualizada com sucesso"); onChanged?.() } else { const e = await r.json().catch(()=>({})); setError(e.error||'Falha ao atualizar senha') }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-black">Trocar senha</DialogTitle>
          <DialogDescription className="text-gray-600">{cliente ? cliente.nome : ""}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nova senha</label>
            <Input type="password" value={senha} onChange={(e)=>setSenha(e.target.value)} placeholder="Digite a nova senha" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Confirmar senha</label>
            <Input type="password" value={confirma} onChange={(e)=>setConfirma(e.target.value)} placeholder="Repita a nova senha" />
          </div>
          {error && (<Alert className="border-red-200 bg-red-50"><AlertDescription className="text-red-800">{error}</AlertDescription></Alert>)}
          {ok && (<Alert className="border-green-200 bg-green-50"><AlertDescription className="text-green-800">{ok}</AlertDescription></Alert>)}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={submit} disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white">{loading? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

