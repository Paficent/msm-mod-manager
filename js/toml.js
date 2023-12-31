const fs = require('fs')
const path = require('path')
const toml = require('@iarna/toml')

var settings = JSON.parse(fs.readFileSync("settings.json"))

function readDirectory(directoryPath, baseDirectory = '') {

    const files = fs.readdirSync(directoryPath);
    var out = [];
  
    files.forEach((file) => {
        const filePath = path.join(directoryPath, file);
        const stats = fs.statSync(filePath);
    
        if (stats.isDirectory()) {
            recursiveFiles = readDirectory(filePath, path.join(baseDirectory, file));
            recursiveFiles.forEach((x) => {
                out.push(x)
            })
        } else {
            out.push(path.join(baseDirectory, file))
        }
    });

    return out
}

function generate(title, description, creator, version, modPath){
    const msm_dir = settings.executable_path.substring(0, settings.executable_path.lastIndexOf('\\'))
    const files = readDirectory(path.join(modPath, 'assets'))

    var ast = {'title': title, 'description': description, 'creator': creator, 'version': version, 'assets': {}}
    var assets = ast.assets
    var counter = 1
    files.forEach((fileName) => {
        fileName = fileName.split("\\").join("/")
        if(fs.existsSync(path.join(msm_dir, "data", fileName))) {
            assets[counter] =  [fileName, fileName];
            counter++;
        } else {

        }
    })
    // fs.writeFileSync(path.join(modPath, "info.toml"), toml.stringify(ast))
    
}
module.exports = {
    'parse': toml.parse,
    'stringify': toml.stringify,
    'generate': generate
}