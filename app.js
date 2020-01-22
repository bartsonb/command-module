let axios = require('axios');

// let boat = require('boat');
// let at = require('at');
// let gps = require('gps');

let status = {
    fence: [],
    position: [], 
    commands: []
};

let heartbeat = () => {
    axios.get('url')
        .then(res => res.json())
        .then(res => setParameters)
        .catch(err => console.log);
};

let setParameters = (obj) => {
    status = obj;

    
};

setTimeout(heartbeat, 500);