const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
const database = client.database('eventease-db');
const container = database.container('users');

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

        try {
            const { resources } = await container.items
                .query({
                    query: "SELECT * FROM c WHERE c.email = @email",
                    parameters: [{ name: "@email", value: email }]
                })
                .fetchAll();

            if (resources.length === 0) {
                return {
                    status: 401,
                    jsonBody: { error: "Invalid email or password" }
                };
            }

            const user = resources[0];

            if (user.password !== password) {
                return {
                    status: 401,
                    jsonBody: { error: "Invalid email or password" }
                };
            }

            return {
                status: 200,
                jsonBody: { message: `Login successful for ${email}` }
            };
        } catch (error) {
            context.error("Error during login:", error);
            return {
                status: 500,
                jsonBody: { error: "Something went wrong while logging in" }
            };
        }
    }
});
