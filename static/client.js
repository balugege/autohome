let oldBrightness = null;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("clock").innerHTML = timeNow();
    updateCalendar();

    setInterval(() => {
        document.getElementById("clock").innerHTML = timeNow();
    }, 500);

    setInterval(() => {
        updateCalendar();
    }, 5000);
}, false);

function timeNow() {
    let currentDate = new Date();
    return ((currentDate.getHours() < 10)?"0":"") + currentDate.getHours() +":"+ ((currentDate.getMinutes() < 10)?"0":"") + currentDate.getMinutes();
}

function updateCalendar() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            let event = JSON.parse(this.responseText)[0];
            document.getElementById("calendar").innerHTML = event.summary;
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


