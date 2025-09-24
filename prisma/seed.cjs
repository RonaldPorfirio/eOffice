/* eslint-disable */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcryptjs')

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin', 10)
  await prisma.usuario.upsert({
    where: { email: 'admin@eoffice.com' },
    update: {},
    create: {
      id: 'admin',
      nome: 'Administrador',
      email: 'admin@eoffice.com',
      senha: adminPassword,
      role: 'admin'
    },
  })

  // Create demo rooms
  const salas = [
    {
      id: 'sala-a',
      nome: 'Sala A',
      capacidade: 6,
      recursos: ['Wi-Fi', 'Ar condicionado', 'Mesa', 'Cadeiras confortáveis', 'Decoração moderna'],
      valorHora: 0,
      disponivel: true,
      descricao: 'Ambiente reservado para reuniões menores e atendimentos privados.',
      imagem: '/salas/sala-a.jpeg',
      area: 25,
    },
    {
      id: 'sala-b',
      nome: 'Sala B',
      capacidade: 6,
      recursos: ['Wi-Fi', 'Ar condicionado', 'Mesa', 'Cadeiras confortáveis', 'Decoração moderna'],
      valorHora: 0,
      disponivel: true,
      descricao: 'Ambiente reservado para reuniões menores e atendimentos privados.',
      imagem: '/salas/sala-b.jpeg',
      area: 30,
    },
    {
      id: 'sala-c',
      nome: 'Sala C',
      capacidade: 4,
      recursos: ['Wi-Fi', 'Ar condicionado', 'Mesa', 'Cadeiras confortáveis', 'Decoração moderna'],
      valorHora: 0,
      disponivel: true,
      descricao: 'Ambiente reservado para reuniões menores e atendimentos privados.',
      imagem: '/salas/sala-c.jpeg',
      area: 20,
    },
    {
      id: 'sala-d',
      nome: 'Sala D',
      capacidade: 4,
      recursos: ['Wi-Fi', 'Ar condicionado', 'Mesa', 'Cadeiras confortáveis', 'Decoração moderna'],
      valorHora: 150,
      disponivel: true,
      descricao: 'Sala ampla para eventos, treinamentos e reuniões maiores.',
      imagem: '/salas/sala-d.jpeg',
      area: 40,
    }
  ]

  for (const sala of salas) {
    await prisma.sala.upsert({
      where: { id: sala.id },
      update: {},
      create: {
        ...sala,
        recursos: JSON.stringify(sala.recursos)
      },
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