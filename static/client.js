let oldBrightness = null;

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


