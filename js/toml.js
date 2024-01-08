const fs = require('fs');
const path = require('path');
const toml = require('@iarna/toml');
const logger = require('./logger').logger;

function readDirectory(directoryPath, baseDirectory = '') {
    try {
        console.log(directoryPath)
        const files = fs.readdirSync(directoryPath);
        const out = [];

        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                const recursiveFiles = readDirectory(filePath, path.join(baseDirectory, file));
                out.push(...recursiveFiles);
            } else {
                out.push(path.join(baseDirectory, file));
            }
        }

        return out;
    } catch (error) {
        logger.error(`Error reading directory: ${directoryPath} - ${error.message}`)
    }
}

function generate(title, description, creator, version, modPath) {
    try {
        const assetsPath = path.join(modPath, 'assets');
        const files = readDirectory(assetsPath);

        const ast = {
            title,
            description,
            creator,
            version,
            assets: {}
        };

        let counter = 1;

        for (const fileName of files) {
            const normalizedFileName = fileName.split(path.sep).join('/');
            ast.assets[counter] = [normalizedFileName, normalizedFileName];
            counter++;
        }

        fs.writeFileSync(path.join(modPath, 'info.toml'), toml.stringify(ast));
    } catch (error) {
        logger.error(`Error generating TOML ${error.message}`)
    }
}

module.exports = {
    parse: toml.parse,
    stringify: toml.stringify,
    generate: generate
};