import { json } from '@sveltejs/kit';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeClient } from '@pinecone-database/pinecone';

export async function POST(requestEvent) {
	const { request } = requestEvent;
	const body = await request.json();
	const { text, filename, uid } = body;

	await uploadTextToPinecone(text, filename, uid);

	return json({ filename }, { status: 201 });
}

async function uploadTextToPinecone(text: string, filename: string, uid: string) {
	const textSplitter = new RecursiveCharacterTextSplitter({
		chunkSize: 1000,
		chunkOverlap: 200
	});
	const docs = await textSplitter.splitText(text);

	const embeddings = new OpenAIEmbeddings({
		openAIApiKey: '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'
	});

	const pinecone = new PineconeClient();
	await pinecone.init({
		apiKey: '9e8a3c23-c2a0-4e5c-a844-6d5ed2034f22',
		environment: 'us-east4-gcp'
	});

	const index = pinecone.Index('main-notes');

	const embeddedDocs = await embeddings.embedDocuments(docs);
	const docsForUpload = [];
	for (const doc of embeddedDocs) {
		docsForUpload.push({ id: `${docsForUpload.length}`, values: doc });
	}
	console.log('swing batter');
	console.log(docsForUpload);
	await index.upsert({
		upsertRequest: { vectors: docsForUpload, namespace: `${uid}/${filename}` }
	});
}
