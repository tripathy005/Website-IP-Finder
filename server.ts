import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import app from './src/server/app';

async function startServer() {
  const PORT = 3000;

  // Catch-All 404 for unhandled API routes before frontend middleware
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint '${req.originalUrl}' not found.` });
  });

  // Serve Frontend via Vite Middleware in Dev or Static Files in Prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Website IP Finder server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
