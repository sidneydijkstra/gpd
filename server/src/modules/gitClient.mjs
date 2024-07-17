import { createFolder, isFolderGitRepository } from './fileClient.mjs'
import config from '../server.config.mjs';
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