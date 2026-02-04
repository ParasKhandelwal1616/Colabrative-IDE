import { setupWSConnection } from 'y-websocket/bin/utils';
import http from 'http';
import { WebSocketServer } from 'ws';

const port = 1234;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Yjs WebSocket Server');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req);
  console.log('New collaborative session started');
});

server.listen(port, () => {
  console.log(`Yjs Sync Server running on port ${port}`);
});