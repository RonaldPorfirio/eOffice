"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const plans = [
    {
      id: "comercial",
      name: "Plano Comercial",
      subtitle: "Para Pessoa Física",
      price: 180,
      description: "Ideal para profissionais autônomos e pequenos negócios",
      features: [
        "Endereço comercial para PF",
        "Recebimento de correspondências",
        "Atendimento telefônico básico",
        "Suporte comercial",
      ],
      color: "border-orange-200 bg-orange-50",
      badge: "Mais Popular",
      badgeColor: "bg-orange-100 text-orange-800",
    },
    {
      id: "fiscal",
      name: "Plano Fiscal",
      subtitle: "Para CNPJ",
      price: 280,
      description: "Perfeito para empresas que precisam de endereço fiscal",
      features: [
        "Endereço fiscal para CNPJ",
        "Recebimento de correspondências",
        "Atendimento telefônico básico",
        "Gestão de documentos fiscais",
        "Suporte empresarial",
      ],
      color: "border-green-200 bg-green-50",
      badge: "Empresarial",
      badgeColor: "bg-green-100 text-green-800",
    },
    {
      id: "mensalista",
      name: "Plano Mensalista",
      subtitle: "Completo Premium",
      price: 450,
      description: "Solução completa para advogados e profissionais liberais",
      features: [
        "Endereço comercial completo",
        "Recebimento de correspondências",
        "Atendimento telefônico",
        "Acesso às salas de reunião",
        "Controle de audiências e prazos",
        "Suporte jurídico completo",
        "Escritório virtual premium",
      ],
      color: "border-blue-200 bg-blue-50",
      badge: "Premium",
      badgeColor: "bg-blue-100 text-blue-800",
    },
  ]

  const testimonials = [
    {
      name: "Dr. Carlos Eduardo Silva",
      role: "Advogado",
      content: "O eOffice 1321 revolucionou minha prática jurídica. O controle de prazos e audiências é impecável.",
      rating: 5,
    },
    {
      name: "Maria Fernanda Costa",
      role: "Consultora Empresarial",
      content: "Excelente localização e atendimento profissional. Recomendo para qualquer profissional.",
      rating: 5,
    },
    {
      name: "TechStart Inovações",
      role: "Startup",
      content: "O endereço fiscal nos deu credibilidade desde o início. Serviço de qualidade excepcional.",
      rating: 5,
    },
  ]

  useEffect(() => {
    // Redirecionar automaticamente para a página de login
    router.replace("/login")
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  )
}
