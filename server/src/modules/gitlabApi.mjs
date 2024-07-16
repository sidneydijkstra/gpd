import config from "../server.config.mjs";
import { useGenerateApi } from "./useGenerateApi.mjs";

const gitlabToken = process.env.GITLAB_API_KEY;

export async function getGitlabRepository(username, repo) {
    const client = useGenerateApi(config.gitlabApiUrl, {
        headers: {
            Authorization: `bearer ${gitlabToken}`,
        },
    });

    var result = await client.users[`${username}`].projects.get({
        search: repo
    });
    
    // Because the Gitlab Api returns an array of
    // repositories we need to return the first one.
    return result.length > 0 ? result[0] : null;
}