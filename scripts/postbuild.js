const fs = require('fs');
const path = require('path');

// 1. アセットをルートディレクトリにコピー
const assetsDir = '.open-next/assets';
const targetDir = '.open-next';

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(
                path.join(src, childItemName),
                path.join(dest, childItemName)
            );
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

if (fs.existsSync(assetsDir)) {
    const items = fs.readdirSync(assetsDir);
    items.forEach(item => {
        const srcPath = path.join(assetsDir, item);
        const destPath = path.join(targetDir, item);
        copyRecursiveSync(srcPath, destPath);
    });
    console.log('Assets copied to .open-next/');
}

// 2. worker.js を _worker.js にリネーム
const workerPath = '.open-next/worker.js';
const targetPath = '.open-next/_worker.js';

if (fs.existsSync(workerPath)) {
    fs.renameSync(workerPath, targetPath);
    console.log('Renamed worker.js to _worker.js');
} else {
    console.warn('Warning: worker.js not found');
}
