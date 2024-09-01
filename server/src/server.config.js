const config = {
    githubApiUrl: 'https://api.github.com',
    gitlabApiUrl: 'https://gitlab.com/api/v4',

    defaultRepoFolderPath: './.regpd',
    defaultWorkerFolderPath: './.wogpd',
    defaultArtifactFolderPath: './.argpd',
    
    repositoryCheckInterval: 10000,

    databaseFilePath: './database.db',

    mqttServerPort: 8888,
    mqttServerUrl: 'ws://localhost:8888',
    apiServerUrl: 'http://localhost:3000/api',

    DEBUG_MODE: true
}

export default config