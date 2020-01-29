let axios = require('axios');

// let boat = require('boat');
// let at = require('at');
// let gps = require('gps');

let status = {
    fence: [],
    position: [], 
    commands: []
};

let setParams = object => {
    for (let key in object) {
        if (key in status && Array.isArray(object[key])) status[key] = object[key];
    }

    if (status.commands.length > 0) updateBoatAction(status.commands);
};

let updateBoatStatus = (fence, position) => {

};

let updateBoatAction = (command) => {
    switch(command) {
        case 'SEARCH':
            break;

        case 'RETURN':
            break;

        case 'STOP':
            break;
    }
};

let heartbeat = async () => {
    await axios.get('url')
        .then(res => res.json())
        .then(res => setParams)
        .catch(err => console.log);
};

setTimeout(heartbeat, 5000);

// Init
(function() {

})();