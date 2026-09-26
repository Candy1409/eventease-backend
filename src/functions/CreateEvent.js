const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');
const { randomUUID } = require('crypto');

const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
const container = client.database('eventease-db').container('events');

app.http('CreateEvent', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const body = await request.json();
        const { title, description, date, location, imageUrl } = body || {};

        if (!title || !date || !location) {
            return {
                status: 400,
                jsonBody: { error: "title, date, and location are required" }
            };
        }

        try {
            const newEvent = {
                id: randomUUID(),
                title,
                description: description || "",
                date,
                location,
                imageUrl: imageUrl || "",
                createdAt: new Date().toISOString()
            };

            await container.items.create(newEvent);

            return {
                status: 201,
                jsonBody: { message: "Event created", event: newEvent }
            };
        } catch (error) {
            context.error("Error creating event:", error);
            return {
                status: 500,
                jsonBody: { error: "Something went wrong while creating the event" }
            };
        }
    }
});
