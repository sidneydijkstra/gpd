import config from "#src/server.config.js";
import { useGenerateApi } from "#src/modules/useGenerateApi.js";
import { getGlobalSetting } from "#src/modules/database/settings.js";

export async function getGitlabRepository(username, repo) {
    const gitlabToken = (await getGlobalSetting('gitlabToken')).value;

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