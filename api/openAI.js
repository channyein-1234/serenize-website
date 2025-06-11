import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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",
});

const completion = openai.chat.completions.create({
  model: "gpt-4o-mini",
  store: true,
  messages: [
    {"role": "user", "content": "write a haiku about ai"},
  ],
});

completion.then((result) => console.log(result.choices[0].message));