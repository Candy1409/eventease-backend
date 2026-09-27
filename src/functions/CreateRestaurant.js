const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');
const { randomUUID } = require('crypto');

const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
const container = client.database('eventease-db').container('restaurants');

app.http('CreateRestaurant', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const body = await request.json();
        const { name, cuisine, location, priceRange, rating, imageUrl } = body || {};

        if (!name || !cuisine || !location) {
            return {
                status: 400,
                jsonBody: { error: "name, cuisine, and location are required" }
            };
        }

        try {
            const newRestaurant = {
                id: randomUUID(),
                name,
                cuisine,
                location,
                priceRange: priceRange || "$$",
                rating: rating || 4.0,
                imageUrl: imageUrl || "",
                createdAt: new Date().toISOString()
            };

            await container.items.create(newRestaurant);

            return {
                status: 201,
                jsonBody: { message: "Restaurant added", restaurant: newRestaurant }
            };
        } catch (error) {
            context.error("Error creating restaurant:", error);
            return {
                status: 500,
                jsonBody: { error: "Something went wrong while adding the restaurant" }
            };
        }
    }
});
