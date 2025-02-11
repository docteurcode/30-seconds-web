import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import glob from 'glob';
import { Logger } from 'blocks/utilities/logger';

const supportedExtensions = ['jpeg', 'jpg', 'png', 'webp', 'tif', 'tiff'];
const maxWidth = 800;
const outputQuality = 80;

/**
 * Serializes assets.
 */
export class AssetSerializer {
  /**
   * Processes the given image asset, converting it to the correct size and quality.
   * @param {string} asset - The filename of the given asset.
   * @param {string} imageDirName - The output directory.
   * @returns {Promise} A promise that resolves when the file has finished writing to disk.
   */
  static processImageAsset = (asset, outDir) =>
    new Promise((resolve, reject) => {
      const fileName = asset.slice(asset.lastIndexOf('/'));
      const img = sharp(asset);
      return img.metadata().then(metadata => {
        const resizeWidth = Math.min(maxWidth, metadata.width);
        const name = fileName.slice(0, fileName.lastIndexOf('.'));
        const format = metadata.format;
        const resized = img.resize({ width: resizeWidth });
        return Promise.all([
          resized
            .toFormat(format, { quality: outputQuality })
            .toFile(`${outDir}/${fileName}`),
          resized
            .webp({ quality: outputQuality })
            .toFile(`${outDir}/${name}.webp`),
        ])
          .then(() => resolve())
          .catch(() => reject());
      });
    });

  /**
   * Prepares the assets directory.
   */
  static serialize = async () => {
    const boundLog = Logger.bind('serializers.asset.serialize');
    const {
      rawAssetPath: inPath,
      rawContentAssetPath: inContentPath,
      assetPath: outPath,
      rawContentPath: contentPath,
      staticAssetPath: staticAssetPath,
    } = global.settings.paths;
    const configs = global.settings.configs;
    boundLog('Processing assets from config...', 'info');

    boundLog(
      `Copying static assets from ${path.resolve(inPath)} to ${path.resolve(
        outPath
      )}`,
      'info'
    );
    fs.ensureDirSync(outPath);
    await fs.copy(inPath, outPath);
    await fs.copy(inContentPath, outPath);
    boundLog('Static assets have been copied', 'success');

    boundLog(`Processing image assets from configuration files`, 'info');
    for (const cfg of configs) {
      const { images, dirName } = cfg;
      if (images && images.name && images.path) {
        fs.ensureDirSync(path.join(outPath, images.name));
        const assets = glob
          .sync(
            `${contentPath}/sources/${dirName}/${
              images.path
            }/*.@(${supportedExtensions.join('|')})`
          )
          .map(file => path.resolve(file));
        await Promise.all(
          assets.map(asset =>
            this.processImageAsset(asset, `${outPath}/${images.name}`)
          )
        );
      }
    }
    boundLog(
      `Processing image assets from configuration files complete`,
      'success'
    );

    boundLog(
      `Copying assets from ${path.resolve(outPath)} to ${path.resolve(
        'static',
        staticAssetPath
      )}`,
      'info'
    );
    if (global.settings.env === 'PRODUCTION') {
      fs.ensureDirSync(path.join('static', staticAssetPath));
      fs.copySync(outPath, path.join('static', staticAssetPath));
    }
    boundLog(`Copying assets complete`, 'success');

    return;
  };
}
