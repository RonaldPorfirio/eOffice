/* eslint-disable */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcryptjs')

// SEED_MODE: 'admin' (default) creates only the admin user
//            'full' creates demo clients, rooms, reservations, and extra users
const SEED_MODE = process.env.SEED_MODE || 'admin'

async function main() {
  if (SEED_MODE === 'full') {
    // Clients (demo)
    const clientes = [
      {
        id: 'carlos.silva',
        nome: 'Dr. Carlos Eduardo Silva',
        email: 'carlos.silva@advocaciasilva.com.br',
        telefone: '(11) 99999-1111',
        plano: 'mensalista',
        status: 'ativo',
        dataInicio: new Date('2024-01-15'),
        endereco: 'Rua Augusta, 1000 - São Paulo/SP',
        documento: '123.456.789-00',
      },
      {
        id: 'contato',
        nome: 'TechStart Inovações',
        email: 'contato@techstart.com.br',
        telefone: '(11) 99999-2222',
        plano: 'fiscal',
        status: 'ativo',
        dataInicio: new Date('2024-02-01'),
        endereco: 'Av. Paulista, 2000 - São Paulo/SP',
        documento: '12.345.678/0001-90',
      },
      {
        id: 'maria',
        nome: 'Maria Fernanda Costa',
        email: 'maria@consultoriamfc.com.br',
        telefone: '(11) 99999-3333',
        plano: 'comercial',
        status: 'ativo',
        dataInicio: new Date('2024-03-10'),
        endereco: 'Rua Oscar Freire, 500 - São Paulo/SP',
        documento: '987.654.321-00',
      },
      {
        id: 'cliente',
        nome: 'Cliente Exemplo',
        email: 'cliente@exemplo.com.br',
        telefone: '(11) 99999-4444',
        plano: 'fiscal',
        status: 'ativo',
        dataInicio: new Date('2024-04-01'),
        endereco: 'Rua das Flores, 123 - São Paulo/SP',
        documento: '456.789.123-00',
      },
    ]

    for (const c of clientes) {
      await prisma.cliente.upsert({
        where: { id: c.id },
        update: {},
        create: c,
      })
    }

    // Rooms (demo)
    const salas = [
      {
        id: 'sala-1',
        nome: 'Sala Executiva A',
        capacidade: 6,
        recursos: ['Projetor', 'Wi-Fi', 'Ar condicionado', 'Mesa de reunião', 'Quadro branco'],
        valorHora: 80,
        disponivel: true,
        descricao: 'Sala executiva ideal para reuniões corporativas e apresentações.',
        imagem: '/placeholder.svg?height=200&width=300&text=Sala+Executiva+A',
        area: 25,
      },
      {
        id: 'sala-2',
        nome: 'Sala de Videoconferência',
        capacidade: 8,
        recursos: ['Sistema de videoconferência', 'Wi-Fi', 'Ar condicionado', 'Mesa oval', 'Tela grande'],
        valorHora: 120,
        disponivel: true,
        descricao: 'Equipada com sistema profissional de videoconferência para reuniões remotas.',
        imagem: '/placeholder.svg?height=200&width=300&text=Sala+Videoconferencia',
        area: 30,
      },
      {
        id: 'sala-3',
        nome: 'Sala Privativa B',
        capacidade: 4,
        recursos: ['Wi-Fi', 'Ar condicionado', 'Mesa redonda', 'Cadeiras executivas'],
        valorHora: 60,
        disponivel: true,
        descricao: 'Ambiente reservado para reuniões menores e atendimentos privados.',
        imagem: '/placeholder.svg?height=200&width=300&text=Sala+Privativa+B',
        area: 20,
      },
    ]

    for (const s of salas) {
      await prisma.sala.upsert({ where: { id: s.id }, update: {}, create: s })
    }

    // Reservations (demo)
    const reservas = [
      {
        id: 'res-1',
        clienteId: 'carlos.silva',
        salaId: 'sala-1',
        data: new Date('2024-12-20'),
        horaInicio: '09:00',
        horaFim: '11:00',
        status: 'confirmada',
        observacoes: 'Reunião com cliente importante',
        valorTotal: 160,
        dataReserva: new Date('2024-12-15'),
      },
      {
        id: 'res-2',
        clienteId: 'carlos.silva',
        salaId: 'sala-2',
        data: new Date('2024-12-22'),
        horaInicio: '14:00',
        horaFim: '16:00',
        status: 'pendente',
        observacoes: 'Videoconferência internacional',
        valorTotal: 240,
        dataReserva: new Date('2024-12-16'),
      },
      {
        id: 'res-3',
        clienteId: 'contato',
        salaId: 'sala-3',
        data: new Date('2024-12-21'),
        horaInicio: '10:00',
        horaFim: '12:00',
        status: 'confirmada',
        observacoes: 'Reunião de planejamento',
        valorTotal: 120,
        dataReserva: new Date('2024-12-17'),
      },
    ]

    for (const r of reservas) {
      await prisma.reserva.upsert({ where: { id: r.id }, update: {}, create: r })
    }
  }

  // Users
  const usuarios = [
    {
      nome: 'Administrador',
      email: 'admin@eoffice1321.com.br',
      senha: 'admin123',
      role: 'admin',
      clienteId: null,
    },
  ]

  if (SEED_MODE === 'full') {
    usuarios.push(
      {
        nome: 'Dr. Carlos Eduardo Silva',
        email: 'carlos.silva@advocaciasilva.com.br',
        senha: 'mensalista123',
        role: 'cliente',
        clienteId: 'carlos.silva',
      },
      {
        nome: 'Cliente Exemplo',
        email: 'cliente@exemplo.com.br',
        senha: 'cliente123',
        role: 'cliente',
        clienteId: 'cliente',
      },
      {
        nome: 'TechStart Inovações',
        email: 'contato@techstart.com.br',
        senha: 'cliente123',
        role: 'cliente',
        clienteId: 'contato',
      },
    )
  }

  for (const u of usuarios) {
    const senhaHash = bcrypt.hashSync(u.senha, 10)
    await prisma.usuario.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, senha: senhaHash },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

