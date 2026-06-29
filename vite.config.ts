import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  environments: {
    ssr: {
      build: {
        rollupOptions: {
          // Rolldown cannot resolve this subpath during SSR build — externalize so Nitro resolves at runtime
          external: ['@tanstack/start-server-core/request-response'],
        },
      },
    },
  },
})

export default config
