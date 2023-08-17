import type { Actions } from "./$types";
import { pinecone } from "$lib/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OPENAI_API_KEY } from "$env/static/private";
import openai from "$lib/openai";

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const queryTopic = (await formData.get("queryTopic")) as string;
    const fileName = (await formData.get("file")) as string;
    const uid = (await formData.get("uid")) as string;

    const pineconeIndex = pinecone.Index("main-notes");
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({
        openAIApiKey: OPENAI_API_KEY,
      }),
      {
        pineconeIndex,
        namespace: `${uid}/${fileName}`,
      }
    );

    //look into cookie based auth for this

    const results = await vectorStore.similaritySearch(queryTopic, 5);

    const contexts: string[] = [];

    results.forEach((result) => {
      contexts.push(result.pageContent);
    });

    const prompt = `Please generate 5 study questions for the topic of ${queryTopic} 
    using the following as text context on ${queryTopic}: ${contexts.join(
      "\n"
    )}`;

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const answer = response.data.choices[0].message?.content;

    return { success: true, message: answer };
  },
} satisfies Actions;
