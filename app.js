// let boat = require('boat');
// let at = require('at');
// let gps = require('gps');

const HEARTBEAT_RATE = 5000;
const COMMAND_EXECUTION_RATE = 1000;

let status = {
    fence: [],
    position: [], 
    commands: []
}

let setParams = ({ fence, position, commands }) => {
    if (valid(fence)) // Boat.fence = fence;

    if (valid(position)) // Boat.position = position; 

    if (valid(commands)) {
        status.commands = commands;
        executeCommand();
    }
};

let executeCommand = () => {
    if (status.commands.includes('STOP')) status.commands = ['STOP'];

    switch(status.commands.unshift()) {
        case 'SEARCH':
            // Boat.search()
            break;

        case 'RETURN':
            // Boat.return()
            break;

        case 'STOP':
            // Boat.stop()
            break;
    }
};

let valid = (arr) => Array.isArray(arr) && arr.length > 0;

let heartbeat = async () => {} // gsm.callApi();

setInterval(heartbeat, HEARTBEAT_RATE);

setInterval(executeCommand, COMMAND_EXECUTION_RATE);