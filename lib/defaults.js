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

  sponsors: {
    prospects: []
  }
};

export const STORE_NAMES = Object.keys(DEFAULTS);
