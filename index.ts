// server.js
import Bun from 'bun';
import Middleware from './middleware.js';

const server = Bun.serve({
    port: process.env.ENV_PORT,
    async fetch(req) {
        try {

            await Middleware.apiKeyValidationMiddleware(req);
            const url = new URL(req.url);

            if (url.pathname === "/search" && req.method === "POST") {
                const requestData = await req.json();
                const queryParam = requestData.queryTerm;
                const elasticsearchUrl = `${process.env.EXACT_MATCH_URL}`;
                const queryBody = {
                    "query": {
                        "bool": {
                            "should": [
                                { "term": { "materialNumberKeyword.keyword": queryParam } },
                                { "term": { "aliasKeyword.keyword": queryParam } },
                                { "term": { "keywordsKeyword.keyword": queryParam } },
                                { "term": { "MFRPartNoKeyword.keyword": queryParam } },
                                { "term": { "UPCCodeKeyword.keyword": queryParam } }
                            ],
                            "filter": [
                                { "term": { "webVisibleStatus": "Y" } },
                                { "term": { "categoryVisibleStatus": 1 } }
                            ],
                            "minimum_should_match": 1
                        }
                    }
                };
                const requestOptions = {
                    method: 'POST',
                    headers: {
                        'Authorization': `ApiKey ${process.env.API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(queryBody)
                };

                const response = await fetch(elasticsearchUrl, requestOptions);
                const responseData = await response.json();
                return new Response(JSON.stringify(responseData), { headers: { 'Content-Type': 'application/json' } });
            }
        } catch (error) {
            console.error('Error:', error.message);
            return new Response("404 Not Found", { status: 404 });
        }
    },
});

console.log(`Listening on http://localhost:${process.env.ENV_PORT} ...`);
