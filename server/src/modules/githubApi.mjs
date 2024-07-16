import config from "../server.config.mjs";
import { useGenerateApi } from "./useGenerateApi.mjs";

const githubToken = process.env.GITHUB_API_KEY;

export async function getRateLimit(){
    const client = useGenerateApi(config.githubApiUrl, {
        headers: {
            "User-Agent": "xyz",
            Authorization: `bearer ${githubToken}`,
        },
    });

    return client.rate_limit.get()
}

export async function getGithubRepository(username, repo) {
    const client = useGenerateApi(config.githubApiUrl, {
        headers: {
            "User-Agent": "xyz",
            Authorization: `bearer ${githubToken}`,
        },
    });

    return client.repos[`${username}`][`${repo}`].get();
}

// Function to help with monitoring Github Api rate limit
async function rateLimit(){
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
        .catch(error => {
            console.log(`[GithubApi] Error getting rate limit: ${error}`)
        })

    return rateLimit;
}