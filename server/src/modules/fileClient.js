import fs from 'fs';
import config from '#src/server.config.js';

export async function removeRepositoryFolder(folderName) {
    var folderPath = `${config.defaultRepoFolderPath}/${folderName}`
    if(isFolderGitRepository(folderPath)) {
        fs.rmdirSync(folderPath, {recursive: true})
    }
}

export function getAllFiles(folderName, path = '') {
    var folderPath = `${config.defaultRepoFolderPath}/${folderName}`
    if(fs.existsSync(folderPath)){
        var fullPath = `${folderPath}/${path}`
        var isDirectory = fs.lstatSync(fullPath).isDirectory()
        if(!isDirectory){
            var content = fs.readFileSync(fullPath, 'utf8')
            return {
                inDirectory: false,
                content: content
            }
        }

        var files = fs.readdirSync(fullPath)
        var formattedFiles = files.map(file => {
            return {
                name: file,
                isDirectory: fs.lstatSync(`${fullPath}/${file}`).isDirectory()
            }
        })

        return {
            inDirectory: true,
            files: formattedFiles
        }
    } else {
        console.log("Folder is not a git repository")
    }
}

export function getFileContent(folderName, fileName) {
    var folderPath = `${config.defaultRepoFolderPath}/${folderName}`
    if(isFolderGitRepository(folderPath)) {
        var content = fs.readFileSync(`${folderPath}/${fileName}`, 'utf8')
        return content
    } else {
        console.log("Folder is not a git repository")
    }
}

export function prepareWorkerFolder(projectName, uniqueId='') {
    createFolder(config.defaultWorkerFolderPath)

    var folderPath = `${config.defaultWorkerFolderPath}/${projectName}-${uniqueId}`
    createFolder(folderPath)
    createFolder(`${folderPath}/project`)
    createFolder(`${folderPath}/storage`)
    createFolder(`${folderPath}/artifacts`)

    var projectPath = `${config.defaultRepoFolderPath}/${projectName}`
    copyFolderContent(projectPath, `${folderPath}/project`)

    return folderPath
}

export function removeWorkerFolder(projectName) {
    var folderPath = `${config.defaultWorkerFolderPath}/${projectName}`
    removeFolder(folderPath)
}

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