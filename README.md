# GPD: Local CI/CD Application
GPD is a local CI/CD (Continuous Integration/Continuous Deployment) application designed to simplify the process of building, testing, and deploying your applications. The system is divided into two components: a front-end and a back-end, both developed using Node.js.

## Setup
Before running any part of the system, you'll need to create a SQLite3 database. This can be done by executing the following command, which will create the database file and run the necessary migrations to set up the tables:

```bash
node ./server/src/database/_migrate.js ./server/database.db
```

### Back-end
The back-end system manages different repositories and their associated pipelines. The configuration for the back-end is located at `./server/src/server.config.js` and contains the following settings:
```js
{
    // git endpoints
    githubApiUrl: 'https://api.github.com',
    gitlabApiUrl: 'https://gitlab.com/api/v4',

    // working folders
    defaultRepoFolderPath: './.regpd',
    defaultWorkerFolderPath: './.wogpd',
    defaultArtifactFolderPath: './.argpd',
    
    repositoryCheckInterval: 10000, // Interval in (ms)

    databaseFilePath: './database.db',

    // mqtt configuration
    mqttServerPort: 8888,
    mqttServerUrl: 'ws://localhost:8888',
    // api configuration
    apiServerUrl: 'http://localhost:3000/api',

    DEBUG_MODE: true
}
```

To start the back-end in developer mode (with hot-reload), use the following command:
```bash
npm run dev
```

To run the back-end in production mode (without hot-reload), use:
```bash
npm run prod
```

### Front-end
The front-end provides an interface to manage the repositories and pipelines in the system. The configuration file for the front-end is located at `./server/src/website.config.js` and contains the following settings:

```js
{
    mqttServerUrl: 'ws://localhost:8888',
    apiServerUrl: 'http://localhost:3000/api'
}
```

To start the front-end in development mode, use the following command:
```bash
npm run dev
```

To run the front-end in preview mode (using Vite), use the following commands:
```bash
npm run build
npm run preview
```

## Docker
A Dockerfile is included in the project, allowing you to build a Docker image that contains both the front-end and back-end systems. To build the Docker image, run the following command:
```bash
docker build -t gpd .
```

The container exposes the following ports:

- `3000` for the back-end API
- `3001` for the front-end
- `8888` for WebSocket connections (MQTT)

To run the Docker container, use this command:
```bash
docker run -it -d -p 3000:3000 -p 3001:3001 -p 8888:8888 gpd
```

If needed, you can modify the ports by:
1. Updating the server and website configuration files.
2. Modifying the Dockerfile to expose the correct ports.
3. Adjusting the docker run command to map the appropriate ports.