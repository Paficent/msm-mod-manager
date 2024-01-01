const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const Jimp = require('jimp');
const xml2js = require('xml-js');

function createDirectory(outputPath) {
    try {
        fs.mkdirSync(outputPath);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw new Error(`Error creating directory: ${err.message}`);
        }
    }
}

function unpack(xmlPath, spriteSheetPath) {
    try {
        const xmlData = fs.readFileSync(xmlPath, 'utf-8');
        const result = xml2js.xml2js(xmlData, { compact: true, ignoreDeclaration: true, ignoreInstruction: true });

        const spriteSheet = Jimp.readSync(spriteSheetPath);
        const outputPath = path.join(path.dirname(xmlPath), `${path.basename(xmlPath, path.extname(xmlPath))}_unpacked`);

        createDirectory(outputPath);

        for (const subTexture of result.TextureAtlas.sprite) {
            const name = subTexture._attributes.n;
            const x = parseInt(subTexture._attributes.x);
            const y = parseInt(subTexture._attributes.y);
            const w = parseInt(subTexture._attributes.w);
            const h = parseInt(subTexture._attributes.h);

            const img = spriteSheet.clone().crop(x, y, w, h);
            img.writeSync(path.join(outputPath, `${name}.png`));
        }

        execSync(`start "" "${outputPath}"`);
    } catch (error) {
        throw new Error('Error during unpacking:', error.message);
    }
}

function pack(xmlPath, directoryPath) {
    try {
        const xmlData = fs.readFileSync(xmlPath, 'utf-8');
        const outputPath = path.join(path.dirname(xmlPath), `${path.basename(xmlPath, path.extname(xmlPath))}_packed.png`);
        const result = xml2js.xml2js(xmlData, { compact: true, ignoreDeclaration: true, ignoreInstruction: true });

        const newImage = new Jimp(parseInt(result.TextureAtlas._attributes.width), parseInt(result.TextureAtlas._attributes.height));

        result.TextureAtlas.sprite.forEach((subTexture) => {
            const name = subTexture._attributes.n;
            const x = parseInt(subTexture._attributes.x);
            const y = parseInt(subTexture._attributes.y);

            try {
                const img = Jimp.readSync(path.join(directoryPath, `${name}.png`));
                newImage.blit(img, x, y);
            } catch (readError) {
                throw new Error(`Error reading image ${name}.png: ${readError.message}`);
            }
        });

        newImage.writeSync(outputPath);
        console.log('Images stitched successfully.');
        execSync(`start "" "${outputPath}"`);
    } catch (error) {
        throw new Error('Error during packing:', error.message);
    }
}

module.exports = {
    pack,
    unpack,
};