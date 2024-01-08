const path = require('path');
const logger = require('./logger').logger
const { execSync } = require('child_process');

function decompile(luaPath){
    var output = path.join(path.dirname(luaPath), path.basename(luaPath, path.extname(luaPath)) + "_decompiled.lua")
    try {
        console.log(`java -jar resources/unluac.jar "${luaPath}" > "${output}"`)
        execSync(`java -jar resources/unluac.jar "${luaPath}" > "${output}"`);
        logger.info(`Succesfully decompiled ${luaPath}`)
        execSync(`start "" "${output}"`)
      } catch (error) {
        logger.error('Error decompiling the Lua file:', error.message);
    }
}

module.exports = {decompile}