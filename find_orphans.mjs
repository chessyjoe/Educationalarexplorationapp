import fs from 'fs';
import path from 'path';

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

const srcDir = './src';
const allFiles = getAllFiles(srcDir);
const fileContents = allFiles.map(f => fs.readFileSync(f, 'utf8'));

const testFilesRegex = /__tests__|test\.tsx?$/;

allFiles.forEach(file => {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;
    if (testFilesRegex.test(file)) return; // Skip test files

    const basename = path.basename(file, path.extname(file));
    if (basename === 'main' || basename === 'App' || basename === 'vite-env.d') return;

    // Check if basename is mentioned in any other file
    let isReferenced = false;
    for (let i = 0; i < allFiles.length; i++) {
        if (allFiles[i] === file) continue;
        if (fileContents[i].includes(basename)) {
            isReferenced = true;
            break;
        }
    }

    if (!isReferenced) {
        console.log("Potentially orphaned:", file);
    }
});
