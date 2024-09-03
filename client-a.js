const axios = require('axios');
const fs = require('fs');

// Function to handle stream
async function getStream() {
    console.log('Getting stream from relay server...');
    const response = await axios({
        method: 'get',
        url: 'http://localhost:3000/stream',
        responseType: 'stream',
    });

    response.data.pipe(fs.createWriteStream('output.txt'));
    console.log('Streaming data from relay server...');
}

getStream();
