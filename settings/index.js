var settingsKey = process.argv.length>2 ? process.argv[2] : 'local',
    safeSettings = {};
try {
    safeSettings = require('./server/protected.js');
} catch(err) {}
module.exports = require('./server/' + settingsKey + '.js');
Object.assign(module.exports, safeSettings, {name: settingsKey});
