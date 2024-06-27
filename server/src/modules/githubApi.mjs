import { generateAPI } from "./apiClient.mjs";

const token = process.env.GITHUB_API_KEY;
const githubClient = generateAPI("https://api.github.com", {
    headers: {
        "User-Agent": "xyz",
        Authorization: `bearer ${token}`,
    },
});

export async function getRateLimit(){
    return githubClient.rate_limit.get()
}

export async function getRepo(username, repo) {
    /* GET /repos/{owner}/{repo} */
    return githubClient.repos[`${username}`][`${repo}`].get();
}

export function onError(error){
    console.log(`An error occurred: ${error}`)
}

export async function rateLimit(){
    var rateLimit;

    await getRateLimit()
        .then(response => {
            rateLimit = {
                limit: response.rate.limit,
                used: response.rate.used,
                remaining: response.rate.remaining,
                reset: response.rate.reset,
            }
            
        })
        .catch(onError)

    return rateLimit;
}