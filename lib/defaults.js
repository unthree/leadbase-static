// Seed data mirroring the original Personal OS layout.
// Everything here is editable in the UI; it persists to data/*.json.

export const DEFAULTS = {
  tasks: {
    lanes: [
      { id: "personalos", name: "PersonalOS", color: "#3b82f6", status: "", shortGoal: "", longGoal: "" },
      { id: "him", name: "HIM", color: "#a855f7", status: "Preparing for the beta test", shortGoal: "Finish the action generation system and launch the beta", longGoal: "" },
      { id: "youtube", name: "YouTube", color: "#ef4444", status: "", shortGoal: "", longGoal: "" },
      { id: "skoolos", name: "SkoolOS", color: "#f97316", status: "", shortGoal: "", longGoal: "" },
      { id: "skool", name: "Skool", color: "#22c55e", status: "", shortGoal: "", longGoal: "" },
      { id: "fleet", name: "Local Model Fleet", color: "#06b6d4", status: "", shortGoal: "", longGoal: "" }
    ],
    tasks: [
      { id: "t1", title: "Finish the action generation system", lane: "him", done: false, due: null },
      { id: "t2", title: "finish the landing page editor", lane: "him", done: false, due: null }
    ]
  },

  ideas: {
    boards: [
      {
        id: "main",
        name: "Main Channel",
        desc: "Long-form flagship videos",
        ideas: [
          { id: "i1", title: "Kimi K3 BEATS Fable 5", done: false, script: "", description: "" },
          { id: "i2", title: "Fable 5 top secrets", done: false, script: "", description: "" }
        ]
      },
      {
        id: "secondary",
        name: "Secondary Channel",
        desc: "Experiments and lighter uploads",
        ideas: [
          { id: "i3", title: "OpenAI is stealing from Apple", done: false, script: "", description: "" }
        ]
      },
      {
        id: "shorts",
        name: "Shorts",
        desc: "Short-form hooks and concepts",
        ideas: [
          { id: "i4", title: "Top 5 AI tools you need to be mastering right now", done: false, script: "", description: "" },
          { id: "i5", title: "Top AI models you have to be using and what they're best at", done: false, script: "", description: "" }
        ]
      }
    ]
  },

  newsletter: {
    sources: [],
    drafts: [],
    runs: []
  },

  research: {
    history: []
  },

  channels: {
    pool: [
      {
        id: "c1",
        name: "Alex Finn",
        handle: "@AlexFinnOfficial",
        url: "https://www.youtube.com/@AlexFinnOfficial",
        category: "Vibe coding & building with AI",
        subs: "~64K",
        notes: "The original seed channel. Vibe coding for non-technical builders — Claude Code, Codex, building AI apps without writing code."
      },
      {
        id: "c2",
        name: "Riley Brown",
        handle: "@rileybrownai",
        url: "https://www.youtube.com/@rileybrownai",
        category: "Vibe coding & building with AI",
        subs: "~256K",
        notes: "Vibe coding mobile/web apps and agents with Claude Code and Cursor. Cofounded Vibecode ($9M raised)."
      },
      {
        id: "c3",
        name: "IndyDevDan",
        handle: "@indydevdan",
        url: "https://www.youtube.com/@indydevdan",
        category: "Vibe coding & building with AI",
        subs: "~100K",
        notes: "Agentic coding workflows — Claude Code, principled AI coding, multi-agent dev setups. More technical than Finn."
      },
      {
        id: "c4",
        name: "Greg Isenberg",
        handle: "@GregIsenberg",
        url: "https://www.youtube.com/@GregIsenberg",
        category: "Vibe coding & building with AI",
        subs: "~300K",
        notes: "Startup ideas + AI business playbooks; interviews builders shipping with vibe coding and AI agents."
      },
      {
        id: "c5",
        name: "Matt Wolfe",
        handle: "@mreflow",
        url: "https://www.youtube.com/@mreflow",
        category: "AI news & model coverage",
        subs: "~968K",
        notes: "Weekly AI news roundups and tool reviews. Founder of FutureTools.io, host of The Next Wave podcast."
      },
      {
        id: "c6",
        name: "Matthew Berman",
        handle: "@matthew_berman",
        url: "https://www.youtube.com/@matthew_berman",
        category: "AI news & model coverage",
        subs: "~617K",
        notes: "First to test new models when they drop; open-source LLMs, comparisons, CEO interviews. 5-6 videos/week."
      },
      {
        id: "c7",
        name: "Wes Roth",
        handle: "@WesRoth",
        url: "https://www.youtube.com/@WesRoth",
        category: "AI news & model coverage",
        subs: "~321K",
        notes: "AI news analysis and implications; AI agents commentary."
      },
      {
        id: "c8",
        name: "TheAIGRID",
        handle: "@TheAiGrid",
        url: "https://www.youtube.com/@TheAiGrid",
        category: "AI news & model coverage",
        subs: "~300K",
        notes: "Daily coverage of AI research, model releases, and industry developments."
      },
      {
        id: "c9",
        name: "The AI Advantage",
        handle: "@aiadvantage",
        url: "https://www.youtube.com/@aiadvantage",
        category: "AI tool tutorials",
        subs: "~300K",
        notes: "Igor Pogany. Practical AI-tool use — ChatGPT, Midjourney, AI productivity workflows."
      },
      {
        id: "c10",
        name: "Skill Leap AI",
        handle: "@SkillLeapAI",
        url: "https://www.youtube.com/@SkillLeapAI",
        category: "AI tool tutorials",
        subs: "~500K",
        notes: "New AI apps, models, and tools covered as they release; beginner-friendly tutorials."
      },
      {
        id: "c11",
        name: "Futurepedia",
        handle: "@futurepedia",
        url: "https://www.youtube.com/@futurepedia",
        category: "AI tool tutorials",
        subs: "~200K",
        notes: "AI tools for professionals, from the team behind the Futurepedia.io directory."
      },
      {
        id: "c12",
        name: "Nate Herk | AI Automation",
        handle: "@nateherk",
        url: "https://www.youtube.com/@nateherk",
        category: "AI agents & automation",
        subs: "~600K",
        notes: "n8n masterclasses and AI automation workflows; one of the fastest-growing AI channels on YouTube."
      },
      {
        id: "c13",
        name: "Liam Ottley",
        handle: "@LiamOttley",
        url: "https://www.youtube.com/@LiamOttley",
        category: "AI agents & automation",
        subs: "~500K",
        notes: "Coined the AI Automation Agency model; no-code AI business content. Founder of Morningside AI."
      },
      {
        id: "c14",
        name: "Cole Medin",
        handle: "@ColeMedin",
        url: "https://www.youtube.com/@ColeMedin",
        category: "AI agents & automation",
        subs: "~300K",
        notes: "Building AI agents hands-on — RAG, local LLMs, agent frameworks, AI coding workflows."
      },
      {
        id: "c15",
        name: "David Ondrej",
        handle: "@DavidOndrej",
        url: "https://www.youtube.com/@DavidOndrej",
        category: "AI agents & automation",
        subs: "~400K",
        notes: "Building AI agents and startups in public; founder of Vectal."
      },
      {
        id: "c16",
        name: "AI Jason",
        handle: "@AIJasonZ",
        url: "https://www.youtube.com/@AIJasonZ",
        category: "AI agents & automation",
        subs: "~200K",
        notes: "AI engineering deep dives — agent architectures, LLM app patterns, practical builds."
      },
      {
        id: "c17",
        name: "Fireship",
        handle: "@Fireship",
        url: "https://www.youtube.com/@Fireship",
        category: "Dev explainers",
        subs: "~3M",
        notes: "Fast, dense dev/AI explainers — every major model release gets a 'in 100 seconds'-style breakdown."
      },
      {
        id: "c18",
        name: "AI Explained",
        handle: "@aiexplained-official",
        url: "https://www.youtube.com/@aiexplained-official",
        category: "AI research & analysis",
        subs: "~350K",
        notes: "Data-driven deep dives on frontier model releases — benchmarks, reasoning ability, what new releases actually mean."
      },
      {
        id: "c19",
        name: "Two Minute Papers",
        handle: "@TwoMinutePapers",
        url: "https://www.youtube.com/@TwoMinutePapers",
        category: "AI research & analysis",
        subs: "~1.6M",
        notes: "Károly Zsolnai-Fehér distills AI research papers into short, enthusiastic summaries. 'What a time to be alive!'"
      },
      {
        id: "c20",
        name: "bycloud",
        handle: "@bycloudAI",
        url: "https://www.youtube.com/@bycloudAI",
        category: "AI research & analysis",
        subs: "~200K",
        notes: "Curates the latest AI tech and research papers with a meme-literate edge."
      },
      {
        id: "c21",
        name: "David Shapiro",
        handle: "@DaveShap",
        url: "https://www.youtube.com/@DaveShap",
        category: "AI research & analysis",
        subs: "~200K",
        notes: "AGI trajectories, AI safety, automation economics, post-labor theory — lecture-style big-picture takes."
      },
      {
        id: "c22",
        name: "MattVidPro AI",
        handle: "@MattVidPro",
        url: "https://www.youtube.com/@MattVidPro",
        category: "AI video & creative",
        subs: "~300K",
        notes: "AI video generation coverage — every new model (Sora, Runway, LTX…) tested as it drops."
      },
      {
        id: "c23",
        name: "Theoretically Media",
        handle: "@TheoreticallyMedia",
        url: "https://www.youtube.com/@TheoreticallyMedia",
        category: "AI video & creative",
        subs: "~200K",
        notes: "Tim Simmons on AI filmmaking and creative tools — expert breakdowns within ~24h of a release."
      },
      {
        id: "c24",
        name: "Curious Refuge",
        handle: "@curiousrefuge",
        url: "https://www.youtube.com/@curiousrefuge",
        category: "AI video & creative",
        subs: "~100K",
        notes: "The 'home for AI filmmaking' — AI storytelling education tied to a working Hollywood studio."
      },
      {
        id: "c25",
        name: "Sam Witteveen",
        handle: "@samwitteveenai",
        url: "https://www.youtube.com/@samwitteveenai",
        category: "LLM engineering",
        subs: "~125K",
        notes: "Google Developer Expert for ML. Weekly hands-on LLM and autonomous-agent builds; strong on new model APIs."
      },
      {
        id: "c26",
        name: "Prompt Engineering",
        handle: "@engineerprompt",
        url: "https://www.youtube.com/@engineerprompt",
        category: "LLM engineering",
        subs: "~200K",
        notes: "RAG systems, local LLMs, and prompt techniques — practical LLM-app engineering tutorials."
      },
      {
        id: "c27",
        name: "All About AI",
        handle: "@AllAboutAI",
        url: "https://www.youtube.com/@AllAboutAI",
        category: "LLM engineering",
        subs: "~150K",
        notes: "Practical builds with new models and APIs — voice agents, automation scripts, weekend-project energy."
      },
      {
        id: "c28",
        name: "WorldofAI",
        handle: "@intheworldofai",
        url: "https://www.youtube.com/@intheworldofai",
        category: "LLM engineering",
        subs: "~200K",
        notes: "High-frequency roundups of new open-source models, agents, and AI tools."
      },
      {
        id: "c29",
        name: "AICodeKing",
        handle: "@AICodeKing",
        url: "https://www.youtube.com/@AICodeKing",
        category: "LLM engineering",
        subs: "~100K",
        notes: "AI coding tools compared head-to-head — Cursor vs Cline vs Claude Code and every new coding model."
      }
    ]
  },

  sponsors: {
    prospects: []
  }
};

export const STORE_NAMES = Object.keys(DEFAULTS);
