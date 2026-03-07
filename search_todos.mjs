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
const testFilesRegex = /__tests__|test\.tsx?$/;
const searchRegex = /todo|fixme|mock|dummy|placeholder|not implemented|hardcoded/i;

allFiles.forEach(file => {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx') && !file.endsWith('.css')) return;
    if (testFilesRegex.test(file)) return;

    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        if (searchRegex.test(line)) {
            console.log(`${file}:${index + 1}: ${line.trim()}`);
        }
    });
});
