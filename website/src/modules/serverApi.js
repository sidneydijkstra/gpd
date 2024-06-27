import { generateAPI } from "./apiClient.js";

const apiClient = generateAPI("http://localhost:3000/api", {
    headers: {
    },
});

export async function getStoredRepositories(){
    return apiClient.repository.get()
}

export async function getRepository(username, repository){
    return apiClient.repository[`${username}`][`${repository}`].get()
}

export async function getRepositoryByGuid(guid){
    return apiClient.repository[`${guid}`].get()
}

export async function updateRepository(guid){
    return apiClient.repository[`${guid}`].update.post()
}

export async function deleteRepository(guid){
    return apiClient.repository[`${guid}`].delete()
}

export async function getFiles(username, repository, path=''){
    if(path == ''){
        return apiClient.files[`${username}`][`${repository}`][``].get()
    }

    var call = apiClient.files[`${username}`][`${repository}`]
    var folders = path.split('/')
    for(var folder of folders){
        call = call[folder]
    }

    return call.get()
}