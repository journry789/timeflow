import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ESM.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dist 目录：假定已在 client 根目录执行过 npm run build。
const distPath = path.resolve(__dirname, '..', 'dist');
const indexFile = path.join(distPath, 'index.html');

const app = express();
const port = Number(process.env.PORT) || 4173; // 与 Vite preview 默认端口一致
const host = process.env.HOST || '0.0.0.0';

app.use(compression());
app.use(
  express.static(distPath, {
    fallthrough: true,
    maxAge: '1d',
    setHeaders(res, filePath) {
      if (path.extname(filePath) === '.html') {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  })
);

// SPA 回退到 index.html
app.get('*', (_req, res) => {
  res.sendFile(indexFile);
});

app.listen(port, host, () => {
  console.log(`Timeflow Vue 测试服务器已启动: http://${host}:${port}`);
  console.log(`静态资源目录: ${distPath}`);
});
