// Server statico minimo per vedere il mockup: node serve.mjs → http://localhost:6880
// Solo sviluppo: POST /__save/<nome> scrive un'immagine in covers/ (usato da _tmp/warp.html).
import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webp': 'image/webp' };

http.createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (req.method === 'POST' && p.startsWith('/__save/')) {
    const name = p.slice(8);
    if (!/^[a-z0-9_-]+\.(jpg|png)$/i.test(name)) { res.writeHead(400).end('bad name'); return; }
    const chunks = []; for await (const c of req) chunks.push(c);
    await writeFile(join(root, 'covers', name), Buffer.concat(chunks));
    res.writeHead(200).end('ok'); return;
  }
  if (p.endsWith('/')) p += 'index.html';
  const file = normalize(join(root, p));
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(404).end('not found'); }
}).listen(+process.env.PORT || 6880, function () { console.log('http://localhost:' + this.address().port); });
