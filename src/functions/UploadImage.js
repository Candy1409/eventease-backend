const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');
const { randomUUID } = require('crypto');

const connectionString = process.env.AzureWebJobsStorage;
const containerName = 'event-images';

app.http('UploadImage', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const contentType = request.headers.get('content-type') || 'application/octet-stream';
            const fileExtension = contentType.split('/')[1] || 'jpg';
            const blobName = `${randomUUID()}.${fileExtension}`;

            const arrayBuffer = await request.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            await blockBlobClient.upload(buffer, buffer.length, {
                blobHTTPHeaders: { blobContentType: contentType }
            });

            return {
                status: 201,
                jsonBody: { imageUrl: blockBlobClient.url }
            };
        } catch (error) {
            context.error("Error uploading image:", error);
            return {
                status: 500,
                jsonBody: { error: "Something went wrong while uploading the image" }
            };
        }
    }
});
