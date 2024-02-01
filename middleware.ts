
class Middleware {
    static async apiKeyValidationMiddleware(req) {
        const validAPIKey = `${process.env.API_AUTHORIZATION_KEY}`; // Hardcoded valid API key

        const apiKeyFromRequest = req.headers.get('Authorization');

        if (!apiKeyFromRequest || apiKeyFromRequest !== `ApiKey ${validAPIKey}`) {
            throw new Error("404 Not Found");
        }
    }
}

export default Middleware;
