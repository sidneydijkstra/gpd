import { prepareWorkerFolder, removeWorkerFolder } from '../fileClient.mjs';
import { parseConfigFile, parseConfigString } from './configParser.mjs';
import { jobs } from './jobs/index.mjs';
import { FileLogger } from './logger.mjs';

const DEBUG_MODE = true

export async function runConfig(config, repo){
    return new Promise(async (resolve, reject) => {
        // Prepare worker folder, creates project, storage and artifacts folders
        var folderPath = prepareWorkerFolder(`${repo.username}-${repo.repository}`)
        // Create file logger
        var logger = new FileLogger(`${folderPath}/log.txt`)
        // Log the start of the job
        logger.log(`Running config ${config} for repository ${repo.username}/${repo.repository}`)

        // Parse the config file
        var parsedConfig = parseConfigString(config)
        
        logger.log(tasks, jobs)
        
        var tasks = parsedConfig.jobs[0].tasks;


        tasks.forEach(task => {
            if(jobs.hasOwnProperty(task.name)){
                jobs[task.name](task, logger)
            } else {
                logger.error(`Job ${task.name} not found`)
            }
        });

        if (!DEBUG_MODE) removeWorkerFolder(repo.guid)
        
        // Resolve the promise
        resolve()
    })
}

// runConfig('./src/gpd.config.yml', {
//     id: 1,
//     guid: '2b7bb8d1-7bfd-4e74-8282-19f1ebf29a71',
//     username: 'sidneydijkstra',
//     repository: 'gpd',
//     content: `{"id":821053139,"node_id":"R_kgDOMPBG0w","name":"gpd","full_name":"sidneydijkstra/gpd","private":false,"owner":{"login":"sidneydijkstra","id":25739092,"node_id":"MDQ6VXNlcjI1NzM5MDky","avatar_url":"https://avatars.githubusercontent.com/u/25739092?v=4","gravatar_id":"","url":"https://api.github.com/users/sidneydijkstra","html_url":"https://github.com/sidneydijkstra","followers_url":"https://api.github.com/users/sidneydijkstra/followers","following_url":"https://api.github.com/users/sidneydijkstra/following{/other_user}","gists_url":"https://api.github.com/users/sidneydijkstra/gists{/gist_id}","starred_url":"https://api.github.com/users/sidneydijkstra/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/sidneydijkstra/subscriptions","organizations_url":"https://api.github.com/users/sidneydijkstra/orgs","repos_url":"https://api.github.com/users/sidneydijkstra/repos","events_url":"https://api.github.com/users/sidneydijkstra/events{/privacy}","received_events_url":"https://api.github.com/users/sidneydijkstra/received_events","type":"User","site_admin":false},"html_url":"https://github.com/sidneydijkstra/gpd","description":null,"fork":false,"url":"https://api.github.com/repos/sidneydijkstra/gpd","forks_url":"https://api.github.com/repos/sidneydijkstra/gpd/forks","keys_url":"https://api.github.com/repos/sidneydijkstra/gpd/keys{/key_id}","collaborators_url":"https://api.github.com/repos/sidneydijkstra/gpd/collaborators{/collaborator}","teams_url":"https://api.github.com/repos/sidneydijkstra/gpd/teams","hooks_url":"https://api.github.com/repos/sidneydijkstra/gpd/hooks","issue_events_url":"https://api.github.com/repos/sidneydijkstra/gpd/issues/events{/number}","events_url":"https://api.github.com/repos/sidneydijkstra/gpd/events","assignees_url":"https://api.github.com/repos/sidneydijkstra/gpd/assignees{/user}","branches_url":"https://api.github.com/repos/sidneydijkstra/gpd/branches{/branch}","tags_url":"https://api.github.com/repos/sidneydijkstra/gpd/tags","blobs_url":"https://api.github.com/repos/sidneydijkstra/gpd/git/blobs{/sha}","git_tags_url":"https://api.github.com/repos/sidneydijkstra/gpd/git/tags{/sha}","git_refs_url":"https://api.github.com/repos/sidneydijkstra/gpd/git/refs{/sha}","trees_url":"https://api.github.com/repos/sidneydijkstra/gpd/git/trees{/sha}","statuses_url":"https://api.github.com/repos/sidneydijkstra/gpd/statuses/{sha}","languages_url":"https://api.github.com/repos/sidneydijkstra/gpd/languages","stargazers_url":"https://api.github.com/repos/sidneydijkstra/gpd/stargazers","contributors_url":"https://api.github.com/repos/sidneydijkstra/gpd/contributors","subscribers_url":"https://api.github.com/repos/sidneydijkstra/gpd/subscribers","subscription_url":"https://api.github.com/repos/sidneydijkstra/gpd/subscription","commits_url":"https://api.github.com/repos/sidneydijkstra/gpd/commits{/sha}","git_commits_url":"https://api.github.com/repos/sidneydijkstra/gpd/git/commits{/sha}","comments_url":"https://api.github.com/repos/sidneydijkstra/gpd/comments{/number}","issue_comment_url":"https://api.github.com/repos/sidneydijkstra/gpd/issues/comments{/number}","contents_url":"https://api.github.com/repos/sidneydijkstra/gpd/contents/{+path}","compare_url":"https://api.github.com/repos/sidneydijkstra/gpd/compare/{base}...{head}","merges_url":"https://api.github.com/repos/sidneydijkstra/gpd/merges","archive_url":"https://api.github.com/repos/sidneydijkstra/gpd/{archive_format}{/ref}","downloads_url":"https://api.github.com/repos/sidneydijkstra/gpd/downloads","issues_url":"https://api.github.com/repos/sidneydijkstra/gpd/issues{/number}","pulls_url":"https://api.github.com/repos/sidneydijkstra/gpd/pulls{/number}","milestones_url":"https://api.github.com/repos/sidneydijkstra/gpd/milestones{/number}","notifications_url":"https://api.github.com/repos/sidneydijkstra/gpd/notifications{?since,all,participating}","labels_url":"https://api.github.com/repos/sidneydijkstra/gpd/labels{/name}","releases_url":"https://api.github.com/repos/sidneydijkstra/gpd/releases{/id}","deployments_url":"https://api.github.com/repos/sidneydijkstra/gpd/deployments","created_at":"2024-06-27T18:01:39Z","updated_at":"2024-06-27T21:14:02Z","pushed_at":"2024-06-27T21:13:58Z","git_url":"git://github.com/sidneydijkstra/gpd.git","ssh_url":"git@github.com:sidneydijkstra/gpd.git","clone_url":"https://github.com/sidneydijkstra/gpd.git","svn_url":"https://github.com/sidneydijkstra/gpd","homepage":null,"size":72,"stargazers_count":0,"watchers_count":0,"language":"JavaScript","has_issues":true,"has_projects":true,"has_downloads":true,"has_wiki":true,"has_pages":false,"has_discussions":false,"forks_count":0,"mirror_url":null,"archived":false,"disabled":false,"open_issues_count":0,"license":null,"allow_forking":true,"is_template":false,"web_commit_signoff_required":false,"topics":[],"visibility":"public","forks":0,"open_issues":0,"watchers":0,"default_branch":"main","permissions":{"admin":false,"maintain":false,"push":false,"triage":false,"pull":true},"network_count":0,"subscribers_count":1}`,
//     lastUpdated: '2024-06-28 13:35:57'
//   })
//     .then(response => {
//     })