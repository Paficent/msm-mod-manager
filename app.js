//TODO delete folders mods make

const { app, BrowserWindow, ipcMain, dialog} = require('electron');
const { toml, logger, manager, sprite} = require('./js');
const path = require('path');
const fs = require('fs');

var isDev = false;


let isPacked = false;
let originalDir = __dirname;
const preloadPath = path.join(__dirname, "js", "preload.js")

if (__dirname.endsWith(path.sep + 'app.asar')) {
    __dirname = __dirname.substring(0, __dirname.lastIndexOf(path.sep));
    isPacked = true;
    originalDir = __dirname.substring(0, __dirname.lastIndexOf(path.sep));
}


const settingsPath = path.join(originalDir, "settings.json");
function createSettingsFileIfNotExists() {
    try {
        if (!fs.existsSync(settingsPath)) {
            fs.writeFileSync(settingsPath, JSON.stringify({"executable_path": "","debug_mode": true,"ignore_conflicts": true,"disable_unsafe_lua_functions": true,"close_after_launch": false}, null, 2));
        }
    } catch (error) {
        logger.error("Error checking/creating settings file:", error);
    }
}
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
        fs.writeFileSync(settingsPath, JSON.stringify(settings));
    } catch (error) {
        logger.error("Error writing settings file:", error);
    }
}


var mainWindow = null;

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
            preload: preloadPath
        },
    });

    if(isDev){
        logger.info("Dev Mode")
        mainWindow.webContents.openDevTools();
    }

    mainWindow.setResizable(false);
    mainWindow.loadFile('index.html');

    populateList();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') { //Macos is weird (in case I decide to port it some day)
        app.quit();
    }
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
                    document.getElementById("modList").innerHTML += \`
                    <li class="list-group-item">
                        <img class="img-circle media-object pull-left" src="${isDev ? "./mods/" + mod + "/icon.png" : path.join(p, "icon.png").replaceAll(path.sep, "/")}" width="32" height="32">
                        <div class="media-body">
                            <div class="radio pull-right">
                                <label>
                                    <input type="checkbox" id="mods/${mod}"> &zwnj;
                                </label>
                            </div>
                            <strong>${data.title} (v${data.version}) - ${data.creator}</strong>
                            <p>${data.description}</p>
                        </div>
                    </li>
                \``);
            }
        }
    } catch (error) {
        logger.error("Error populating list:", error);
    }
}

function handleSettingsChange(currentSettings, setting, value){
    currentSettings[setting] = value;
    writeSettings(currentSettings);
    switch (setting) { // Unimplemented
        case "debug_mode":
            //Unimplemented
    }
}

ipcMain.on("toMain", function (event, args) {
    try {
        const currentSettings = readSettings();

        if (args[0] === "exitClicked") {
            mainWindow.close();
        } else if (args[0] === "refreshClicked") {            
            // Make the list contents nothing, then refresh it (only really used if you add a mod while the launcher is open)
            mainWindow.webContents.executeJavaScript(`document.getElementById("modList").innerHTML = ""`);
            populateList(mainWindow);
        } else if (args[0] === "launchClicked") {
            manager.replaceAssets(JSON.parse(args[1]), currentSettings, __dirname, originalDir);
            manager.launchGame(currentSettings, mainWindow);
        } else if(args[0] === "findMSM") {
            dialog.showOpenDialog(mainWindow, {
                'defaultPath': "C:\\Program Files (x86)\\Steam\\steamapps\\common\\My Singing Monsters",
                'filters': [
                    {'name': 'Executables', 'extensions': ['exe']}
                ]
            }).then((out) =>{
                if(!out.canceled && out.filePaths[0] && fs.existsSync(out.filePaths[0])){
                    currentSettings.executable_path = out.filePaths[0];
                    writeSettings(currentSettings);
                    mainWindow.webContents.executeJavaScript(`document.getElementById("pathLabel").value = "${out.filePaths[0].replaceAll(path.sep, "/")}"`)
                }
            })
        } else if(args[0] === "settings_checkbox"){
            handleSettingsChange(currentSettings, args[1], args[2])
        }
    } catch (error) {
        logger.error("Error in IPC Main:", error);
    }
});