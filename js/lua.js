const { execSync } = require('child_process');
const logger = require('./logger').logger;
const axios = require('axios');
const path = require('path');
const os = require('os');
const fs = require('fs');

function getPaths() {
    var AppData = "";
    if (os.platform() === "win32") {
        AppData = path.join(process.env.AppData, "MSM_ModManager");
    } else {
        AppData = path.join(os.homedir(), "MSM_ModManager");
    }
    const resources = path.join(AppData, "resources");
    const unluac = path.join(resources, "unluac.jar");

    return [AppData, resources, unluac];
}

function downloadFromGithub(fileLink, filePath, callback) {
    axios.get(fileLink, { responseType: 'arraybuffer' })
        .then(function(response) {
            const buffer = Buffer.from(response.data, 'binary');
            fs.writeFileSync(filePath, buffer);
            logger.info(`Downloaded and saved the ${fileLink} to: ${filePath}`);
            callback(null);
        })
        .catch(function(error) {
            logger.error(`Error downloading or saving the JAR file: ${error.message}`);
            callback(error);
        });
}

function checkForDecompiler(callback) {
    try {
        var paths = getPaths();

        if (!fs.existsSync(path.join(paths[1]))) {
            fs.mkdirSync(paths[1]);
        }
        if (!fs.existsSync(paths[2])) {
            downloadFromGithub("https://raw.githubusercontent.com/Paf1cent/msm-mod-loader/main/resources/unluac.jar", paths[2], callback);
        } else {
            callback(null);
        }
    } catch (error) {
        logger.error(error);
        callback(error);
    }
}

function decompile(luaPath) {
    checkForDecompiler(function(error) {
        if (error) {
            logger.error(`Error checking for decompiler: ${error.message}`);
            return;
        }

        try {
            const paths = getPaths();
            const output = path.join(path.dirname(luaPath), path.basename(luaPath, path.extname(luaPath)) + "_decompiled.lua");
            
            execSync(`cd "${paths[1]}" & java -jar unluac.jar "${luaPath}" > "${output}"`);
            logger.info(`Successfully decompiled ${luaPath}`);
            execSync(`start "" "${output}"`);
        } catch (err){
            logger.error(`Error decompiling Lua file: ${err.message}`)
        }
    });
}

module.exports = { decompile };