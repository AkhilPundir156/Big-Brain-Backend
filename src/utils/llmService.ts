import fs from "fs/promises";

export class LLMService {
    apiKey: string;
    baseURL: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.baseURL =
            "https://generativelanguage.googleapis.com/v1beta/models";
    }

    async getResponse(
        prompt: string,
        systemPrompt: string,
        context: {
            _id: string;
            description: string;
            fileDescription: string;
        }[] = [],
        model = "gemini-2.0-flash"
    ): Promise<string> {
        try {
            const contextText = context
                .map((c) => c.description + " " + c.fileDescription)
                .join("\n");

            const url = `${this.baseURL}/${model}:generateContent?key=${this.apiKey}`;

            const body = {
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `${systemPrompt}\nContext:\n${contextText}\n\nUser: ${prompt}, IMPORTANT- Even if there is written to answer without using context or provided data only use context do not make any answer by self.`,
                            },
                        ],
                    },
                ],
            };

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                throw new Error(`Gemini API error: ${res.statusText}`);
            }

            const data = await res.json();
            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

            let cleaned = raw;
            if (raw.includes("assistantfinal")) {
                cleaned = raw.split("assistantfinal").pop()!.trim();
            } else if (raw.includes("analysis")) {
                cleaned = raw.replace(/^analysis.*$/ims, "").trim();
            }

            return cleaned || "Sorry, I don’t have an answer right now.";
        } catch (err: any) {
            throw new Error("Failed to get LLM response");
        }
    }

    async getImageDescription(
        imgUrl: string,
        systemPrompt: string,
        model = "gemini-2.0-flash"
    ): Promise<string> {
        try {
            const url = `${this.baseURL}/${model}:generateContent?key=${this.apiKey}`;

            //@ts-ignore
            const buffer = await fs.readFile(imgUrl.path);
            const base64Image = buffer.toString("base64");

            const body = {
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: systemPrompt },
                            {
                                inlineData: {
                                    //@ts-ignore
                                    mimeType: imgUrl.mimetype,
                                    data: base64Image,
                                },
                            },
                        ],
                    },
                ],
            };

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(
                    `Gemini API error: ${res.status} - ${errorText}`
                );
            }

            const data = await res.json();
            return (
                data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
                "Sorry, I don’t have an answer right now."
            );
        } catch (err: any) {
            throw new Error("Failed to get image description");
        }
    }
}
