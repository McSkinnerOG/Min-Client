const current_v = require('../../package.json').version;
const os = require('os');
const fs = require('fs');
const path = require('path');
const url = require('url');
module.exports.DEBUG = process.argv.includes('--dev') || false;
module.exports.isAMDCPU = (os.cpus()[0].model.indexOf("AMD") > -1);
module.exports.joinPath = path.join;
module.exports.gameLoaded = (urlid) => {
    try {
        if (urlid.includes("https://kirka.io/games/")) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err);
        return false;
    }
}

module.exports.version = current_v;