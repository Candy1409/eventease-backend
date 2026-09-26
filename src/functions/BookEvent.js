const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');
const { randomUUID } = require('crypto');

const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
const bookingsContainer = client.database('eventease-db').container('bookings');
const eventsContainer = client.database('eventease-db').container('events');

app.http('BookEvent', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const body = await request.json();
        const { userEmail, eventId } = body || {};

        if (!userEmail || !eventId) {
            return {
                status: 400,
                jsonBody: { error: "userEmail and eventId are required" }
            };
        }

        try {
            const { resource: event } = await eventsContainer.item(eventId, eventId).read();

            if (!event) {
                return {
                    status: 404,
                    jsonBody: { error: "Event not found" }
                };
            }

            const booking = {
                id: randomUUID(),
                userEmail,
                eventId,
                eventTitle: event.title,
                bookedAt: new Date().toISOString()
            };

            await bookingsContainer.items.create(booking);

            return {
                status: 201,
                jsonBody: { message: "Booking confirmed", booking }
            };
        } catch (error) {
            context.error("Error booking event:", error);
            return {
                status: 500,
                jsonBody: { error: "Something went wrong while booking" }
            };
        }
    }
});
