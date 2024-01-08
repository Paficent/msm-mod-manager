//TODO delete folders mods make

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { autoUpdater } = require("electron-updater")
const { toml, logger, manager, lua, sprite } = require('./js');
const path = require('path');
const os = require('os');
const fs = require('fs');

var isDebug = false;

const preloadPath = path.join(__dirname, "js", "preload.js")
let originalDir = __dirname;
if (__dirname.endsWith(path.sep + 'app.asar')) {
    __dirname = __dirname.substring(0, __dirname.lastIndexOf(path.sep));
    isPacked = true;
    originalDir = __dirname.substring(0, __dirname.lastIndexOf(path.sep));
}

function resetSettings() {
    writeSettings({ "msm_directory": "", "debug_mode": false, "ignore_conflicts": true, "disable_unsafe_lua_functions": true, "close_after_launch": false });
}

var AppData = ""
if(os.platform() === "win32"){
    AppData = path.join(process.env.AppData, "MSM_ModManager")
} else {
    AppData = path.join(os.homedir(), "MSM_ModManager")
}
const settingsPath = path.join(AppData, "settings.json");
function createSettingsFileIfNotExists() {
    try {
        if(!fs.existsSync(AppData)) {
            fs.mkdirSync(AppData);
        }
        if (!fs.existsSync(settingsPath)) {
            resetSettings(settingsPath)
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
var devtools = null;

app.on('ready', function () {
    createSettingsFileIfNotExists();
    const currentSettings = readSettings();

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

    if (isDebug && devtools == null) {
        devtools = new BrowserWindow();
        mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
        mainWindow.webContents.openDevTools({ 'activate': true, 'mode': 'detach' });
    }


    mainWindow.setResizable(false);
    mainWindow.loadFile('index.html');

    populateMods(currentSettings);
    populateSettings(currentSettings);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    autoUpdater.checkForUpdates()
    setInterval(() => {
        autoUpdater.checkForUpdates()
    }, 1000 * 60 * 10) // Check for an update every ten minutes
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') { //Macos is weird (in case I decide to port it some day)
        app.quit();
    }
});

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    }

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })
})

