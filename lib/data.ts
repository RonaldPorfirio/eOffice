// Tipos de dados
export interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  plano: "comercial" | "fiscal" | "mensalista"
  status: "ativo" | "inativo" | "pendente"
  dataInicio: string
  endereco?: string
  documento?: string
}

export interface Sala {
  id: string
  nome: string
  capacidade: number
  recursos: string[]
  valorHora: number
  disponivel: boolean
  descricao: string
  imagem?: string
  area: number
}

export interface Reserva {
  id: string
  clienteId: string
  salaId: string
  data: string
  horaInicio: string
  horaFim: string
  status: "confirmada" | "pendente" | "cancelada" | "em-andamento"
  observacoes?: string
  valorTotal: number
  dataReserva: string
}

export interface Correspondencia {
  id: string
  clienteId: string
  remetente: string
  tipo: "carta" | "sedex" | "ar" | "telegrama" | "documento"
  dataRecebimento: string
  status: "aguardando" | "retirada" | "devolvida"
  urgente: boolean
  observacoes?: string
}

export interface Audiencia {
  id: string
  clienteId: string
  processo: string
  tribunal: string
  data: string
  horario: string
  tipo: "inicial" | "instrucao" | "sentenca" | "recurso"
  status: "agendada" | "realizada" | "adiada" | "cancelada"
  urgencia: "baixa" | "media" | "alta"
  observacoes?: string
}

export interface Aviso {
  id: string
  clienteId: string
  titulo: string
  mensagem: string
  tipo: "info" | "warning" | "error" | "success"
  urgencia: "baixa" | "media" | "alta"
  dataEnvio: string
  lido: boolean
  resolvido: boolean
}

// Dados mockados
export const clientes: Cliente[] = [
  {
    id: "carlos.silva",
    nome: "Dr. Carlos Eduardo Silva",
    email: "carlos.silva@advocaciasilva.com.br",
    telefone: "(11) 99999-1111",
    plano: "mensalista",
    status: "ativo",
    dataInicio: "2024-01-15",
    endereco: "Rua Augusta, 1000 - São Paulo/SP",
    documento: "123.456.789-00",
  },
  {
    id: "contato",
    nome: "TechStart Inovações",
    email: "contato@techstart.com.br",
    telefone: "(11) 99999-2222",
    plano: "fiscal",
    status: "ativo",
    dataInicio: "2024-02-01",
    endereco: "Av. Paulista, 2000 - São Paulo/SP",
    documento: "12.345.678/0001-90",
  },
  {
    id: "maria",
    nome: "Maria Fernanda Costa",
    email: "maria@consultoriamfc.com.br",
    telefone: "(11) 99999-3333",
    plano: "comercial",
    status: "ativo",
    dataInicio: "2024-03-10",
    endereco: "Rua Oscar Freire, 500 - São Paulo/SP",
    documento: "987.654.321-00",
  },
  {
    id: "cliente",
    nome: "Cliente Exemplo",
    email: "cliente@exemplo.com.br",
    telefone: "(11) 99999-4444",
    plano: "fiscal",
    status: "ativo",
    dataInicio: "2024-04-01",
    endereco: "Rua das Flores, 123 - São Paulo/SP",
    documento: "456.789.123-00",
  },
]

export const salas: Sala[] = [
  {
    id: "sala-1",
    nome: "Sala Executiva A",
    capacidade: 6,
    recursos: ["Projetor", "Wi-Fi", "Ar condicionado", "Mesa de reunião", "Quadro branco"],
    valorHora: 80,
    disponivel: true,
    descricao: "Sala executiva ideal para reuniões corporativas e apresentações.",
    imagem: "/placeholder.svg?height=200&width=300&text=Sala+Executiva+A",
    area: 25,
  },
  {
    id: "sala-2",
    nome: "Sala de Videoconferência",
    capacidade: 8,
    recursos: ["Sistema de videoconferência", "Wi-Fi", "Ar condicionado", "Mesa oval", "Tela grande"],
    valorHora: 120,
    disponivel: true,
    descricao: "Equipada com sistema profissional de videoconferência para reuniões remotas.",
    imagem: "/placeholder.svg?height=200&width=300&text=Sala+Videoconferência",
    area: 30,
  },
  {
    id: "sala-3",
    nome: "Sala Privativa B",
    capacidade: 4,
    recursos: ["Wi-Fi", "Ar condicionado", "Mesa redonda", "Cadeiras executivas"],
    valorHora: 60,
    disponivel: true,
    descricao: "Ambiente reservado para reuniões menores e atendimentos privados.",
    imagem: "/placeholder.svg?height=200&width=300&text=Sala+Privativa+B",
    area: 20,
  },
]

