import fs from 'fs';

export function defaultFolder(path){
    if(!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}

export function isFolderGitRepository(path) {
    const folderPath = `${path}/.git`;
    return fs.existsSync(folderPath);
}