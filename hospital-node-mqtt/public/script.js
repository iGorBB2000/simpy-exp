const socket = io();

/* Button Event Listeners
document.getElementById("startBtn").addEventListener("click", () => {
    socket.emit("control", { action: "start" });
});

document.getElementById("stopBtn").addEventListener("click", () => {
    socket.emit("control", { action: "stop" });
});

document.getElementById("restartBtn").addEventListener("click", () => {
    document.getElementById("waitingList").innerHTML = "";
    document.getElementById("currentlyTreatedList").innerHTML = "";
    document.getElementById("dischargedList").innerHTML = "";
    socket.emit("control", { action: "restart" });
});*/

// Handling real-time patient updates
socket.on("hospitalUpdate", (data) => {
    const { patient, status, time } = data;

    const logMessage = `${patient} is ${status} at ${time} minutes.`;
    const logItem = document.createElement("li");
    logItem.textContent = logMessage;
    document.getElementById("logList").prepend(logItem);

    if (status === "entered") {
        const waitingListItem = document.createElement("li");
        waitingListItem.textContent = patient;
        document.getElementById("waitingList").appendChild(waitingListItem);
    }

    if (status === "being_treated") {
        const waitingList = document.getElementById("waitingList");
        const patientItems = Array.from(waitingList.getElementsByTagName("li"));

        let patientItem = patientItems.find(item => item.textContent == patient);
        if (patientItem) {
            waitingList.removeChild(patientItem);
        }

        const treatedListItem = document.createElement("li");
        treatedListItem.textContent = `${patient} - currently treated`;
        document.getElementById("currentlyTreatedList").appendChild(treatedListItem);
    }

    if (status === "left") {
        const currentlyTreatedList = document.getElementById("currentlyTreatedList");
        const patientItems = Array.from(currentlyTreatedList.getElementsByTagName("li"));

        let patientItem = patientItems.find(item => item.textContent === patient + " - currently treated");
        if (patientItem) {
            currentlyTreatedList.removeChild(patientItem);
        }

        const dischargedListItem = document.createElement("li");
        dischargedListItem.textContent = `${patient} - discharged`;
        document.getElementById("dischargedList").appendChild(dischargedListItem);
    }
});
