const express = require('express');
const fs = require('fs');
const basicAuth = require('express-basic-auth');
const Hue = require('philips-hue');
const { exec } = require('child_process');
require('./calendar');

let hue = new Hue();
let app = express();
let hueConfig = process.cwd() + '/.philips-hue.json';
let calendarAuth;

// init device connections
initHue();

function initHue() {
    console.log("connecting to hue ...");
    hue.login(hueConfig)
        .then((conf) => {
            console.log("hue up");
        })
        .catch((err) => {
            console.log(err);
            setTimeout(initHue, 1000)
        });
}

initCalendar();

function initCalendar() {
    console.log("connecting to callendar ...");

    authorizeFromFile((oAuth) => {
        console.log("callendar up");
        calendarAuth = oAuth;
    });
}



// controll a specific light
app.post('/lights/:id', (req, res) => {
    console.log("turning light " + req.params.id + " " + req.get("power"));
    setPower(req.params.id, req.get("power"));

    res.sendStatus(200);
});

// controll all reachable lights
app.post('/lights', (req, res) => {
    postLights(req);
    res.sendStatus(200);
});
function postLights(req){
    hue.getLights().then(function (lights) {
        for (let id in lights) {
            if (lights.hasOwnProperty(id)) {
                if (lights[id].state.reachable === true) {
                    setPower(id, req.get("power"));
                    setBrightness(id, req.get("brightness"));
                }
            }
        }
    }).catch(function (err) {
        console.error(err.stack || err);
    });
}

// controll the pi's screen
app.post('/screen', (req, res) => {
    postScreen(req);
    res.sendStatus(200)
});

function postScreen(req){
    if(req.get("power") === "on") {
        console.log("turn screen on");
        exec("vcgencmd display_power 1", handleError);
    } else {
        console.log("turn screen off");
        exec("vcgencmd display_power 0", handleError);
    }

    function handleError(error, stdout, stderr) {
        if(error) {
            console.log("error: " + error)
        }
        if(stdout) {
            console.log("stdout: " + stdout)
        }
        if(stderr) {
            console.log("stderr: " + stderr)
        }
    }
}

app.post('/', (req, res) => {
    postLights(req);
    postScreen(req);
    res.sendStatus(200);
});

app.get('/calendar', (req, res) => {
    let numEvents = req.query.numEvents | 1;
    listEvents(calendarAuth, numEvents, (events) => {
        res.send(JSON.stringify(events));
    });
});

fs.readFile('.basic_auth.json', function processClientSecrets(err, config) {
    if (err) {
        console.log('Error loading basic auth file: ' + err);
        return;
    }

    app.use(basicAuth(JSON.parse(config)));
    app.use(express.static('static'));
    app.listen(3000);
});

function setPower(id, power) {
    if (power === "on") {
        hue.light(id).on()
    } else if (power === "off") {
        hue.light(id).off()
    }
}

function setBrightness(id, brightness) {
    if (brightness) {
        setPower(id, "on");
        hue.light(id).setState({bri: parseInt(brightness)})
    }
}
