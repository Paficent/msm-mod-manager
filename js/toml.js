const fs = require('fs');
const path = require('path');
const toml = require('@iarna/toml');

function readDirectory(directoryPath, baseDirectory = '') {
    try {
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
        console.error(`Error reading directory: ${directoryPath}`, error);
        throw error;
    }
}

function generate(title, description, creator, version, modPath) {
    try {
        const msmDir = path.dirname(settings.executable_path);
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

            if (fileExistsSync(path.join(msmDir, 'data', normalizedFileName))) {
                ast.assets[counter] = [normalizedFileName, normalizedFileName];
                counter++;
            }
        }

        // Uncomment the line below if you want to write the generated data to a TOML file
        // fs.writeFileSync(path.join(modPath, 'info.toml'), toml.stringify(ast));
    } catch (error) {
        console.error('Error generating data:', error);
        throw error;
    }
}

function fileExistsSync(filePath) {
    try {
        fs.accessSync(filePath);
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    parse: toml.parse,
    stringify: toml.stringify,
    generate: generate
};