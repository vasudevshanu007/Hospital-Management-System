import axios from "axios";

export const askGroq = async (prompt) => {
    try {
        console.log("🔵 Calling Groq API...");

        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a hospital management AI assistant. Answer clearly and politely.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
                timeout: 15000, // 🔥 IMPORTANT: prevent infinite loading
            }
        );

        console.log("🟢 Groq response received");

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("🔴 Groq API Error:");

        if (error.response) {
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }

        return "AI service is temporarily unavailable. Please try again.";
    }
};
