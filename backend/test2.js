const dotenv = require("dotenv");
dotenv.config();
const OpenAI = require("openai");
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const run = async () => {
    try {
        const response = await openai.responses.create({
            model: "gpt-5-nano",
            input: "hii ai",
            store: true,
        });

        console.log("MyQuoteMate::", response.output_text);
    } catch (error) {
        console.error("OpenAI Error:", error?.message || error);
    }
};

run();
