const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mqtt = require('mqtt');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const MQTT_BROKER = "mqtt://10.0.0.43";
const MQTT_TOPIC = "hospital/patients";

const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on("connect", () => {
    console.log("Connected to MQTT Broker.");
    mqttClient.subscribe(MQTT_TOPIC, (err) => {
        if (err) {
            console.error("Failed to subscribe to topic:", err);
        } else {
            console.log(`Subscribed to topic: ${MQTT_TOPIC}`);
        }
    });
});

mqttClient.on("message", (topic, message) => {
    try {
        const jsonData = JSON.parse(message.toString());
        console.log(`[HospitalSim|MQTT] Patient ${jsonData.patient} is ${jsonData.status} at ${jsonData.time} minutes.`);
        
        io.emit("hospitalUpdate", jsonData);
    } catch (error) {
        console.error("Invalid MQTT data received:", message.toString());
    }
});

io.on("connection", (socket) => {
    console.log("Frontend connected.");
});

server.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
