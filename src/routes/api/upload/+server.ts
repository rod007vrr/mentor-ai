import { json } from "@sveltejs/kit";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { pinecone } from "$lib/pinecone";
import { OPENAI_API_KEY } from "$env/static/private";

export async function POST(requestEvent) {
  const { request } = requestEvent;
  const body = await request.json();
  const { text, filename, uid } = body;

  await uploadTextToPinecone(text, filename, uid);

  return json({ filename }, { status: 201 });
}

async function uploadTextToPinecone(
  text: string,
  filename: string,
  uid: string
) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const docs = await textSplitter.splitText(text);
  console.log(OPENAI_API_KEY, "should be key");
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: OPENAI_API_KEY,
  });
  const embeddedDocs = await embeddings.embedDocuments(docs);

  const docsForUpload = [];
  for (let i = 0; i < docs.length; i++) {
    const embeddedDoc = embeddedDocs[i];
    const doc = docs[i];
    docsForUpload.push({
      id: `${docsForUpload.length}`,
      values: embeddedDoc,
      metadata: { text: doc },
    });
  }

  const index = pinecone.Index("main-notes");
  await index.upsert({
    upsertRequest: { vectors: docsForUpload, namespace: `${uid}/${filename}` },
  });
}
