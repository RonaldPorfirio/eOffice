// Prisma configuration file to replace deprecated package.json#prisma
// See: https://pris.ly/prisma-config

import { defineConfig } from '@prisma/config'

export default defineConfig({
  seed: {
    run: 'node prisma/seed.cjs',
  },
})
