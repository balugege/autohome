const express = require('express');
const Hue = require('philips-hue');
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


app.use(express.static('static'));

// controll a specific light
app.post('/lights/:id', (req, res) => {
    console.log("turning light " + req.params.id + " " + req.get("power"));
    setPower(req.params.id, req.get("power"));

    res.sendStatus(200);
});

// controll all reachable lights
app.post('/lights', (req, res) => {
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
        res.sendStatus(500);
    });

    res.sendStatus(200);
});

app.get('/calendar', (req, res) => {
    let numEvents = req.query.numEvents | 1;
    listEvents(calendarAuth, numEvents, (events) => {
        res.send(JSON.stringify(events));
    });
});

app.listen(3000);

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
