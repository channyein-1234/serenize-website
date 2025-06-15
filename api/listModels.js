// listModels.js
import 'dotenv/config'; // Load .env
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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',
});

async function listModels() {
  try {
    const models = await openai.models.list();
    console.log('Available models:');
    models.data.forEach((model) => console.log(model.id));
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();