export const reservas: Reserva[] = [
  {
    id: "res-1",
    clienteId: "carlos.silva",
    salaId: "sala-1",
    data: "2024-12-20",
    horaInicio: "09:00",
    horaFim: "11:00",
    status: "confirmada",
    observacoes: "Reunião com cliente importante",
    valorTotal: 160,
    dataReserva: "2024-12-15",
  },
  {
    id: "res-2",
    clienteId: "carlos.silva",
    salaId: "sala-2",
    data: "2024-12-22",
    horaInicio: "14:00",
    horaFim: "16:00",
    status: "pendente",
    observacoes: "Videoconferência internacional",
    valorTotal: 240,
    dataReserva: "2024-12-16",
  },
  {
    id: "res-3",
    clienteId: "contato",
    salaId: "sala-3",
    data: "2024-12-21",
    horaInicio: "10:00",
    horaFim: "12:00",
    status: "confirmada",
    observacoes: "Reunião de planejamento",
    valorTotal: 120,
    dataReserva: "2024-12-17",
  },
]

export const correspondencias: Correspondencia[] = [
  {
    id: "corr-1",
    clienteId: "carlos.silva",
    remetente: "Tribunal de Justiça de SP",
    tipo: "ar",
    dataRecebimento: "2024-12-18",
    status: "aguardando",
    urgente: true,
    observacoes: "Intimação judicial",
  },
  {
    id: "corr-2",
    clienteId: "contato",
    remetente: "Receita Federal",
    tipo: "documento",
    dataRecebimento: "2024-12-17",
    status: "aguardando",
    urgente: false,
    observacoes: "Documentos fiscais",
  },
  {
    id: "corr-3",
    clienteId: "maria",
    remetente: "Banco do Brasil",
    tipo: "carta",
    dataRecebimento: "2024-12-16",
    status: "retirada",
    urgente: false,
    observacoes: "Extrato bancário",
  },
  {
    id: "corr-4",
    clienteId: "cliente",
    remetente: "Junta Comercial",
    tipo: "documento",
    dataRecebimento: "2024-12-19",
    status: "aguardando",
    urgente: false,
    observacoes: "Certidão de regularidade",
  },
]

export const audiencias: Audiencia[] = [
  {
    id: "aud-1",
    clienteId: "carlos.silva",
    processo: "1234567-89.2024.8.26.0100",
    tribunal: "1ª Vara Cível - Foro Central",
    data: "2024-12-25",
    horario: "14:30",
    tipo: "inicial",
    status: "agendada",
    urgencia: "alta",
    observacoes: "Audiência de conciliação",
  },
  {
    id: "aud-2",
    clienteId: "carlos.silva",
    processo: "9876543-21.2024.8.26.0200",
    tribunal: "2ª Vara Trabalhista",
    data: "2024-12-28",
    horario: "10:00",
    tipo: "instrucao",
    status: "agendada",
    urgencia: "media",
    observacoes: "Oitiva de testemunhas",
  },
]

export const avisos: Aviso[] = [
  {
    id: "av-1",
    clienteId: "carlos.silva",
    titulo: "Nova correspondência urgente",
    mensagem: "Intimação do Tribunal de Justiça aguardando retirada",
    tipo: "warning",
    urgencia: "alta",
    dataEnvio: "2024-12-18",
    lido: false,
    resolvido: false,
  },
  {
    id: "av-2",
    clienteId: "contato",
    titulo: "Documentos fiscais recebidos",
    mensagem: "Receita Federal enviou documentos para sua empresa",
    tipo: "info",
    urgencia: "media",
    dataEnvio: "2024-12-17",
    lido: false,
    resolvido: false,
  },
  {
    id: "av-3",
    clienteId: "cliente",
    titulo: "Certidão disponível",
    mensagem: "Junta Comercial enviou certidão de regularidade",
    tipo: "info",
    urgencia: "media",
    dataEnvio: "2024-12-19",
    lido: false,
    resolvido: false,
  },
]

// Funções auxiliares
export function getClienteById(id: string): Cliente | undefined {
  return clientes.find((c) => c.id === id)
}

export function getSalaById(id: string): Sala | undefined {
  return salas.find((s) => s.id === id)
}

export function getReservasByClienteId(clienteId: string): Reserva[] {
  return reservas.filter((r) => r.clienteId === clienteId)
}

export function getCorrespondenciasByClienteId(clienteId: string): Correspondencia[] {
  return correspondencias.filter((c) => c.clienteId === clienteId)
}

export function getAudienciasByClienteId(clienteId: string): Audiencia[] {
  return audiencias.filter((a) => a.clienteId === clienteId)
}

