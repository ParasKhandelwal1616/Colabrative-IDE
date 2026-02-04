import express from 'express';
import { Server } from 'socket.io';
import http from 'http';

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:3000" }
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-project', (projectId) => {
        socket.join(projectId);
        console.log(`User ${socket.id} joined project ${projectId}`);
    });
})


server.listen(5000, () => {
    console.log('Server is running on port 5000');
})