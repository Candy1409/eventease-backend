const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
const container = client.database('eventease-db').container('restaurants');

app.http('ListRestaurants', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const search = request.query.get('search');

        try {
            let querySpec;
            if (search) {
                querySpec = {
                    query: "SELECT * FROM c WHERE CONTAINS(LOWER(c.name), LOWER(@search)) OR CONTAINS(LOWER(c.cuisine), LOWER(@search)) OR CONTAINS(LOWER(c.location), LOWER(@search))",
                    parameters: [{ name: "@search", value: search }]
                };
            } else {
                querySpec = { query: "SELECT * FROM c" };
            }

            const { resources } = await container.items.query(querySpec).fetchAll();

            return {
                status: 200,
                jsonBody: { restaurants: resources }
            };
        } catch (error) {
            context.error("Error listing restaurants:", error);
            return {
                status: 500,
                jsonBody: { error: "Something went wrong while fetching restaurants" }
            };
        }
    }
});
