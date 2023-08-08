<script lang="ts">
	import AuthCheck from '$lib/components/AuthCheck.svelte';
	import { user, storage, db } from '$lib/firebase';
	import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
	import { getDownloadURL, getMetadata, ref, uploadBytes } from 'firebase/storage';
	import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
	import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
	import { PineconeStore } from 'langchain/vectorstores/pinecone';
	import { PineconeClient } from '@pinecone-database/pinecone';
	import { Document } from 'langchain/document';

	import * as PDFJS from 'pdfjs-dist';
	PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.js`;

	enum UploadState {
		Idle,
		Uploading,
		Complete,
		Error
	}

	let uploading: UploadState = UploadState.Idle;

	async function upload(e: any) {
		uploading = UploadState.Uploading;

		const file = e.target.files[0];
		const path = `users/${$user!.uid}/files/${file.name}`;

		// Read the text content from the PDF file
		const text = await extractFileText(file);
		await uploadTextToPinecone(text);

		//uploading to firebase storage
		// const storageRef = ref(storage, `users/${$user!.uid}/files/${file.name}`);
		// const result = await uploadBytes(storageRef, file);
		// const url = await getDownloadURL(result.ref);

		// await updateDoc(doc(db, 'users', $user!.uid), {
		// 	files: arrayUnion({ name: file.name, url, path })
		// });

		uploading = UploadState.Complete;
	}

	// async function extractFileText(file: any) {
	// 	const reader = new FileReader();
	// 	let text = '';
	// 	reader.onload = async () => {
	// 		const typedArray = new Uint8Array(reader.result as ArrayBuffer);
	// 		const pdf = await PDFJS.getDocument(typedArray).promise;
	// 		for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
	// 			const page = await pdf.getPage(pageNum);
	// 			console.log(page);

	// 			text += await page.getTextContent();
	// 			const content = await page.getTextContent();
	// 			for (const item of content.items) {
	// 				// @ts-ignore
	// 				text += item.str;
	// 				/* if ('str' in item) {
	//                     text += item['str'];
	//                 } */
	// 			}
	// 		}
	// 	};

	// 	await reader.readAsArrayBuffer(file);

	// 	console.log('got text', text);
	// 	console.log(text);

	// 	return text;
	// }

	async function extractFileText(file: any) {
		return new Promise<string>((resolve) => {
			const reader = new FileReader();
			let text = '';

			reader.onload = async () => {
				const typedArray = new Uint8Array(reader.result as ArrayBuffer);
				const pdf = await PDFJS.getDocument(typedArray).promise;

				for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
					const page = await pdf.getPage(pageNum);
					const content = await page.getTextContent();

					for (const item of content.items) {
						// @ts-ignore
						text += item.str;
					}
				}

				resolve(text); // Resolve the Promise with the extracted text
			};

			// Start reading the file
			reader.readAsArrayBuffer(file);
		});
	}

	async function uploadTextToPinecone(text: string) {
		const textSplitter = new RecursiveCharacterTextSplitter({
			chunkSize: 1000,
			chunkOverlap: 200
		});
		const docs = await textSplitter.splitText(text);

		const embeddings = new OpenAIEmbeddings({
			openAIApiKey: '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' // In Node.js defaults to process.env.OPENAI_API_KEY
		});

		const pinecone = new PineconeClient();
		await pinecone.init({
			apiKey: '9e8a3c23-c2a0-4e5c-a844-6d5ed2034f22',
			environment: 'us-east4-gcp'
		});

		const index = pinecone.Index('main-notes');

		/* let docsList = [];

		for (const doc of docs) {
			docsList.push(new Document({ metadata: { foo: `${docsList.length}` }, pageContent: doc }));
		} */

		/* await PineconeStore.fromTexts(docs, { text: 'text' }, embeddings, {
			pineconeIndex: index,
			namespace: 'test',
			textKey: 'text'
		}); */

		//console.log(docsList);

		const embeddedDocs = await embeddings.embedDocuments(docs);
		const docsForUpload = [];
		for (const doc of embeddedDocs) {
			docsForUpload.push({ id: `${docsForUpload.length} b`, values: doc });
		}
		console.log('swing batter');
		console.log(docsForUpload);
		await index.upsert({ upsertRequest: { vectors: docsForUpload } });
		console.log('he hits');
		/* await PineconeStore.fromDocuments(docsList, embeddings, {
			pineconeIndex: index,
			namespace: 'broooooo',
			textKey: 'broooooo'
		}); */

		console.log('upload complete');

		/* const d = [
			new Document({
				metadata: { foo: 'bar' },
				pageContent: 'pinecone is a vector db'
			}),
			new Document({
				metadata: { foo: 'bar' },
				pageContent: 'the quick brown fox jumped over the lazy dog'
			}),
			new Document({
				metadata: { baz: 'qux' },
				pageContent: 'lorem ipsum dolor sit amet'
			}),
			new Document({
				metadata: { baz: 'qux' },
				pageContent: 'pinecones are the woody fruiting body and of a pine tree'
			})
		];

		await PineconeStore.fromDocuments(d, embeddings, {
			pineconeIndex: index
		}); */
	}
</script>

<h2 class="card-title">Upload a file to your repo</h2>

<AuthCheck>
	<form class="max-w-screen-md w-full">
		<div class="form-control w-full max-w-xs my-10 mx-auto text-center">
			<label for="image" class="label">
				<span class="label-text">Pick a file</span>
			</label>
			<input
				on:change={upload}
				name="image"
				type="file"
				class="file-input file-input-bordered w-full max-w-xs"
				accept="application/pdf"
			/>
			{#if uploading == UploadState.Uploading}
				<p>Uploading...</p>
				<progress class="progress progress-info w-56 mt-6" />
			{/if}
		</div>
	</form>
</AuthCheck>
