let oldBrightness = null;
let currentEvent = null;
let charLimit = 40;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("clock").innerHTML = timeNow();
    updateCalendar();

    setInterval(() => {
        document.getElementById("clock").innerHTML = timeNow();
        document.getElementById("event-time").innerHTML = deltaTCalendar();
    }, 500);

    setInterval(() => {
        updateCalendar();
    }, 10000);
}, false);

function timeNow() {
    let currentDate = new Date();
    return ((currentDate.getHours() < 10) ? "0" : "") + currentDate.getHours() + ":" + ((currentDate.getMinutes() < 10) ? "0" : "") + currentDate.getMinutes();
}

function deltaTCalendar() {
    if (currentEvent !== null) {
        let deltaMs = new Date(currentEvent.start.dateTime) - new Date();
        let deltaH = Math.round(deltaMs / (1000 * 60 * 60));
        let deltaM = Math.round((deltaMs / (1000 * 60)) - deltaH * 60);
        let deltaS = Math.round((deltaMs / (1000)) - deltaM * 60);
        return deltaH.toString() + "H " + deltaM + "m " + (deltaH === 0 ? deltaS + "s" : "");
    } else {
        return "...";
    }
}

function updateCalendar() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            currentEvent = JSON.parse(this.responseText)[0];
            let summary = currentEvent.summary;
            if(summary.length > charLimit) {
                summary = summary.substr(0, charLimit - 3);
                summary += "...";
            }
            document.getElementById("event-name").innerHTML = summary;
        }
    };
    xhttp.open("GET", "calendar", true);
    xhttp.send();
}

function updateBrightness(value) {
    if (oldBrightness === null || oldBrightness !== value) {
        let xhttp = new XMLHttpRequest();
        xhttp.open("POST", "lights", true);
        xhttp.setRequestHeader("brightness", value);
        xhttp.send();
        oldBrightness = value;
    }
}

function updatePower(value) {
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "lights", true);
    xhttp.setRequestHeader("power", value);
    xhttp.send();
    oldBrightness = value;
}


