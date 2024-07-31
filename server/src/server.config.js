const config = {
    githubApiUrl: 'https://api.github.com',
    gitlabApiUrl: 'https://gitlab.com/api/v4',

    defaultRepoFolderPath: './.regpd',
    defaultWorkerFolderPath: './.wogpd',
    defaultStorageFolderPath: './.stgpd',
    
    repositoryCheckInterval: 100000,

    databaseFilePath: './database.db',

    mqttServerPort: 8888,
    mqttServerUrl: 'ws://192.168.1.2:8888', // <-- TODO: ip is needed for local agent, find a way to get it dynamically
    apiServerUrl: 'http://localhost:3000/api',

    DEBUG_MODE: true
}

export default config