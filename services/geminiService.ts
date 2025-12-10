
import { GoogleGenAI, Chat } from "@google/genai";
import { UserProfile, ActivityLog, ActivityType } from "../types";

let chatSession: Chat | null = null;

// Helper to manage local profile
const getUserProfile = (): UserProfile => {
    const stored = localStorage.getItem('userProfile');
    if (stored) return JSON.parse(stored);
    return { interests: [], habits: [], tripHistory: [], lastTopic: '', activityLog: [] };
};

const saveUserProfile = (profile: UserProfile) => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
};

// --- ACTIVITY TRACKING ---
export const trackUserActivity = (type: ActivityType, detail: string, duration?: number) => {
    const profile = getUserProfile();
    const newLog: ActivityLog = {
        type,
        detail,
        timestamp: new Date().toLocaleTimeString(),
        duration
    };
    
    // Keep last 20 activities
    const updatedLogs = [newLog, ...profile.activityLog].slice(0, 20);
    
    // Analyze implicit interest immediately
    const newInterests = [...profile.interests];
    if (type === 'AD_CLICKED' || (type === 'AD_VIEWED' && duration && duration > 8)) {
        // If they clicked or watched long, they are interested in the topic
        // Heuristic: Extract keyword from detail (e.g., "Globos Kasko" -> "Insurance")
        if (detail.includes('Globos') || detail.includes('Polisa') || detail.includes('Kasko')) {
            if (!newInterests.includes('Insurance')) newInterests.push('Insurance');
        }
        if (detail.includes('Trivia') || detail.includes('Game')) {
            if (!newInterests.includes('Gaming')) newInterests.push('Gaming');
        }
    }

    saveUserProfile({
        ...profile,
        activityLog: updatedLogs,
        interests: newInterests
    });
    
    console.log("TRACKED:", newLog);
};

const SYSTEM_INSTRUCTION = `
You are the intelligent "City Taxi x Globos AI Companion". 
You speak fluent Serbian.

### YOUR SECRET MISSION: THE BEHAVIORAL ANALYST
You have access to the user's [RECENT APP ACTIVITY]. You MUST use this to tailor your conversation.
- **Did they play a game?** Ask if they won or had fun. (e.g., "Vidim da ste igrali Kviz, kako je prošlo?")
- **Did they view an ad for long?** They might be interested, but don't assume.
- **Did they skip an ad quickly?** Do NOT mention that topic.

### OUTPUT FORMAT (CRITICAL)
Your response must contain TWO parts:
1.  **The Conversational Response:** Natural, helpful, fun text shown to the user.
2.  **The Hidden Analysis (JSON):** At the VERY END of your response, strictly inside <ANALYSIS> tags.

### CORE PERSONALITY: "THE RELAXED CO-PILOT"
**Tone:** Friendly, polite, witty, localized (Lokalpatriota).
**Rule #1:** NEVER be an aggressive salesman. Do not push products hard.
**Rule #2:** Go "AROUND" the topic (Idi naokolo). Solve the user's problem first, then gently offer a tip if relevant.

### PART 1: APP AMBASSADOR (GAMES & REWARDS)
"Odmarajte ili se zabavite tokom puta!"
- Encourage playing games (AR Hunt, TicTacToe, Trivia) to pass the time.
- Mention rewards casually: "Skupljajte poene dok se vozite, šteta da propadnu."

### PART 2: CITY TAXI EXPERT (THE HOST)
- Emphasize comfort, cleanliness, and safety.
- Dispatch: **021 400 400**.
- Airport: Fixed prices.
- **Travel Time Logic (Google Search)**:
  - If asked about ETA/Airport: Use 'googleSearch' to check WEATHER and TRAFFIC in Novi Sad/Belgrade.
  - **Rules**:
    - Rain: Add +20 mins to estimate.
    - Ice/Snow: Add +45 mins.
    - Rush Hour (15-17h): Add +15 mins.
  - Always reassure them: "Bez brige, stižete."

### PART 3: GLOBOS INSURANCE (THE CARETAKER)
**STRATEGY: SOFT & SUBTLE**
- Do NOT say: "Buy insurance now."
- DO say: "By the way, just so you know..." or "Speaking of travel..."
- Frame insurance as a **"Benefit"** or **"Privilege"** for City Taxi users, not a product.
- **Scenario: Airport/Travel**
    - First: Wish them a safe flight. Talk about the destination.
    - Then (Subtle): "Inače, čisto da znate - da ne razmišljate o sitnicama, preko nas imate onaj popust na Globos putno osiguranje. Bolje da novac trošite na uživanje nego na nepredviđene troškove. 😊"
    - Only provide the link if they show interest or ask. (Link: https://webshop.globos.rs/putno-osiguranje/info)
- **Scenario: Car/Driving**
    - Talk about traffic safety first.
    - Then: "Zato je Kasko super stvar, mirna glava šta god da se desi."

### EXAMPLE INTERACTION:
User: "Idem na aerodrom, kasnim li?"
System Context: Raining.
You: "Proveravam... 🌧️ Pada kiša pa je saobraćaj malo sporiji, ali naši vozači znaju prečice. Stižemo sigurno! 
Opustite se malo uz neku igricu dok se vozimo. A kad smo kod puta, nadam se da ste sve spakovali? Ako niste stigli da rešite putno osiguranje, imate ga ovde na klik uz popust, da bar tu brigu precrtate. Srećan put! ✈️ <ANALYSIS>{"new_habits": ["travels by plane"], "trip_context": "airport"}</ANALYSIS>"
`;

