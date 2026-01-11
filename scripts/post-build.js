const fs = require('fs');
const path = require('path');

/**
 * Cloudflare Pages用のビルド後処理スクリプト
 * assetsフォルダの内容を.open-nextルートにコピーし、worker.jsを_worker.jsにリネーム
 */

const openNextDir = path.join(process.cwd(), '.open-next');
const assetsDir = path.join(openNextDir, 'assets');

// assetsフォルダの内容を再帰的にコピー
function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) {
        console.warn(`Warning: ${src} does not exist`);
        return;
    }

    const stats = fs.statSync(src);

    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const files = fs.readdirSync(src);
        files.forEach(file => {
            copyRecursive(
                path.join(src, file),
                path.join(dest, file)
            );
        });
    } else {
        fs.copyFileSync(src, dest);
        console.log(`Copied: ${src} -> ${dest}`);
    }
}

console.log('Starting post-build process...');

// Step 1: assetsフォルダの内容を.open-nextにコピー
if (fs.existsSync(assetsDir)) {
    console.log('Copying assets...');
    const items = fs.readdirSync(assetsDir);
    items.forEach(item => {
        copyRecursive(
            path.join(assetsDir, item),
            path.join(openNextDir, item)
        );
    });
    console.log('Assets copied successfully!');
} else {
    console.warn('Assets directory not found');
}

// Step 2: worker.jsを_worker.jsにリネーム
const workerPath = path.join(openNextDir, 'worker.js');
const workerNewPath = path.join(openNextDir, '_worker.js');

if (fs.existsSync(workerPath)) {
    fs.renameSync(workerPath, workerNewPath);
    console.log('Renamed worker.js to _worker.js');
} else {
    console.warn('worker.js not found');
}

console.log('Post-build process completed!');
