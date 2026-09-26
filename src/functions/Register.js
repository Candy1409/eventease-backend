const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
const database = client.database('eventease-db');
const container = database.container('users');

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

        try {
            // Check if user already exists
            const { resources } = await container.items
                .query({
                    query: "SELECT * FROM c WHERE c.email = @email",
                    parameters: [{ name: "@email", value: email }]
                })
                .fetchAll();

            if (resources.length > 0) {
                return {
                    status: 409,
                    jsonBody: { error: "A user with this email already exists" }
                };
            }

            // Save the new user
            const newUser = { name, email, password };
            await container.items.create(newUser);

            return {
                status: 201,
                jsonBody: { message: `User ${email} registered successfully` }
            };
        } catch (error) {
            context.error("Error saving user:", error);
            return {
                status: 500,
                jsonBody: { error: "Something went wrong while registering" }
            };
        }
    }
});
