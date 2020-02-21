const { navigationHandler } = require("boat-simulation/dist/navigationHandler");
const { BoatControl } = require('motorControl');
const { start, stop, post } = require('communication/gsm');
const getPosition = require('communication/gps');
const getDetectedWaste = require('obstacle-detector');

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
    control: BoatControl,
    detector: null,
    command: "STOP",
    position: [],
    speed: 0,
    heading: 0
};

/**
 * @desc    Sets parameter to the status object after validating them.
 */
let setParams = ({ fence, wayPoints, command, position, speed, heading }) => {
    if (valid(fence)) status.fence = fence;

    if (valid(wayPoints)) status.wayPoints = wayPoints;

    if (valid(position)) status.position = position;

    if (typeof speed === "number") status.speed = speed;

    if (typeof heading === "number") status.heading = heading;

    if (typeof command === "string") status.command = command;
};

/**
 * @desc    Gets the Waste Detection Object and calls the navigationHandler
 *          if status has a valid position and fence.
 */
let navigate = () => {
    status.detector = await getDetectedWaste('192.168.1.2:3000').catch(err => console.log(err));

    if (valid(status.position) && valid(status.fence)) navigationHandler(status);
};

/**
 *  @desc   Gets Drone position via gps and sends the data to our server, which
 *          returns an available command, wayPoints and the fence.
 */
let heartbeat = () => {
    clearInterval(intervals.heartbeat);

    getPosition(port)
        .then(res => {
            setParams(res);

            post(getKeys(["position", "heading", "speed", "clear"], status))
                .then(res => setParams(res))
                .then(res => {
                    intervals.heartbeat = setInterval(heartbeat, HEARTBEAT_RATE);
                    console.table(status);
                });
        })
        .catch(err => console.log(err));
};

/**
 * @desc    Removes all keys in the given object that are not listed in the given array.
 * @param   validKeys: array
 * @param   object: object
 * @returns Object
 */
let getKeys = (validKeys, object) => {
    let newObject = {};

    Object.keys(object).forEach(key => {
        if (validKeys.includes(key)) newObject[key] = object[key]
    });

    return newObject;
};

/**
 * @desc    Checks if the given parameter is an array with a length greater than one.
 * @param   arr: array
 * @returns boolean
 */
let valid = (arr) => Array.isArray(arr) && arr.length > 0;

/**
 * @desc    Init-function which starts the gsm module and sets off the heartbeat
 *          and navigation interval.
 */
(function () {
    start().then(_port => {
        port = _port;
        console.log('GSM MODULE STARTED ON PORT: ' + _port);

        intervals.heartbeat = setInterval(heartbeat, HEARTBEAT_RATE);
        intervals.navigation = setInterval(navigate, NAVIGATION_RATE);
    })
})();