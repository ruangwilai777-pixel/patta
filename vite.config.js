import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  console.error('[CONFIG LOADED] mode is:', mode);
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'local-api-proxy',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const url = new URL(req.url, 'http://localhost');
            if (url.pathname === '/api/ai-bill-parser') {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Method not allowed' }));
                return;
              }

              let body = '';
              req.on('data', chunk => {
                body += chunk;
              });

              req.on('end', async () => {
                try {
                  req.body = JSON.parse(body);
                  
                  // Mock Vercel response helper methods
                  res.status = (code) => {
                    res.statusCode = code;
                    return res;
                  };
                  res.json = (data) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                  };

                  // Inject API key from Vite config loaded env
                  process.env.GEMINI_API_KEY = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;

                  // Dynamically import and run Vercel serverless function
                  const handlerModule = await server.ssrLoadModule('/api/ai-bill-parser.js');
                  await handlerModule.default(req, res);
                } catch (err) {
                  console.error('Vite local API handler error:', err);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
                }
              });
            } else {
              next();
            }
          });
        }
      }
    ],
    build: {
      emptyOutDir: true,
      rollupOptions: {
        input: {
          dummy: resolve(__dirname, 'dummy.html')
        }
      }
    }
  }
})
