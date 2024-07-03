import fs from 'fs';

export function createFolder(path){
    if(!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}

export function removeFolder(path){
    if(fs.existsSync(path)){
        fs.rmSync(path, {recursive: true});
    }
}

export function copyFolderContent(src, dest){
    if(fs.existsSync(src) && fs.existsSync(dest)){ 
        fs.cpSync(src, dest, {recursive: true});
    }
}

export function isFolderGitRepository(path) {
    const folderPath = `${path}/.git`;
    return fs.existsSync(folderPath);
}