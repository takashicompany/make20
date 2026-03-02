import { defineConfig } from 'vite'

export default defineConfig({
  base: '/make20/',
  server: {
    host: true,
    port: 5173,
  },
  plugins: [
    {
      name: 'log-receiver',
      configureServer(server) {
        server.middlewares.use('/api/log', (req, res) => {
          if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk: Buffer) => (body += chunk.toString()))
            req.on('end', () => {
              console.log(`[DEVICE] ${body}`)
              res.writeHead(200, { 'Content-Type': 'text/plain' })
              res.end('ok')
            })
          } else {
            res.writeHead(405)
            res.end()
          }
        })
      },
    },
  ],
})
