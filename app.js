// Dependencies
const { navigationHandler } = require('boat-simulation/dist/navigationHandler');
const { BoatControl } = require('motorControl');
const start = require('communication/start');
const stop = require('communication/stop');
const post = require('communication/post');
const getPosition = require('communication/gps');
const getDetectedWaste = require('obstacle-detector');
const logger = require('logger');

const MODE = process.argv.slice(2)[0];
const NAVIGATION_RATE = 1000;
const HEARTBEAT_RATE = 5000;
const WAIT_FOR_GPS_ACCURACY = (MODE === 'PRODUCTION') ? 60000 : 0;
const MAXIMUM_SERVER_RESPONSE_TIME = 10000;

let port = null;
let parser = null;
let heartbeatTimeout = null;

let intervals = {
    navigation: null,
    heartbeat: null
};

let status = {
    coordinates: [],
    startPoint: null,
    wayPoints: [],
    control: BoatControl,
    trash: [],
    command: "STOP",
    commandChanged: false,
    position: [],
    speed: 0,
    heading: 0
};

/**
 * @desc    Sets parameter to the status object after validating them.
 * @params  coordinates, wayPoints, command, position, speed, heading
 */
let setParams = ({ coordinates, wayPoints, command, position, speed, heading }) => {
    if (valid(coordinates))
        status.coordinates = coordinates;

    if (valid(wayPoints))
        status.wayPoints = wayPoints;

    if (valid(position))
        status.position = position;

    if (valid(position)) {
        if (status.startPoint === null)
            status.startPoint = position;
    }

    if (typeof speed === "number")
        status.speed = speed;

    if (typeof heading === "number")
        status.heading = heading;

    if (typeof command === "string") {
        if (status.command !== command) {
            status.commandChanged = true;
        }

        status.command = command;
    }
};

/**
 * @desc    Gets the Waste Detection Object and calls the navigationHandler
 *          if status has a valid position and coordinates.
 */
let navigation = () => {
    // status.trash = await getDetectedWaste('192.168.1.2:3000').catch(err => console.log(err));

    if (valid(status.position) && valid(status.coordinates)) {
        let tempStatus = JSON.parse(JSON.stringify(status));

        tempStatus.coordinates = tempStatus.coordinates.map(([lat, lng]) => ({
            longitude: lng,
            latitude: lat
        }));

        tempStatus.enableRandom = (tempStatus.command === 'RANDOM');


        tempStatus.position = {
            getHeading: () => tempStatus.heading,
            getPosition: () => {
                return { latitude: 52.503591, longitude: 13.409392 };
            },
        };

        tempStatus.control = BoatControl;

        if (tempStatus.command === 'STOP') {
            stopMotors();
        } else {
            navigationHandler(getKeys(["control", "position", "command", "coordinates", "trash", "enableRandom"], tempStatus));
        }

        if (status.commandChanged) {
            status.commandChanged = false;
            logger.info(`NAVIGATING: ${JSON.stringify(getKeys(["command"], tempStatus))}`);
        }
    }
};

/**
 * @desc    Resets all intervals and restarts the heartbeat if server exceeded
 *          maximum response time.
 */
let restartHeartbeat = () => {
    logger.info('[ RESTARTING MODULE ]');

    parser.removeListener('data', parsePost);
    stopMotors();

    clearTimeout(heartbeatTimeout);
    clearInterval(intervals.heartbeat);

    clearInterval(intervals.navigation);
    intervals.navigation = null;
    
    heartbeat();
};

/**
 *  @desc   Gets Drone position via gps and sends the data to our server, which
 *          returns an available command, wayPoints and the coordinates.
 */
let heartbeat = () => {
    clearInterval(intervals.heartbeat);
    heartbeatTimeout = setTimeout(restartHeartbeat, MAXIMUM_SERVER_RESPONSE_TIME);

    getPosition(port, parser)
        .then(res => {
            logger.info(`GPS-RES: ${res}`);
            setParams(JSON.parse(res));

            post(port, parser, JSON.stringify({ clear: true, ...getKeys(["position", "heading", "speed"], status) }))
                .then(res => {
                    logger.info(`POST-RES: ${res}`);
                    setParams(JSON.parse(res) || {});
                })
                .then(res => {
                    // waiting for first position before starting the navigation
                    if (intervals.navigation === null) {
                        logger.info(`[ STARTING NAVIGATION ]`);
                        intervals.navigation = setInterval(navigation, NAVIGATION_RATE);
                    }

                    clearTimeout(heartbeatTimeout);
                    intervals.heartbeat = setInterval(heartbeat, HEARTBEAT_RATE);
                })
                .catch(err => {
                    logger.error(`POST: ${err}`);
                    restartHeartbeat();
                });
        })
        .catch(err => {
            logger.error(`GPS: ${err}`);
            restartHeartbeat();
        });
};

/**
 * @desc    Helper function to stop the drone motors
 */
let stopMotors = () => {
    BoatControl.setPowerLeft(0);
    BoatControl.setPowerRight(0);
};

/**
 * @desc    Removes all keys in the given object that are not listed in the given array.
 * @param   validKeys: array
 * @param   object: object
 * @returns object
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
    start().then(({ port: _port, parser: _parser }) => {
        port = _port;
        parser = _parser;
        logger.info('[ GSM MODULE STARTED ]');
        logger.info(`[ WAITING ${WAIT_FOR_GPS_ACCURACY / 1000}s FOR BETTER GPS ACCURACY ]`);

        getPosition(port, parser)
            .then(res => {
               setTimeout(() => {
                   logger.info('[ STARTING HEARTBEAT ]');

                   intervals.heartbeat = setInterval(heartbeat, HEARTBEAT_RATE);
               }, WAIT_FOR_GPS_ACCURACY);
            });
    });
})();

// node process event handling
process.on('uncaughtException', (err) => {
    logger.error(`ERROR: ${err}`);
});

process.on('warning', (err) => {
    logger.warn(`ERROR: ${err}`);
});

process.on('SIGINT', (code) => {
    stopMotors();
    logger.info(`[ DRONE PROCESS ENDED ]`);
    process.exit();
});