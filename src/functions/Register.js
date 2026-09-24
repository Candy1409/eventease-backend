const { app } = require('@azure/functions');

app.http('Register', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const body = await request.json();
        const { name, email, password } = body || {};

        if (!name || !email || !password) {
            return {
                status: 400,
                jsonBody: { error: "name, email, and password are required" }
            };
        }

        return {
            status: 200,
            jsonBody: { message: `Received registration for ${email}` }
        };
    }
});
