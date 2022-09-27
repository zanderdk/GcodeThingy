import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/GcodeThingy/",
  plugins: [svelte()],
  optimizeDeps: {
    include: ["highlight.js", "highlight.js/lib/core"],
  },
})
