import fs from 'fs';
import config from '#src/server.config.js';

export async function saveFileFromRequest(req, fileName) {
    createFolder(config.defaultArtifactFolderPath)

    const filePath = `${config.defaultArtifactFolderPath}/${fileName}`;

    return new Promise((resolve, reject) => {
        // Save the ZIP file to the specified path
        fs.writeFile(filePath, req.body, (err) => {
            if (err) {
                reject(err)
                return
            }
            
            resolve();
        });

    });
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