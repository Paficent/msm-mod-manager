const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const { toml, sprite } = require('./js')
const fs = require('fs')
const path = require('path')
const exec = require("child_process").exec


//Fix bug present when app is packed to executable
var original_dir = __dirname
var isPackaged = false
if(__dirname.substring(__dirname.lastIndexOf('\\')) == "\\app.asar"){
    isPackaged = true
    __dirname = __dirname.substring(0, __dirname.lastIndexOf('\\')) // DO NOT REMOVE
    __dirname = __dirname.substring(0, __dirname.lastIndexOf('\\')) // DO NOT REMOVE
}

if(!fs.existsSync("settings.json")){
    fs.writeFileSync("settings.json", JSON.stringify({
        "executable_path": ""
    }))
}

var settings = JSON.parse(fs.readFileSync("settings.json"))
var mainWindow = null;
var debugWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        width: 590,
        height: 290,
        frame: false,
        'min-width': 500,
        'min-height': 200,
        'accept-first-mouse': true,
        'title-bar-style': 'hidden',
        webPreferences: {
            // devTools: false
            nodeIntegration: false,
            enableRemoteModule: false, // turn off remote
            contextIsolation: true, // protect against prototype pollution
            preload: path.join(original_dir, "js", "preload.js") // use a preload script
        },
    });
    mainWindow.setResizable(false);
    mainWindow.loadFile('index.html');
    populateList()

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
    toml.generate('test title', 'test description', 'Paficent', '0', "C:\\Users\\jamie\\OneDrive\\Desktop\\My Singing Monsters Steamless\\ModLoader\\launcher\\mods\\MSMBB")
});

function log(message){
    if (settings.debugMode == true){
        console.log(message)
    }
}

function populateList(){
    let modsPath = path.join(__dirname, '/mods')
    if(!fs.existsSync(modsPath)){
        fs.mkdirSync(modsPath)
    }
    let mods = fs.readdirSync(modsPath)

    mods.forEach(mod => {
        let p = path.join(modsPath, mod)
        let tomlfile = path.join(p, 'info.toml')
        if(fs.existsSync(tomlfile)){
            data = toml.parse(fs.readFileSync(tomlfile).toString())
            if (isPackaged){ // Fix icon bug that occurs when app is packaged
                mainWindow.webContents.executeJavaScript(
                    `document.getElementById("modList").innerHTML += '<li class="list-group-item"><img class="img-circle media-object pull-left" src="../mods/${mod}/icon.png" width="32" height="32"><div class="media-body"><div class="radio pull-right"><label><input type="radio" name="radios" id="mods/${mod}"> &zwnj; </label></div><strong>${data.title} (v${data.version}) - ${data.creator}</strong><p>${data.description}</p></div></li>'`
                )
            } else {
                mainWindow.webContents.executeJavaScript(
                    `document.getElementById("modList").innerHTML += '<li class="list-group-item"><img class="img-circle media-object pull-left" src="./mods/${mod}/icon.png" width="32" height="32"><div class="media-body"><div class="radio pull-right"><label><input type="radio" name="radios" id="mods/${mod}"> &zwnj; </label></div><strong>${data.title} (v${data.version}) - ${data.creator}</strong><p>${data.description}</p></div></li>'`
                )
            }
        }
    });
}

function fixGame(){
    let tmpPath = path.join(__dirname, "/tmp")
    let fixPath = path.join(tmpPath, "fix.toml")
    if(!fs.existsSync(tmpPath)){
        fs.mkdirSync(tmpPath)
    }
    if(!fs.existsSync(fixPath)){
        fs.writeFileSync(fixPath, "")
    }

    let fix = toml.parse(fs.readFileSync(fixPath).toString())
    let assets = fix.assets
    var msm_dir = settings.executable_path.substring(0, settings.executable_path.lastIndexOf('\\'))

    if(assets){
        assets.forEach(items => {
            log(`Fixing ${items[1]}`)
            var newBuffer = fs.readFileSync(path.join(tmpPath, items[0]))
            fs.writeFileSync(path.join(msm_dir, "data" , items[1]), newBuffer)
        });
    }

    // Clean Tmp
    let tmpContents = fs.readdirSync(tmpPath)
    tmpContents.forEach(fileName => {
        let file_path = path.join(tmpPath, fileName)
        if(fs.existsSync(file_path)){
            fs.unlinkSync(file_path)
        }
    });
}

function launchGame(){
    if(settings.executable_path == ""){
        dialog.showMessageBox(mainWindow, {
            "title": "Error",
            "message": "Couldn't find MySingingMonsters.exe.\nInput the MySingingMonsters.exe path in the settings menu.",
            "buttons": ["OK"]
        })
    }else if(!fs.existsSync(settings.executable_path)){
        dialog.showMessageBox(mainWindow, {
            "title": "Error",
            "message": "The path to MySingingMonsters.exe has changed.\nInput the MySingingMonsters.exe path in the settings menu.",
            "buttons": ["OK"]
        })
    } else {
        exec(`cmd /K "${settings.executable_path}"`)
        if(settings.close_after_launch){
            mainWindow.close();
        }
    }
}

function generateToml(name){

}

function packSprite(){
    //unimplemented
}
  

function replaceAssets(name){
    let modPath = path.join(__dirname, name)
    var msm_dir = settings.executable_path.substring(0, settings.executable_path.lastIndexOf('\\'))
    var info = toml.parse(fs.readFileSync(path.join(modPath, "info.toml")).toString())
    var assets = info.assets
    
    var replace = {'assets': []}
    for (const key in assets) {
        var paths = assets[key]
        if(key == "toPack"){
            packSprite()
        } else {
            let toCopy = path.join(modPath, "assets/" + paths[0])
            let toReplace = path.join(msm_dir, "data", paths[1])
            let toReplace_simplified = paths[1].substring(paths[1].lastIndexOf('/'))
            let tmpPath = path.join(__dirname, "/tmp", toReplace_simplified)
            let newBuffer = fs.readFileSync(toCopy);

            log(`Replacing ${toReplace_simplified}`)

            fs.copyFileSync(toReplace, tmpPath)
            fs.writeFileSync(toReplace, newBuffer)

            replace.assets.push([toReplace_simplified, paths[1]])
        }
    }
    fs.writeFileSync(path.join(__dirname, "tmp", "fix.toml"), toml.stringify(replace))
}


ipcMain.on("toMain", (event, args) => {
    settings = JSON.parse(fs.readFileSync("settings.json")) //Update Settings after every event

    if(args[0] == "exitClicked"){
        mainWindow.close();  // Exit the window
    } else if (args[0] == "refreshClicked"){
        // Remove everything but vanilla install
        mainWindow.webContents.executeJavaScript(`document.getElementById("modList").innerHTML = '<li class="list-group-item" id=""><img class="img-circle media-object pull-left" id="___MSM___" src="" width="32" height="32"><div class="media-body"><div class="radio pull-right"><label><input type="radio" name="radios" id="___MSM___" checked> &zwnj; </label></div><strong>My Singing Monsters - The Monster Handlers</strong><p>Revert Changes by Mods and Load a Vanilla MSM</p></div></li>'`)
        populateList()
    } else if(args[0] == "launchClicked"){
        fixGame(); // Always Fix the Game First

        if(args[1] !== "___MSM___"){ // If it's not the vanilla version
            //replaceAssets
            replaceAssets(args[1]);
        }
        
        launchGame(); // Always launch the game afterwards
    }
});