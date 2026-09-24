const { app } = require('@azure/functions');

app.http('Login', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const body = await request.json();
        const { email, password } = body || {};

        if (!email || !password) {
            return {
                status: 400,
                jsonBody: { error: "email and password are required" }
            };
        }

        // Placeholder check — real validation comes once the database is connected in Module 5
        return {
            status: 200,
            jsonBody: { message: `Login successful for ${email}` }
        };
    }
});
