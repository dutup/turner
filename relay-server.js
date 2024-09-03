const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { PassThrough } = require('stream');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// To store clients who will send data back
const dataClients = new Map();

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-stream', () => {
        dataClients.set(socket.id, socket);
        console.log('Client joined stream:', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        dataClients.delete(socket.id);
    });
});

app.get('/stream', (req, res) => {
    // Broadcast to all clients except the sender
    io.emit('request-stream');

    // Setup a PassThrough stream to handle incoming data
    const passThrough = new PassThrough();

    // Listen for data from clients
    dataClients.forEach((client) => {
        client.on('data', (chunk) => {
            passThrough.write(chunk);
        });
    });

    // Pipe the stream to the response
    passThrough.pipe(res);

    req.on('close', () => {
        passThrough.end();
    });
});

app.post('/stream', (req, res) => {
    console.log('Received data from client');
    req.on('data', (chunk) => {
        // Broadcast the incoming data to clients
        io.emit('data', chunk);
    });

    req.on('end', () => {
        res.status(200).send('Data received');
    });
});

server.listen(3000, () => {
    console.log('Relay server listening on port 3000');
});