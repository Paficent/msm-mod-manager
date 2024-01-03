const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { toml, logger, sprite} = require('./js');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');


let isPacked = false;
let originalDir = __dirname;

if (__dirname.endsWith(path.sep + 'app.asar')) {
    __dirname = __dirname.substring(0, __dirname.lastIndexOf(path.sep));
    isPacked = true;
    originalDir = __dirname.substring(0, __dirname.lastIndexOf(path.sep));
}


const settingsPath = "settings.json";

function readSettings() {
    try {
        const content = fs.readFileSync(settingsPath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        logger.error("Error reading settings file:", error);
        return null;
    }
}

function writeSettings(settings) {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    } catch (error) {
        logger.error("Error writing settings file:", error);
    }
}

function createSettingsFileIfNotExists() {
    try {
        if (!fs.existsSync(settingsPath)) {
            fs.writeFileSync(settingsPath, JSON.stringify({ "executable_path": "" }, null, 2));
        }
    } catch (error) {
        logger.error("Error checking/creating settings file:", error);
    }
}

var mainWindow = null;


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('ready', function () {
    createSettingsFileIfNotExists();

    mainWindow = new BrowserWindow({
        width: 590,
        height: 290,
        frame: false,
        'min-width': 500,
        'min-height': 200,
        'accept-first-mouse': true,
        'title-bar-style': 'hidden',
        webPreferences: {
            nodeIntegration: false,
            enableRemoteModule: false,
            contextIsolation: true,
            preload: path.join(__dirname, "js", "preload.js")
        },
    });

    mainWindow.setResizable(false);
    mainWindow.loadFile('index.html');

    populateList();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
});


function populateList() {
    try {
        const modsPath = path.join(originalDir, "mods");

        if (!fs.existsSync(modsPath)) {
            fs.mkdirSync(modsPath);
        }

        const mods = fs.readdirSync(modsPath);

        for (const mod of mods) {
            const p = path.join(modsPath, mod);
            const tomlfile = path.join(p, 'info.toml');

            if (fs.existsSync(tomlfile)) {
                const data = toml.parse(fs.readFileSync(tomlfile, 'utf-8'));

                mainWindow.webContents.executeJavaScript(`
                    document.getElementById("modList").innerHTML += '<li class="list-group-item"><img class="img-circle media-object pull-left" src="./mods/${mod}/icon.png" width="32" height="32"><div class="media-body"><div class="radio pull-right"><label><input type="radio" name="radios" id="mods/${mod}"> &zwnj; </label></div><strong>${data.title} (v${data.version}) - ${data.creator}</strong><p>${data.description}</p></div></li>'
                `);
            }
        }
    } catch (error) {
        logger.error("Error populating list:", error);
    }
}



function fixGame(settings) {
    try {
        const tmpPath = path.join(__dirname, "/tmp");
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
                    logger.info(`Fixing ${items[1]}`);
                    const newBuffer = fs.readFileSync(path.join(tmpPath, items[0]));
                    fs.writeFileSync(path.join(msm_dir, "data", items[1]), newBuffer);
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

function launchGame(settings) {
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

function replaceAssets(name, settings) {
    try {
        const modPath = path.join(__dirname, name);
        const msm_dir = settings.executable_path.substring(0, settings.executable_path.lastIndexOf('\\'));
        const infoContent = fs.readFileSync(path.join(modPath, "info.toml"), 'utf-8');
        const info = toml.parse(infoContent);
        const assets = info.assets;

        const replace = { 'assets': [] };

        for (const key in assets) {
            const paths = assets[key];

            if (key === "toPack") {
                packSprite();
            } else {
                const toCopy = path.join(modPath, "assets/" + paths[0]);
                const toReplace = path.join(msm_dir, "data", paths[1]);
                const toReplaceSimplified = paths[1].substring(paths[1].lastIndexOf('/'));
                const tmpPath = path.join(__dirname, "/tmp", toReplaceSimplified);
                const newBuffer = fs.readFileSync(toCopy);

                logger.info(`Replacing ${toReplaceSimplified}`);

                if (fs.existsSync(toReplace)) {
                    fs.copyFileSync(toReplace, tmpPath);
                    fs.writeFileSync(toReplace, newBuffer);

                    replace.assets.push([toReplaceSimplified, paths[1]]);
                } else {
                    logger.error(`Error: Target file ${toReplace} not found`);
                }
            }
        }

        fs.writeFileSync(path.join(__dirname, "tmp", "fix.toml"), toml.stringify(replace));
    } catch (error) {
        logger.error("Error replacing assets:", error);
    }
}


ipcMain.on("toMain", function (event, args) {
    try {
        const currentSettings = readSettings();

        if (args[0] === "exitClicked") {
            mainWindow.close();
        } else if (args[0] === "refreshClicked") {
            mainWindow.webContents.executeJavaScript(`document.getElementById("modList").innerHTML = \`<li class="list-group-item" id=""><img class="img-circle media-object pull-left" id="___MSM___" src="${encodeURI(path.join(__dirname, "assets", "bbb.png").replaceAll(path.sep, "/"))}" width="32" height="32"><div class="media-body"><div class="checkbox pull-right"><label><input type="checkbox" id="___MSM___" checked> &zwnj;</label></div><strong>My Singing Monsters - The Monster Handlers</strong><p>Revert Changes by Mods and Load a Vanilla MSM</p></div></li>\``);
            populateList(mainWindow);
        } else if (args[0] === "launchClicked") {
            fixGame(currentSettings);

            if (args[1] !== "___MSM___") {
                replaceAssets(args[1], currentSettings);
            }

            launchGame(currentSettings);
        }
    } catch (error) {
        logger.error("Error in IPC Main:", error);
    }
});
