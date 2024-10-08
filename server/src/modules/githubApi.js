import config from "#src/server.config.js";
import { useGenerateApi } from "#src/modules/useGenerateApi.js";
import { getGlobalSetting } from "#src/modules/database/settings.js";

export async function getRateLimit(){
    const githubToken = (await getGlobalSetting('githubToken'))?.value;

    const client = useGenerateApi(config.githubApiUrl, {
        headers: {
            "User-Agent": "xyz",
            Authorization: `bearer ${githubToken}`,
        },
    });

    return client.rate_limit.get()
}

export async function getGithubRepository(username, repo) {
    const githubToken = (await getGlobalSetting('githubToken'))?.value;

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