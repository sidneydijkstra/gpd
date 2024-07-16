import { generateAPI } from "./apiClient.js";

const apiClient = generateAPI("http://localhost:3000/api", {
    headers: {
        "Content-Type": "application/json",
    },
});

export async function getStoredRepositories(){
    return apiClient.repository.get()
}

export async function getRepository(username, repository, source='github'){
    return apiClient.repository[`${username}`][`${repository}`].get({
        source: source
    })
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

export async function runPipeline(guid){
    return apiClient.pipeline[`${guid}`].run.post()
}

export async function getPipelinesByRepository(repoGuid){
    return apiClient.from[`${repoGuid}`].pipeline.get()
}

export async function getPipelineByGuid(guid){
    return apiClient.pipeline[`${guid}`].get()
}

export async function addPipeline(repoGuid, name, content){
    return apiClient.from[`${repoGuid}`].pipeline.post({
        name: name, 
        content: content
    })
}

export async function updatePipeline(guid, name, content){
    return apiClient.pipeline[`${guid}`].update.post({
        name: name,
        content: content
    })
}

export async function deletePipeline(guid){
    return apiClient.pipeline[`${guid}`].delete()
}

export async function getPipelineTransactions(guid){
    return apiClient.pipeline[`${guid}`].transaction.get()
}

export async function getPipelineTasks(pipelineGuid, transactionGuid){
    return apiClient.pipeline[`${pipelineGuid}`].transaction[`${transactionGuid}`].task.get()
}
