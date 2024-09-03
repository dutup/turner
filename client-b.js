const axios = require('axios');
const io = require('socket.io-client');
const fs = require('fs');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected to relay server');

    socket.emit('join-stream');
});

socket.on('request-stream', () => {
    console.log('Received request to stream data');

    const stream = fs.createReadStream('input.txt');

    stream.on('data', (chunk) => {
        axios.post('http://localhost:3000/stream', chunk, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Length': chunk.length
            }
        }).then(() => {
            console.log('Data sent to relay server');
        }).catch((error) => {
            console.error('Error sending data to relay server', error);
        });
    });

    stream.on('end', () => {
        console.log('Data stream finished');
    });
});