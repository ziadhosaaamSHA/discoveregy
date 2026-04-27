import { DESTINATIONS } from "../data/destinations";

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const MODEL_NAME = "gpt-4o-mini";

export async function generateTravelPlan(prompt, language = 'en') {
  const destList = DESTINATIONS.map(d => `- ID: ${d.id} | Name: ${d.copy.en.name} | Location: ${d.copy.en.location}`).join('\n');
  
  const systemPrompt = `You are the Discover Egypt Travel Architect.
Your mission is to generate a travel plan based on the user's prompt.
You MUST select exactly 4 destinations from the provided list below that best match the user's interests.

LIST OF SUPPORTED DESTINATIONS:
${destList}

CRITICAL: 
1. Your response must be ONLY a valid JSON array of 4 objects.
2. Each object must have these exactly properties: 
   - "id": (must match the ID from the list)
   - "title": (the name of the destination in ${language === 'ar' ? 'Arabic' : 'English'})
   - "reason": (a brief 1-sentence reason why this fits the user's prompt in ${language === 'ar' ? 'Arabic' : 'English'})
3. Use only the provided list. Do NOT invent new places.

Prompt: "${prompt}"
Response format: [{"id": 1, "title": "...", "reason": "..."}, ...]`;

  try {
    const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${GITHUB_TOKEN}` 
      },
      body: JSON.stringify({ 
        messages: [{ role: "system", content: systemPrompt }], 
        model: MODEL_NAME, 
        temperature: 0.5, 
        max_tokens: 800 
      })
    });

    const data = await response.json();
    if (data.choices?.[0]) {
      const content = data.choices[0].message.content.trim();
      // Clean potential markdown code blocks
      const jsonString = content.replace(/^```json/, '').replace(/```$/, '');
      const selectedDestIds = JSON.parse(jsonString);
      
      // Map IDs back to full destination data
      return selectedDestIds.map(item => {
        const fullDest = DESTINATIONS.find(d => d.id === item.id);
        return {
          id: fullDest.id,
          title: item.title,
          image: fullDest.image,
          text: item.reason,
          fullDescription: fullDest.copy[language]?.description || fullDest.copy.en.description
        };
      });
    }
    throw new Error("Invalid AI response");
  } catch (err) {
    console.error("AI Plan Generation Error:", err);
    throw err;
  }
}
