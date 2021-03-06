const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
let SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
let TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
let TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

authorizeFromFile = function (callback) {
    fs.readFile('.client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the
        // Google Calendar API.
        authorize(JSON.parse(content), callback);
    });
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Returns the next event on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param numEvents The max number of events to query.
 * @param callback Callback function accepting a list of events.
 */
listEvents = function (auth, numEvents, callback) {
    let calendar = google.calendar('v3');
    let items = [];
    let args = {
        auth: auth,
        calendarId: 'primary', // TODO we want all calendars not only primary
        timeMin: (new Date()).toISOString(),
        maxResults: numEvents,
        singleEvents: true,
        orderBy: 'startTime'
    };

    calendar.events.list(args, function (err, response) {
        if (err) {
            console.log('Calendar: ' + err);
            return;
        }
        items = items.concat(response.items);

        args.calendarId = "ikprimh1qq2ed51adikebfhierumhj96@import.calendar.google.com";
        calendar.events.list(args, function (err2, response2) {
            if (err2) {
                console.log('Calendar: ' + err);
                return;
            }
            items = items.concat(response2.items);
            items.sort((a, b) => {
                let dateA = new Date(a.start.dateTime);
                let dateB = new Date(b.start.dateTime);
                if (dateA < dateB) return -1;
                if (dateA > dateB) return 1;
                if (dateA === dateB) return 0;
            });

            callback(items);
        });
    });


};