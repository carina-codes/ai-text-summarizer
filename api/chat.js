export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Invalid message input." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that summarizes text." },
          { role: "user", content: `Summarize this:\n\n${message}` },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    const data = await response.json();

    console.log("OpenAI raw response:", data);

    if (!data.choices || !data.choices[0]?.message?.content) {
      return res.status(500).json({
        error: "No valid response from OpenAI",
        details: data,
      });
    }

    const summary = data.choices[0].message.content.trim();
    return res.status(200).json({ result: summary });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return res.status(500).json({
      error: "OpenAI request failed",
      detail: error.message,
    });
  }
}
