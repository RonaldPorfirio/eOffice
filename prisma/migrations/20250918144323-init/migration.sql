-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Plano" AS ENUM ('comercial', 'fiscal', 'mensalista');

-- CreateEnum
CREATE TYPE "public"."StatusCliente" AS ENUM ('ativo', 'inativo', 'pendente');

-- CreateEnum
CREATE TYPE "public"."StatusReserva" AS ENUM ('confirmada', 'pendente', 'cancelada', 'em_andamento');

-- CreateEnum
CREATE TYPE "public"."TipoCorrespondencia" AS ENUM ('carta', 'sedex', 'ar', 'telegrama', 'documento');

-- CreateEnum
CREATE TYPE "public"."StatusCorrespondencia" AS ENUM ('aguardando', 'retirada', 'devolvida');

-- CreateEnum
CREATE TYPE "public"."TipoAudiencia" AS ENUM ('inicial', 'instrucao', 'sentenca', 'recurso');

-- CreateEnum
CREATE TYPE "public"."StatusAudiencia" AS ENUM ('agendada', 'realizada', 'adiada', 'cancelada');

-- CreateEnum
CREATE TYPE "public"."Urgencia" AS ENUM ('baixa', 'media', 'alta');

-- CreateEnum
CREATE TYPE "public"."TipoAviso" AS ENUM ('info', 'warning', 'error', 'success');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('admin', 'cliente');

-- CreateTable
CREATE TABLE "public"."Cliente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "plano" "public"."Plano" NOT NULL,
    "status" "public"."StatusCliente" NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "endereco" TEXT,
    "documento" TEXT,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Sala" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL,
    "recursos" JSONB NOT NULL,
    "valorHora" DOUBLE PRECISION NOT NULL,
    "disponivel" BOOLEAN NOT NULL,
    "descricao" TEXT NOT NULL,
    "imagem" TEXT,
    "area" INTEGER NOT NULL,

    CONSTRAINT "Sala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reserva" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "salaId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,
    "status" "public"."StatusReserva" NOT NULL,
    "observacoes" TEXT,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "dataReserva" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Correspondencia" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "remetente" TEXT NOT NULL,
    "tipo" "public"."TipoCorrespondencia" NOT NULL,
    "dataRecebimento" TIMESTAMP(3) NOT NULL,
    "status" "public"."StatusCorrespondencia" NOT NULL,
    "urgente" BOOLEAN NOT NULL,
    "observacoes" TEXT,

    CONSTRAINT "Correspondencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Audiencia" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "processo" TEXT NOT NULL,
    "tribunal" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "horario" TEXT NOT NULL,
    "tipo" "public"."TipoAudiencia" NOT NULL,
    "status" "public"."StatusAudiencia" NOT NULL,
    "urgencia" "public"."Urgencia" NOT NULL,
    "observacoes" TEXT,

    CONSTRAINT "Audiencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Aviso" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "tipo" "public"."TipoAviso" NOT NULL,
    "urgencia" "public"."Urgencia" NOT NULL,
    "dataEnvio" TIMESTAMP(3) NOT NULL,
    "lido" BOOLEAN NOT NULL,
    "resolvido" BOOLEAN NOT NULL,

    CONSTRAINT "Aviso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "clienteId" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "public"."Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "public"."Usuario"("email");

-- AddForeignKey
ALTER TABLE "public"."Reserva" ADD CONSTRAINT "Reserva_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reserva" ADD CONSTRAINT "Reserva_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "public"."Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Correspondencia" ADD CONSTRAINT "Correspondencia_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Audiencia" ADD CONSTRAINT "Audiencia_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Aviso" ADD CONSTRAINT "Aviso_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Usuario" ADD CONSTRAINT "Usuario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

