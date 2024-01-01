const fs = require('fs');
const path = require('path');
// const { createCanvas, loadImage } = require('canvas');
// const xml2js = require('xml2js');


function unpack(xmlPath, spriteSheetPath) {
    const parser = new xml2js.Parser();
    fs.readFile(xmlPath, (err, data) => {
        parser.parseString(data, (err, result) => {
            const spriteSheet = loadImage(spriteSheetPath);
            const outputPath = path.join(path.dirname(xmlPath), (path.basename(xmlPath, path.extname(xmlPath)) + '_unpacked'));

            if (!fs.existsSync(outputPath)) {
                console.log('hm?')
                fs.mkdirSync(outputPath);
            }

            result.TextureAtlas.sprite.forEach((subTexture) => {
                const name = subTexture.$.n;
                const x = parseInt(subTexture.$.x);
                const y = parseInt(subTexture.$.y);
                const w = parseInt(subTexture.$.w);
                const h = parseInt(subTexture.$.h);

                spriteSheet.then((image) => {
                    const canvas = createCanvas(w, h);
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(image, x, y, w, h, 0, 0, w, h);

                    const buffer = canvas.toBuffer('image/png');
                    fs.writeFileSync(path.join(outputPath, `${name}.png`), buffer);
                });
            });
            require('child_process').exec(`start "" "${outputPath}"`);
        });
    });
}

function pack() {

}

module.exports = {
    'pack': pack,
    'unpack': unpack
}