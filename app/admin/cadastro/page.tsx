"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Building2, User, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"

export default function CadastroClientePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // Dados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    documento: "",
    endereco: "",
    plano: "",
    observacoes: "",
  })

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
    setLoading(false)
  }, [router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setMessage("")

    try {
      // Validações básicas
      if (!formData.nome || !formData.email || !formData.telefone || !formData.plano) {
        setError("Todos os campos obrigatórios devem ser preenchidos")
        return
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError("Email inválido")
        return
      }

      // Simular cadastro
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simular sucesso
      setMessage("Cliente cadastrado com sucesso!")

      // Limpar formulário
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        documento: "",
        endereco: "",
        plano: "",
        observacoes: "",
      })

      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push("/admin/clientes")
      }, 3000)
    } catch (err) {
      setError("Erro ao cadastrar cliente. Tente novamente.")
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
                  <h1 className="text-xl font-bold text-gray-900">Cadastro de Cliente</h1>
                  <p className="text-sm text-gray-600">Adicionar novo cliente ao sistema</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Mensagens */}
          {message && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-800">{message}</AlertDescription>
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
                <User className="h-5 w-5 mr-2" />
                Dados do Cliente
              </CardTitle>
              <CardDescription>Preencha as informações do novo cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Nome completo do cliente"
                      value={formData.nome}
                      onChange={(e) => handleInputChange("nome", e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange("telefone", e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documento">CPF/CNPJ</Label>
                    <Input
                      id="documento"
                      type="text"
                      placeholder="000.000.000-00 ou 00.000.000/0001-00"
                      value={formData.documento}
                      onChange={(e) => handleInputChange("documento", e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    type="text"
                    placeholder="Endereço completo"
                    value={formData.endereco}
                    onChange={(e) => handleInputChange("endereco", e.target.value)}
                    disabled={submitting}
                  />
                </div>

                {/* Plano */}
                <div className="space-y-2">
                  <Label htmlFor="plano">Plano *</Label>
                  <Select
                    value={formData.plano}
                    onValueChange={(value) => handleInputChange("plano", value)}
                    required
                    disabled={submitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comercial">
                        <div className="flex items-center justify-between w-full">
                          <span>Plano Comercial</span>
                          <span className="text-sm text-gray-500 ml-4">R$ 180/mês</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="fiscal">
                        <div className="flex items-center justify-between w-full">
                          <span>Plano Fiscal</span>
                          <span className="text-sm text-gray-500 ml-4">R$ 280/mês</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="mensalista">
                        <div className="flex items-center justify-between w-full">
                          <span>Plano Mensalista</span>
                          <span className="text-sm text-gray-500 ml-4">R$ 450/mês</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Observações */}
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Informações adicionais sobre o cliente..."
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange("observacoes", e.target.value)}
                    rows={4}
                    disabled={submitting}
                  />
                </div>

                {/* Informações dos Planos */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Informações dos Planos</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div>
                      <strong>Comercial (R$ 180/mês):</strong> Endereço comercial para PF, correspondências, atendimento
                      telefônico básico
                    </div>
                    <div>
                      <strong>Fiscal (R$ 280/mês):</strong> Endereço fiscal para CNPJ, correspondências, gestão de
                      documentos fiscais
                    </div>
                    <div>
                      <strong>Mensalista (R$ 450/mês):</strong> Todos os benefícios anteriores + acesso às salas de
                      reunião + controle de audiências
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex items-center justify-end space-x-4 pt-6">
                  <Button type="button" variant="outline" onClick={() => router.push("/admin")} disabled={submitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Cadastrar Cliente
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
