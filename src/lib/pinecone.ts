import { PineconeClient } from '@pinecone-database/pinecone';

const client = new PineconeClient();
await client.init({
	apiKey: '9e8a3c23-c2a0-4e5c-a844-6d5ed2034f22',
	environment: 'us-east4-gcp'
});

export const pinecone = client;
