import { generateAPI } from "./apiClient.js";

import config from '@/website.config.js'

const apiClient = generateAPI(config.apiServerUrl, {
    headers: {
        "Content-Type": "application/json",
    },
});

export async function hasTokens(){
    return apiClient.setting.tokens.get()
}

export async function updateToken(token, value){
    return apiClient.setting.tokens[`${token}`].post({
        value: value
    })
}

export async function getSettings(repoGuid=null){
    // Get the global settings
    var globalSettings = apiClient.setting.global.get()
    // If a repository guid is provided, get the repository settings
    var repositorySettings = repoGuid == null ? Promise.resolve([]) : apiClient.setting.repository[`${repoGuid}`].get()
    // Return the global and repository as a single array inside a promise
    return Promise.all([globalSettings, repositorySettings]).then((settings) => settings[0].concat(settings[1]))
}

export async function updateSetting(key, value){
    return apiClient.setting.global[`${key}`].post({
        value: value
    })
}

export async function updateRepositorySetting(repoGuid, key, value){
    return apiClient.setting.repository[`${repoGuid}`][`${key}`].post({
        value: value
    })
}

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

export async function getArtifacts(query = null){
    return query ? apiClient.artifact.get(query) : apiClient.artifact.get()
}

export async function downloadArtifact(artifactGuid){
    return apiClient.artifact[`${artifactGuid}`].download.blob()
}

export async function getAgents(){
    return apiClient.agents.get()
}

export async function getAllStorage(){
    return apiClient.storage.get()
}

export async function getStorageByRepository(guid){
    return apiClient.storage.repository[`${guid}`].get()
}

export async function addStorage(name, type, content, repoGuid = null){
    return apiClient.storage.post({
        name: name,
        type: type,
        content: content,
        repoGuid: repoGuid
    })
}

export async function updateStorage(guid, name, type, content, repoGuid = null){
    return apiClient.storage[`${guid}`].post({
        name: name,
        type: type,
        content: content,
        repoGuid: repoGuid
    })
}

export async function deleteStorage(guid){
    return apiClient.storage[`${guid}`].delete()
}
