const fs = require('fs');
const path = require('path');

// 1. 古いビルドファイルを削除
const dirsToRemove = ['.next', '.open-next'];
dirsToRemove.forEach(dir => {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`Removed ${dir}`);
    }
});
