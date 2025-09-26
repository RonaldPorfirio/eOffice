"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Mail, Lock, AlertCircle, Eye, EyeOff, Phone, MapPin } from "lucide-react"
import Image from "next/image"

// Dados de demonstração (apenas para preencher rapidamente o formulário)
// Demo accounts removidas

async function apiLogin(email: string, senha: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Falha no login")
  }
  return res.json()
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await apiLogin(email, senha)
      const user = result?.user ?? result
      if (!user || typeof user !== "object") {
        throw new Error("Resposta invalida do servidor")
      }
      localStorage.setItem("user", JSON.stringify(user))
      const redirectPath =
        typeof result?.redirect === "string"
          ? result.redirect
          : user.tipo === "admin"
            ? "/admin"
            : "/dashboard"
      router.push(redirectPath)
    } catch (err: any) {
      setError(err?.message || "Erro interno do sistema")
    } finally {
      setLoading(false)
    }
  }
  // Mantido stub para compatibilidade com JSX legado (conteúdo demo oculto)
  const handleDemoLogin = (..._args: any[]) => {}

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <Image src="/logo-eoffice.png" alt="eOffice 1321" width={40} height={40} className="rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-black">eOffice 1321</h1>
                <p className="text-sm text-gray-600">Sistema de Gestão</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-160px)] p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-gray-200">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-black">Acesso ao Sistema</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Entre com suas credenciais para acessar sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-1 bg-gray-100">
                  <TabsTrigger value="login" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    Login
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-black">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="senha" className="text-black">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="senha"
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          className="pl-10 pr-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                          disabled={loading}
                          aria-label="Mostrar/ocultar senha"
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Entrando...
                        </>
                      ) : (
                        "Entrar"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="demo" className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600">Use uma das contas de demonstração:</p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-red-50 border-red-200 hover:bg-red-100"
                      onClick={() => handleDemoLogin("admin")}
                    >
                      <Building2 className="mr-3 h-4 w-4 text-red-600" />
                      <div className="text-left">
                        <div className="font-medium text-red-900">Administrador</div>
                        <div className="text-xs text-red-700">Acesso completo + Calendário</div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start bg-orange-50 border-orange-200 hover:bg-orange-100"
                      onClick={() => handleDemoLogin("mensalista")}
                    >
                      <div className="w-4 h-4 mr-3 bg-orange-500 rounded" />
                      <div className="text-left">
                        <div className="font-medium text-orange-900">Plano Mensalista</div>
                        <div className="text-xs text-orange-700">Dr. Carlos - Acesso completo + Salas</div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start bg-gray-50 border-gray-200 hover:bg-gray-100"
                      onClick={() => handleDemoLogin("cliente")}
                    >
                      <div className="w-4 h-4 mr-3 bg-gray-500 rounded" />
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Plano Fiscal/Comercial</div>
                        <div className="text-xs text-gray-700">Cliente - Correspondências</div>
                      </div>
                    </Button>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
                    <h3 className="font-semibold text-orange-900 mb-2">Como testar</h3>
                    <ul className="text-sm text-orange-800 space-y-1">
                      <li>Clique em qualquer conta para preencher automaticamente</li>
                      <li>Cada tipo tem acesso a funcionalidades específicas</li>
                      <li>Admin: Gerenciamento completo + Calendário</li>
                      <li>Mensalista: Calendário de salas + Correspondências</li>
                      <li>Fiscal/Comercial: Apenas correspondências</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-center md:space-x-4 space-y-1 md:space-y-0 text-sm text-gray-600">
              <div className="flex items-center justify-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Ed. NY Tower - Av. Brasília, 2121 | Sala 1321</span>
              </div>
              <div className="flex items-center justify-center">
                <span>CEP 16018-000 - Araçatuba/SP</span>
              </div>
              <div className="flex items-center justify-center">
                <Phone className="h-4 w-4 mr-1" />
                <span>WhatsApp: (18) 99783-0797</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">© 2024 eOffice 1321 - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

