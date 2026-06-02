import { fetchDestinations } from "./destinations-data";

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const MODEL_NAME = "gpt-4o-mini";

/**
 * Generates three custom travel-plan suggestions using the configured AI endpoint.
 *
 * The model is constrained to real destination ids loaded from the API so generated
 * plans can be booked and priced by the same backend-backed destination data.
 */
export async function generateTravelPlan(prompt, language = 'en') {
  // Load real destinations before prompting so the model cannot invent unsupported places.
  const destinations = await fetchDestinations().catch((err) => {
    console.error("Failed to load destinations for AI prompt:", err);
    return [];
  });

  const destList = destinations.map(d => `- ID: ${d.id} | Name: ${d.copy?.en?.name || d.copy?.name || 'Unknown'} | Location: ${d.copy?.en?.location || d.copy?.location || 'Egypt'}`).join('\n');
  
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
    // The external inference endpoint returns chat-completion content with JSON inside.
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
      // Strip optional markdown code fences before JSON parsing.
      const content = data.choices[0].message.content.trim();
      const jsonString = content.replace(/^```json/, '').replace(/```$/, '');
      const aiPlans = JSON.parse(jsonString);
      
      return aiPlans.map(plan => {
        // Match generated destination ids back to the real API-backed destination objects.
        const planDestIds = Array.isArray(plan.destinations) ? plan.destinations.map(String) : [];
        const matched = destinations.filter(d => planDestIds.includes(String(d.id)));
        return {
          id: plan.id,
          title: plan.title,
          text: plan.description,
          destinations: matched,
          image: matched[0]?.image || "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?auto=format&fit=crop&q=80&w=800",
        };
      });
    }
    throw new Error("Invalid AI response");
  } catch (err) {
    // Keep network/token failures readable for the custom-plan UI.
    let errorMessage = "AI Plan Generation Error: " + err.message;
    if (err.message.includes("Failed to fetch") || err.name === "TypeError") {
      errorMessage = "Connection error. Please check your internet or GITHUB_TOKEN.";
    }
    console.error(errorMessage, err);
    throw new Error(errorMessage);
  }
}