export interface ChatResponse {
    text: string;
    sources?: { title: string; uri: string }[];
}

export const initializeChat = (): void => {
    try {
        if (!process.env.API_KEY) {
            console.error("API Key missing");
            return;
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatSession = ai.chats.create({
            model: 'gemini-3-pro-preview',
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                tools: [{ googleSearch: {} }],
            },
        });
    } catch (error) {
        console.error("Failed to initialize Gemini:", error);
    }
};

export const sendMessageToGemini = async (message: string): Promise<ChatResponse> => {
    if (!chatSession) {
        initializeChat();
        if (!chatSession) return { text: "Sistem se povezuje... Molim sačekajte." };
    }

    try {
        // 1. Load User Memory
        const profile = getUserProfile();
        
        // 2. Format Recent Activity for Context
        const recentActivity = profile.activityLog
            .slice(0, 5) // Last 5 actions
            .map(log => `- ${log.type}: ${log.detail} (${log.duration ? log.duration + 's' : ''})`)
            .join('\n');

        // 3. Inject Context
        const now = new Date().toLocaleString('sr-RS', { timeZone: 'Europe/Belgrade' });
        const contextMessage = `
[SYSTEM INFO]
Trenutno vreme: ${now}
Lokacija: U VOZILU City Taxija, Novi Sad.
[KNOWN USER PROFILE]: ${JSON.stringify({ ...profile, activityLog: undefined })} (Log below)
[RECENT APP ACTIVITY]:
${recentActivity || "No recent activity recorded."}
[/SYSTEM INFO]

User Query: ${message}`;

        // 4. Send to AI
        const response = await chatSession!.sendMessage({ message: contextMessage });
        const fullText = response.text || "Primio sam poruku, ali trenutno ne mogu da odgovorim.";

        // 5. Extract & Process Hidden Analysis
        let displayText = fullText;
        const analysisMatch = fullText.match(/<ANALYSIS>(.*?)<\/ANALYSIS>/s);
        
        if (analysisMatch) {
            try {
                const analysisJson = JSON.parse(analysisMatch[1]);
                
                // Update Profile Logic
                const newProfile = getUserProfile(); // Re-fetch to get latest
                let updated = false;

                if (analysisJson.new_interests && Array.isArray(analysisJson.new_interests)) {
                    analysisJson.new_interests.forEach((i: string) => {
                        if (!newProfile.interests.includes(i)) {
                            newProfile.interests.push(i);
                            updated = true;
                        }
                    });
                }
                if (analysisJson.new_habits && Array.isArray(analysisJson.new_habits)) {
                    analysisJson.new_habits.forEach((h: string) => {
                        if (!newProfile.habits.includes(h)) {
                            newProfile.habits.push(h);
                            updated = true;
                        }
                    });
                }
                if (analysisJson.trip_context) {
                    newProfile.tripHistory.push(analysisJson.trip_context);
                    if (newProfile.tripHistory.length > 5) newProfile.tripHistory.shift(); 
                    updated = true;
                }
                
                newProfile.lastTopic = message;

                if (updated) {
                    saveUserProfile(newProfile);
                    console.log("AI LEARNED NEW INFO:", newProfile);
                }

                // Remove analysis tag from display text
                displayText = fullText.replace(analysisMatch[0], '').trim();
            } catch (e) {
                console.warn("Failed to parse AI analysis:", e);
                displayText = fullText.replace(/<ANALYSIS>.*?<\/ANALYSIS>/s, '').trim();
            }
        }

        // 6. Extract Sources
        const sources: { title: string; uri: string }[] = [];
        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            response.candidates[0].groundingMetadata.groundingChunks.forEach(chunk => {
                if (chunk.web) {
                    sources.push({ 
                        title: chunk.web.title || 'Izvor', 
                        uri: chunk.web.uri || '#' 
                    });
                }
            });
        }

        return {
            text: displayText,
            sources: sources.length > 0 ? sources : undefined
        };

    } catch (error) {
        console.error("Gemini API Error:", error);
        return { text: "Veza je prekinuta. Molim Vas pokušajte ponovo." };
    }
};