function populateMods(settings) {
    try {
        if (settings.msm_directory == "") {
            mainWindow.webContents.executeJavaScript(`
                document.getElementById("modList").innerHTML = '<li class="list-group-item" id="noMods" style="text-align: center;">' +
                    '<h3>MSM directory not set</h3>' +
                    '<img src="https://images-ext-1.discordapp.net/external/d-EBv1nqbYspfTqKrMk796UXZ_5crvfHQ1Sa1040dE0/%3Fsize%3D128%26quality%3Dlossless/https/cdn.discordapp.com/emojis/1154955561943707720.webp?format=webp"/>' +
                '</li>';
            `)
            return logger.info("MySingingMonsters directory not found...")
        }

        const modsPath = path.join(settings.msm_directory, "mods");
        if (!fs.existsSync(modsPath)) {
            fs.mkdirSync(modsPath);
        }


        const mods = fs.readdirSync(modsPath);
        const modsCount = Object.keys(mods).length;
        if (modsCount == 0) {
            logger.info()
            mainWindow.webContents.executeJavaScript(`
                document.getElementById("modList").innerHTML = '<li class="list-group-item" id="noMods" style="text-align: center;">' +
                    '<h3>No mods found</h3>' +
                    '<img src="https://images-ext-1.discordapp.net/external/d-EBv1nqbYspfTqKrMk796UXZ_5crvfHQ1Sa1040dE0/%3Fsize%3D128%26quality%3Dlossless/https/cdn.discordapp.com/emojis/1154955561943707720.webp?format=webp"/>' +
                '</li>';
            `).catch(error => {
                logger.error('Error executing JavaScript:', error.message);
            });
        } else { // Clear the list
            mainWindow.webContents.executeJavaScript(`
                document.getElementById("modList").innerHTML = "";
            `);
        }

        for (const mod of mods) {
            const p = path.join(modsPath, mod);
            const tomlfile = path.join(p, 'info.toml');

            if (fs.existsSync(tomlfile)) {
                const data = toml.parse(fs.readFileSync(tomlfile, 'utf-8'));

                mainWindow.webContents.executeJavaScript(`
                    document.getElementById("modList").innerHTML += \`
                    <li class="list-group-item">
                        <img class="img-circle media-object pull-left" src="${path.join(p, "icon.png").replaceAll(path.sep, "/")}" width="32" height="32">
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

function populateSettings(settings) {
    const settings_JSON = JSON.stringify(settings).toString();
    mainWindow.webContents.executeJavaScript(`
        var settings = ${settings_JSON};
        for(const key in settings){
            var value = settings[key];

            if(key === "msm_directory"){
                document.getElementById("pathLabel").value = value;
            } else {
                document.getElementById("settings." + key).checked = value
            }
        }
    `)
}

function handleSettingsChange(currentSettings, setting, value) {
    switch (setting) { // Unimplemented
        case "debug_mode":
            isDebug = value;
            if (isDebug && devtools == null) {
                devtools = new BrowserWindow();
                mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
                mainWindow.webContents.openDevTools({ 'activate': true, 'mode': 'detach' });
            } else if (!isDebug && devtools != null) {
                devtools.close();
                devtools = null;
            }

        default:
            currentSettings[setting] = value;
            writeSettings(currentSettings);
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

            populateMods(currentSettings);
        } else if (args[0] === "launchClicked") {
            manager.replaceAssets(JSON.parse(args[1]), currentSettings, __dirname);
            manager.launchGame(currentSettings, mainWindow);
        } else if (args[0] === "findMSM") {
            dialog.showOpenDialog(mainWindow, {
                'defaultPath': "C:\\Program Files (x86)\\Steam\\steamapps\\common\\My Singing Monsters",
                'title': "Open My Singing Monsters Directory",
                'properties': [
                    'openDirectory'
                ]
            }).then((out) => {
                if (!out.canceled && out.filePaths[0] && fs.existsSync(out.filePaths[0])) {
                    currentSettings.msm_directory = out.filePaths[0];
                    writeSettings(currentSettings);
                    mainWindow.webContents.executeJavaScript(`document.getElementById("pathLabel").value = "${out.filePaths[0].replaceAll(path.sep, "/")}"`)
                }
            })
        } else if (args[0] === "settings_checkbox") {
            handleSettingsChange(currentSettings, args[1], args[2])
        } else if (args[0] === "resetSettingsButton") {
            resetSettings();
            populateSettings(readSettings());
        } else if (args[0] === "findTomlFolder"){
            dialog.showOpenDialog(mainWindow, {
                'title': "Open Mod Directory",
                'properties': [
                    'openDirectory'
                ]
            }).then((out) =>{
                if(!out.canceled && out.filePaths[0] && fs.existsSync(out.filePaths[0])){
                    mainWindow.webContents.executeJavaScript(`document.getElementById("tomlModPathInput").value = "${out.filePaths[0].replaceAll(path.sep, "/")}"`)
                }
            })
        } else if(args[0] === "generateToml"){
            toml.generate(args[1], args[2], args[3], args[4], args[5])
        } else if(args[0] === "decompileLua") {
            lua.decompile(args[1])
        } else if (args[0] === "findLuaFile"){
            dialog.showOpenDialog(mainWindow, {
                'title': "Open Lua File",
                'properties': [
                    'openFile'
                ]
            }).then((out) =>{
                if(!out.canceled && out.filePaths[0] && fs.existsSync(out.filePaths[0])){
                    mainWindow.webContents.executeJavaScript(`document.getElementById("luaFileInput").value = "${out.filePaths[0].replaceAll(path.sep, "/")}"`)
                }
            })
        }
    } catch (error) {
        logger.error("Error in IPC Main:", error);
    }
});