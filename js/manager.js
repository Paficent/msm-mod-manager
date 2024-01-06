const path = require('path');
const fs = require('fs');
const toml = require('./toml');
const logger = require('./logger').logger;
const {dialog} = require('electron');
const { exec } = require('child_process');

function createSubdirectoriesIfNotExist(dirPath) {
    const subdirectories = path.parse(dirPath).dir.split(path.sep);

    subdirectories.shift();

    subdirectories.reduce((currentPath, subdirectory) => {
        currentPath = path.join(currentPath, subdirectory);

        if (!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath);
        }

        return currentPath;
    }, path.isAbsolute(dirPath) ? path.sep : '');
}

function fixGame(settings, dirname) {
    try {
        const tmpPath = path.join(dirname, "/tmp");
        const fixPath = path.join(tmpPath, "fix.toml");

        if (!fs.existsSync(tmpPath)) {
            fs.mkdirSync(tmpPath);
        }

        if (!fs.existsSync(fixPath)) {
            fs.writeFileSync(fixPath, "");
        }

        const fix = toml.parse(fs.readFileSync(fixPath).toString());
        const assets = fix.assets;
        const msm_dir = settings.executable_path.substring(0, settings.executable_path.lastIndexOf('\\'));

        if (assets) {
            assets.forEach(items => {
                try {
                    const filePath = path.join(tmpPath, items[0])
                    const msmFilePath = path.join(msm_dir, "data", items[1])
                    logger.info(`Fixing ${items[1]}`);

                    if(fs.existsSync(filePath)){
                        const newBuffer = fs.readFileSync(filePath);
                        fs.writeFileSync(msmFilePath, newBuffer);
                    } else {
                        fs.unlinkSync(msmFilePath)
                        //TODO delete directories mods make
                    }
                } catch (writeError) {
                    logger.error(`Error writing file ${items[1]}: ${writeError.message}`);
                }
            });
        }

        // Clean Tmp
        const tmpContents = fs.readdirSync(tmpPath);
        tmpContents.forEach(fileName => {
            const filePath = path.join(tmpPath, fileName);
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (deleteError) {
                logger.error(`Error deleting file ${fileName}: ${deleteError.message}`);
            }
        });
    } catch (error) {
        logger.error(`Error in fixGame: ${error.message}`);
    }
}

function replaceAssets(names, settings, dirname, originalDir) {
    try {
        fixGame(settings, dirname)
        const msm_dir = settings.executable_path.substring(0, settings.executable_path.lastIndexOf('\\'));
        const fixPath = path.join(dirname, "tmp", "fix.toml");
        names.forEach((name) => {
            const modPath = path.join(originalDir, name);
            const info = toml.parse(fs.readFileSync(path.join(modPath, "info.toml"), 'utf-8'));
            const assets = info.assets;
    
            var fix = {'assets': []};
            if (fs.existsSync(fixPath)){
                fix = toml.parse(fs.readFileSync(fixPath));
            }
    
            const replace = [];
            for (const key in assets) {
                const paths = assets[key];

                var isConflict = false
                fix.assets.forEach((asset) => {
                    if(asset.includes(paths[1])){
                        isConflict = true;
                    }
                })

                if(isConflict){
                    logger.info(`Skipped conflict: ${paths[1]}`);
                } else {
                    const toCopy = path.join(modPath, "assets/" + paths[0]);
                    const toReplace = path.join(msm_dir, "data", paths[1]);
                    const toReplaceSimplified = paths[1].substring(paths[1].lastIndexOf('/'));
                    const tmpPath = path.join(dirname, "/tmp", toReplaceSimplified);
                    const newBuffer = fs.readFileSync(toCopy);
    
                    logger.info(`Replacing ${toReplaceSimplified}`);
    
                    if (fs.existsSync(toReplace)) {
                        fs.copyFileSync(toReplace, tmpPath);
                        fs.writeFileSync(toReplace, newBuffer);
    
                        replace.push([toReplaceSimplified, paths[1]]);
                    } else {
                        logger.info(`Creating ${toReplaceSimplified}`);
                        createSubdirectoriesIfNotExist(toReplace)
                        fs.writeFileSync(toReplace, newBuffer);
    
                        replace.push([toReplaceSimplified, paths[1]]);
                    }
                }
            }

            fix.assets = fix.assets.concat(replace);
            fs.writeFileSync(fixPath, toml.stringify(fix));
        })
    } catch (error) {
        logger.error("Error replacing assets:", error);
    }
}

function launchGame(settings, mainWindow) {
    try {
        if (settings.executable_path === "") {
            dialog.showMessageBox(mainWindow, {
                "title": "Error",
                "message": "Couldn't find MySingingMonsters.exe.\nInput the MySingingMonsters.exe path in the settings menu.",
                "buttons": ["OK"]
            });
        } else if (!fs.existsSync(settings.executable_path)) {
            dialog.showMessageBox(mainWindow, {
                "title": "Error",
                "message": "The path to MySingingMonsters.exe has changed.\nInput the MySingingMonsters.exe path in the settings menu.",
                "buttons": ["OK"]
            });
        } else {
            exec(`cmd /K "${settings.executable_path}"`);

            if (settings.close_after_launch) {
                mainWindow.close();
            }
        }
    } catch (error) {
        logger.error("Error launching the game:", error);
    }
}

module.exports = {
    fixGame, replaceAssets, launchGame
}