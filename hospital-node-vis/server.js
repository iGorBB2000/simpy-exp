const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { spawn } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let simpyProcess = null;
let isRunning = false;
let buffer = '';

function startSimulation() {
    if (isRunning) return;
    console.log("Starting Simulation...");
    isRunning = true;

    simpyProcess = spawn("python", ["-u", "simulation-rt.py"], { stdio: ["pipe", "pipe", "pipe"] });

    simpyProcess.stdout.on("data", (data) => {
        buffer += data.toString();

        let lines = buffer.split("\n");
        buffer = lines.pop();
        
        for (let line of lines) {
            if (line.trim()) {
                try {
                    const jsonData = JSON.parse(line);
                    console.log(`[HospitalSim|Out] Patient ${jsonData.patient} is ${jsonData.status} at ${jsonData.time} minutes.`);
                    io.emit("hospitalUpdate", jsonData);
                } catch (error) {
                    console.error("Invalid data from SimPy:", data.toString());
                }
            }
        }
    });

    simpyProcess.on("close", () => {
        isRunning = false;
        console.log("Simulation Ended");
    });
}

function stopSimulation() {
    if (simpyProcess) {
        console.log("Stopping Simulation...");
        simpyProcess.kill();
        simpyProcess = null;
        isRunning = false;
    }
}

function restartSimulation() {
    stopSimulation();
    setTimeout(startSimulation, 1000);
}

io.on("connection", (socket) => {
    console.log("Frontend connected.");

    socket.on("control", (data) => {
        if (data.action === "start") startSimulation();
        if (data.action === "stop") stopSimulation();
        if (data.action === "restart") restartSimulation();
    });
});

server.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
