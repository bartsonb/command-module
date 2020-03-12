const SimpleNodeLogger = require('simple-node-logger');
const fs = require('fs');

const dir = './logs/';
const date = new Date().toISOString();

if (!fs.existsSync(dir)) fs.mkdirSync(dir);

exports.logger = SimpleNodeLogger.createSimpleLogger({
    logFilePath: dir + date + '.log',
    timestampFormat: 'YYYY-MM-DD HH:mm:ss'
});