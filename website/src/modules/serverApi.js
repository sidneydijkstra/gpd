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