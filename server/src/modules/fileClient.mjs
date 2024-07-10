import fs from 'fs';
import config from '../server.config.mjs';
import { createFolder, copyFolderContent, isFolderGitRepository, removeFolder } from '../helpers/gitHelper.mjs';
import git from '@npmcli/git';

export async function cloneRepository(url, branch, folderName) {
    createFolder(config.defaultRepoFolderPath)

    console.log(url, folderName)
    var folderPath = `${config.defaultRepoFolderPath}/${folderName}`
    if(isFolderGitRepository(folderPath)) {
        console.log("Folder already is a git repository")
    } else {
        await git.clone(url, branch, folderPath)
    }
}

export async function pullRepository(folderName) {
    var isSuccessful = false
    var folderPath = `${config.defaultRepoFolderPath}/${folderName}`
    console.log(folderPath)
    if(isFolderGitRepository(folderPath)) {
        await git.spawn(['pull'], {cwd: folderPath})
            .then(response => {
                isSuccessful = response.stdout != 'Already up to date.'
            })
            .catch(error => {
                console.log(error)
            })
    } else {
        console.log("Folder is not a git repository")
    }

    return isSuccessful
}

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