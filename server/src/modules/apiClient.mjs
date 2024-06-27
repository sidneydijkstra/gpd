/* Ultra lightweight Github REST Client 
    from: https://gist.github.com/DavidWells/93535d7d6bec3a7219778ebcfa437df3 
*/

import fetch from "node-fetch";

export function generateAPI(baseUrl, defaults = {}) {
    const callable = () => {};
    callable.url = baseUrl;
    return new Proxy(callable, {
        get({ url }, propKey) {
            const method = propKey.toUpperCase();
            if (["GET", "POST", "PUT", "DELETE", "PATCH"].includes(method)) {
                return (data, overrides = {}) => {
                    const payload = { method, ...defaults, ...overrides };
                    switch (method) {
                        case "GET": {
                            if (data) url = `${url}?${new URLSearchParams(data)}`;
                                break;
                        }
                        case "POST":
                        case "PUT":
                        case "PATCH": {
                            payload.body = JSON.stringify(data);
                        }
                    }
                    return fetch(url, payload).then((d) => d.json());
                };
            }

            return generateAPI(`${url}/${propKey}`, defaults);
        },
    });
}