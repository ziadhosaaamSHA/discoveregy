import { DESTINATIONS } from "../data/destinations";

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const MODEL_NAME = "gpt-4o-mini";

export async function generateTravelPlan(prompt, language = 'en') {
  const destList = DESTINATIONS.map(d => `- ID: ${d.id} | Name: ${d.copy.en.name} | Location: ${d.copy.en.location}`).join('\n');
  
  const systemPrompt = `You are the Discover Egypt Travel Architect.
Your mission is to generate 3 distinct travel plan options based on the user's prompt.
Each plan must include a unique selection of 4-5 destinations from the provided list.

LIST OF SUPPORTED DESTINATIONS:
${destList}

CRITICAL: 
1. Your response must be ONLY a valid JSON array of 3 objects.
2. Each object must have these exactly properties: 
   - "id": (unique string id)
   - "title": (the name of this plan option in ${language === 'ar' ? 'Arabic' : 'English'})
   - "description": (a brief 2-sentence overview of why this plan fits the user in ${language === 'ar' ? 'Arabic' : 'English'})
   - "destinations": [id1, id2, id3, id4] (array of IDs from the list above)
3. Use only the provided IDs. Do NOT invent new places.

Prompt: "${prompt}"
Response format: [{"id": "p1", "title": "...", "description": "...", "destinations": [...]}, ...]`;

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
        max_tokens: 1500 
      })
    });

    const data = await response.json();
    if (data.choices?.[0]) {
      const content = data.choices[0].message.content.trim();
      const jsonString = content.replace(/^```json/, '').replace(/```$/, '');
      const aiPlans = JSON.parse(jsonString);
      
      return aiPlans.map(plan => ({
        id: plan.id,
        title: plan.title,
        text: plan.description,
        // Map destination IDs to full objects
        destinations: plan.destinations.map(id => DESTINATIONS.find(d => d.id === Number(id))).filter(Boolean),
        image: DESTINATIONS.find(d => d.id === Number(plan.destinations[0]))?.image || "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?auto=format&fit=crop&q=80&w=800"
      }));
    }
    throw new Error("Invalid AI response");
  } catch (err) {
    console.error("AI Plan Generation Error:", err);
    throw err;
  }
}
