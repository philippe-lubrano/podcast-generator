import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

interface Source {
  title: string;
  url: string;
  date: string;
}

async function parseRSSFeed(url: string): Promise<RSSItem[]> {
  try {
    const response = await fetch(url);
    const xml = await response.text();

    const items: RSSItem[] = [];
    const itemRegex = /<item>(.*?)<\/item>/gs;
    const matches = xml.matchAll(itemRegex);

    for (const match of matches) {
      const itemXml = match[1];
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/s)?.[1] || itemXml.match(/<title>(.*?)<\/title>/s)?.[1] || "";
      const link = itemXml.match(/<link>(.*?)<\/link>/s)?.[1] || "";
      const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/s)?.[1] || itemXml.match(/<description>(.*?)<\/description>/s)?.[1] || "";
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/s)?.[1] || "";

      if (title && link) {
        items.push({ title, link, description, pubDate });
      }
    }

    return items.slice(0, 5);
  } catch (error) {
    console.error(`Error parsing RSS feed ${url}:`, error);
    return [];
  }
}

async function fetchAllFeeds(): Promise<{ articles: RSSItem[], sources: Source[] }> {
  const feeds = [
    { name: "Hacker News", url: "https://hnrss.org/frontpage" },
    { name: "React Status", url: "https://react.statuscode.com/rss" },
    { name: "TypeScript Weekly", url: "https://typescript-weekly.com/feed.xml" },
    { name: "TLDR AI", url: "https://tldr.tech/ai/rss" },
  ];

  const allArticles: RSSItem[] = [];
  const sources: Source[] = [];

  for (const feed of feeds) {
    const items = await parseRSSFeed(feed.url);
    allArticles.push(...items);

    items.forEach(item => {
      sources.push({
        title: item.title,
        url: item.link,
        date: item.pubDate || new Date().toISOString(),
      });
    });
  }

  return { articles: allArticles, sources };
}

async function generateScriptWithGemini(articles: RSSItem[], geminiApiKey: string): Promise<string> {
  const articlesText = articles.map(a => `- ${a.title}: ${a.description.substring(0, 200)}`).join('\n');

  const prompt = `Tu es un animateur de podcast tech passionné et dynamique. Crée un script de podcast de 5-7 minutes en français sur l'actualité tech front-end et IA.

Voici les articles du jour :
${articlesText}

INSTRUCTIONS:
- Crée un script conversationnel et engageant, comme si tu parlais à un ami développeur
- Utilise un ton décontracté mais professionnel, avec de l'énergie et de l'enthousiasme
- Structure: Introduction accrocheuse, 3-4 sujets principaux, conclusion avec une réflexion
- Ajoute des transitions naturelles entre les sujets
- Inclus des anecdotes ou des insights intéressants
- Limite à environ 1000-1200 mots pour 5-7 minutes de lecture
- N'inclus PAS de marqueurs de temps ni d'indications scéniques comme [PAUSE] ou [MUSIQUE]
- Écris uniquement le texte à lire, prêt pour la synthèse vocale

Commence par une intro du style: "Salut à tous et bienvenue sur TechVibe Podcast ! Je suis ravi de vous retrouver pour le briefing tech du jour..."`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2048,
        }
      })
    }
  );

  const data = await response.json();

  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error("Failed to generate script with Gemini");
  }

  return data.candidates[0].content.parts[0].text;
}

async function generateAudioWithGoogleTTS(script: string, googleApiKey: string): Promise<string> {
  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text: script },
        voice: {
          languageCode: "fr-FR",
          name: "fr-FR-Neural2-B",
          ssmlGender: "MALE"
        },
        audioConfig: {
          audioEncoding: "MP3",
          pitch: 0,
          speakingRate: 1.05
        }
      })
    }
  );

  const data = await response.json();

  if (!data.audioContent) {
    throw new Error("Failed to generate audio with Google TTS");
  }

  return data.audioContent;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    const googleApiKey = Deno.env.get("GOOGLE_CLOUD_API_KEY");

    if (!geminiApiKey || !googleApiKey) {
      return new Response(
        JSON.stringify({
          error: "API keys not configured. Please set GEMINI_API_KEY and GOOGLE_CLOUD_API_KEY environment variables."
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: podcast, error: insertError } = await supabase
      .from("podcasts")
      .insert({
        status: "generating",
        title: `TechVibe Briefing - ${new Date().toLocaleDateString('fr-FR')}`
      })
      .select()
      .single();

    if (insertError || !podcast) {
      throw new Error("Failed to create podcast record");
    }

    console.log("Fetching RSS feeds...");
    const { articles, sources } = await fetchAllFeeds();

    if (articles.length === 0) {
      throw new Error("No articles found in RSS feeds");
    }

    console.log(`Found ${articles.length} articles. Generating script...`);
    const script = await generateScriptWithGemini(articles, geminiApiKey);

    console.log("Generating audio...");
    const audioContent = await generateAudioWithGoogleTTS(script, googleApiKey);

    const audioFileName = `podcast_${podcast.id}.mp3`;
    const audioData = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));

    const { error: uploadError } = await supabase.storage
      .from("podcasts")
      .upload(audioFileName, audioData, {
        contentType: "audio/mpeg",
        upsert: true
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Failed to upload audio: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("podcasts")
      .getPublicUrl(audioFileName);

    const { error: updateError } = await supabase
      .from("podcasts")
      .update({
        script,
        audio_url: urlData.publicUrl,
        sources,
        status: "ready",
        duration: Math.floor(script.split(' ').length / 2.5)
      })
      .eq("id", podcast.id);

    if (updateError) {
      throw new Error("Failed to update podcast record");
    }

    return new Response(
      JSON.stringify({
        id: podcast.id,
        audio_url: urlData.publicUrl,
        script,
        sources,
        status: "ready"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
