import fs from 'fs';
import { defaultFolder, isFolderGitRepository } from '../helpers/gitHelper.mjs';
import git from '@npmcli/git';

const defaultFolderPath = './.rebpg';

export async function cloneRepository(url, branch, folderName) {
    defaultFolder(defaultFolderPath)

    console.log(url, folderName)
    var folderPath = `${defaultFolderPath}/${folderName}`
    if(isFolderGitRepository(folderPath)) {
        console.log("Folder already is a git repository")
    } else {
        await git.clone(url, branch, folderPath)
    }
}

export async function pullRepository(folderName) {
    var folderPath = `${defaultFolderPath}/${folderName}`
    if(isFolderGitRepository(folderPath)) {
        await git.pull(folderPath)
    } else {
        console.log("Folder is not a git repository")
    }
}

export function getAllFiles(folderName, path = '') {
    var folderPath = `${defaultFolderPath}/${folderName}`
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
    var folderPath = `${defaultFolderPath}/${folderName}`
    if(isFolderGitRepository(folderPath)) {
        var content = fs.readFileSync(`${folderPath}/${fileName}`, 'utf8')
        return content
    } else {
        console.log("Folder is not a git repository")
    }
}