export function getAvisosByClienteId(clienteId: string): Aviso[] {
  return avisos.filter((a) => a.clienteId === clienteId)
}

export function canReserveSalas(clienteId: string): boolean {
  const cliente = getClienteById(clienteId)
  return cliente?.plano === "mensalista"
}

export function hasAudienciaAccess(clienteId: string): boolean {
  const cliente = getClienteById(clienteId)
  return cliente?.plano === "mensalista"
}

export function getPlanoInfo(plano: string) {
  const planos = {
    comercial: {
      nome: "Comercial",
      valor: 180,
      cor: "bg-gray-100 text-gray-800",
      beneficios: ["Endereço comercial", "Recebimento de correspondências", "Atendimento telefônico básico"],
    },
    fiscal: {
      nome: "Fiscal",
      valor: 280,
      cor: "bg-gray-100 text-gray-800",
      beneficios: [
        "Endereço fiscal para CNPJ",
        "Recebimento de correspondências",
        "Gestão de documentos fiscais",
        "Suporte empresarial",
      ],
    },
    mensalista: {
      nome: "Mensalista",
      valor: 450,
      cor: "bg-orange-100 text-orange-800",
      beneficios: [
        "Endereço comercial completo",
        "Recebimento de correspondências",
        "Acesso às salas de reunião",
        "Controle de audiências",
        "Suporte jurídico especializado",
      ],
    },
    admin: {
      nome: "Administrador",
      valor: 0,
      cor: "bg-red-100 text-red-800",
      beneficios: ["Acesso completo ao sistema", "Gerenciamento de clientes", "Relatórios administrativos"],
    },
  }

  if (plano === "comercial") {
    const fiscal = planos.fiscal
    return { ...fiscal, nome: "Comercial", valor: 180 }
  }
  return planos[plano as keyof typeof planos] || planos.comercial
}

// Função de validação de login
export function validarLogin(email: string, senha: string) {
  const contasDemo = {
    "admin@eoffice1321.com.br": {
      senha: "admin123",
      user: {
        id: "admin",
        nome: "Administrador",
        email: "admin@eoffice1321.com.br",
        tipo: "admin",
        plano: "admin",
      },
      redirect: "/admin",
    },
    "carlos.silva@advocaciasilva.com.br": {
      senha: "mensalista123",
      user: {
        id: "carlos.silva",
        nome: "Dr. Carlos Eduardo Silva",
        email: "carlos.silva@advocaciasilva.com.br",
        tipo: "cliente",
        plano: "mensalista",
      },
      redirect: "/dashboard",
    },
    "cliente@exemplo.com.br": {
      senha: "cliente123",
      user: {
        id: "cliente",
        nome: "Cliente Exemplo",
        email: "cliente@exemplo.com.br",
        tipo: "cliente",
        plano: "fiscal",
      },
      redirect: "/dashboard",
    },
  }

  const conta = contasDemo[email as keyof typeof contasDemo]

  if (conta && conta.senha === senha) {
    return {
      success: true,
      user: conta.user,
      redirect: conta.redirect,
      message: "Login realizado com sucesso!",
    }
  }

  return {
    success: false,
    message: "Email ou senha incorretos",
  }
}

// Função para verificar conflitos de reserva
export function verificarConflito(
  salaId: string,
  data: string,
  horaInicio: string,
  horaFim: string,
  reservaId?: string,
): boolean {
  const reservasExistentes = reservas.filter(
    (r) => r.salaId === salaId && r.data === data && r.status !== "cancelada" && r.id !== reservaId,
  )

  for (const reserva of reservasExistentes) {
    const inicioExistente = new Date(`${data}T${reserva.horaInicio}`)
    const fimExistente = new Date(`${data}T${reserva.horaFim}`)
    const novoInicio = new Date(`${data}T${horaInicio}`)
    const novoFim = new Date(`${data}T${horaFim}`)

    // Verificar sobreposição
    if (
      (novoInicio >= inicioExistente && novoInicio < fimExistente) ||
      (novoFim > inicioExistente && novoFim <= fimExistente) ||
      (novoInicio <= inicioExistente && novoFim >= fimExistente)
    ) {
      return true
    }
  }

  return false
}

// Função para calcular valor da reserva
export function calcularValorReserva(salaId: string, horaInicio: string, horaFim: string, plano: string): number {
  const sala = getSalaById(salaId)
  if (!sala) return 0

  const inicio = new Date(`2024-01-01T${horaInicio}`)
  const fim = new Date(`2024-01-01T${horaFim}`)
  const horas = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60)

  let valorTotal = sala.valorHora * horas

  // Aplicar desconto para mensalistas
  if (plano === "mensalista") {
    valorTotal *= 0.8 // 20% de desconto
  }

  return valorTotal
}
