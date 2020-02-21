const { navigationHandler } = require("boat-simulation/dist/navigationHandler");
const { BoatControl } = require('motorControl');
const axios = require('axios');

const NAVIGATION_RATE = 100;
const HEARTBEAT_RATE = 3000;

let port = null;

let intervals = {
    navigation: null,
    heartbeat: null
};

let status = {
    fence: [],
    wayPoints: [],
    engine: BoatControl,
    command: "STOP"
};

let setParams = ({ fence, wayPoints, command }) => {
    if (valid(fence)) status.fence = fence;

    if (valid(wayPoints)) status.wayPoints = wayPoints;

    if (typeof command === "string") {
        status.command = command;
        executeCommand();
    }

    console.table(status);
};

let executeCommand = () => {
    switch(status.command) {
        case 'SEARCH':
            // Boat.search()
            break;

        case 'RETURN':
            // Boat.return()
            break;

        case 'STOP':
            BoatControl.setPowerLeft(0);
            BoatControl.setPowerRight(0);
            break;

        case 'TEST':
            console.log('asd');
            BoatControl.setPowerLeft(1);
            BoatControl.setPowerRight(1);
            break;

        default:
            console.log('No command to execute.');
            break;
    }
};

let valid = (arr) => Array.isArray(arr) && arr.length > 0;

let navigate = () => {
    if (valid(status.position) && valid(status.fence)) {
        // navigationHandler(status);
    }
};

let heartbeat = () => {
    axios
        .post('https://sea-drone-center.herokuapp.com/api/boats/1', { clear: true })
        .then(res => setParams(res.data))
        .catch(err => console.log(err));
};

intervals.heartbeat = setInterval(heartbeat, HEARTBEAT_RATE);
intervals.navigation = setInterval(navigate, NAVIGATION_RATE);