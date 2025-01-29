const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { spawn } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const hospitalSim = spawn('python', ['-u', 'simulation-rt.py']);

let buffer = '';

hospitalSim.stdout.on('data', (data) => {
    buffer += data.toString();

    let lines = buffer.split("\n");
    buffer = lines.pop();

    for (let line of lines) {
        if (line.trim()) {
            try {
                let event = JSON.parse(line);
                console.log(`[HospitalSim|Out] Patient ${event.patient} is ${event.status} at ${event.time} minutes.`);

                io.emit('status_update', event);
            } catch (error) {
                console.error(`[HospitalSim|Err] Failed to parse JSON: ${line}`, error);
            }
        }
    }
});

hospitalSim.on('close', () => {
    if (buffer.trim()) {
        try {
            let event = JSON.parse(buffer);
            console.log(`[HospitalSim|Out] Patient ${event.patient} is ${event.status} at ${event.time} minutes.`);
            io.emit('status_update', event);
        } catch (error) {
            console.error(`[HospitalSim|Err] Failed to parse remaining JSON: ${buffer}`, error);
        }
    }
});

hospitalSim.stderr.on('data', (data) => {
    console.error(`[HospitalSim|Err] ${data.toString()}`);
});

server.listen(5000, () => {
    console.log('Node.js server running on http://localhost:5000');
});