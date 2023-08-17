import { OpenAIApi, Configuration } from "openai";
import { OPENAI_API_KEY } from "$env/static/private";

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default openai;
