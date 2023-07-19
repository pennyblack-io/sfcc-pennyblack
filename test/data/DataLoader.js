const fs = require('fs');
const path = require('path');

function DataLoader(section, id) {
    let file = path.join(__dirname, section, id + ".json");
    return JSON.parse(fs.readFileSync(file));
}

module.exports = DataLoader;
