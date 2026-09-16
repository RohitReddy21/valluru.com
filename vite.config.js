import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Serves the files in /api the way Vercel does, so `npm run dev` can exercise
 * the same admin save and resource endpoints as production.
 */
function vercelApiDevServer(env) {
  return {
    name: 'vercel-api-dev-server',
    apply: 'serve',
    configureServer(server) {
      Object.assign(process.env, env)

      server.middlewares.use('/api', async (request, response, next) => {
        const route = request.url.split('?')[0].replace(/^\/+|\/+$/g, '')
        if (!route) return next()

        try {
          const module = await server.ssrLoadModule(`/api/${route}.js`)
          await module.default(request, response)
        } catch (error) {
          server.config.logger.error(`[api] ${route}: ${error.message}`)
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ error: error.message }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), vercelApiDevServer(env)],
    // Listen on all interfaces so phones on the same Wi-Fi can open the dev server.
    server: { host: true },
    preview: { host: true },
  }
})
