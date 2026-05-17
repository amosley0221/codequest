const languageNodes = [
  {
    id: "html",
    order: 1,
    title: "HTML",
    realm: "Markup Grove",
    short: "Structure the web",
    description: "Build semantic page structure with headings, sections, images, links, and buttons.",
    color: 0x55d86a,
    accent: "#55d86a",
    unlockXp: 0,
    position: [-5.8, 0, 2.1],
    lessons: [
      {
        id: "html-lesson-tags",
        title: "What HTML Tags Do",
        xp: 50,
        difficulty: "Lesson 1",
        prompt: "Learn how tags mark the purpose of content on a page.",
        body: "HTML is the structure layer of the web. Tags such as h1, p, a, img, and button tell the browser what each piece of content means before CSS makes it look good."
      },
      {
        id: "html-lesson-text",
        title: "Headings and Paragraphs",
        xp: 50,
        difficulty: "Lesson 2",
        prompt: "Use headings and paragraphs to create readable page hierarchy.",
        body: "A strong page starts with one clear h1, then supporting h2 or h3 headings. Paragraphs hold body copy. Screen readers and search engines use that hierarchy to understand the page."
      },
      {
        id: "html-lesson-links-media",
        title: "Links, Images, and Alt Text",
        xp: 50,
        difficulty: "Lesson 3",
        prompt: "Connect pages with links and describe images with useful alt text.",
        body: "Use a elements with href attributes for navigation. Use img elements with alt text so the image still has meaning when it cannot be seen or loaded."
      },
      {
        id: "html-lesson-semantics",
        title: "Semantic Page Sections",
        xp: 50,
        difficulty: "Lesson 4",
        prompt: "Structure pages with header, nav, main, section, article, and footer.",
        body: "Semantic elements make pages easier to scan, maintain, and use with assistive technology. They also make your layout easier to style later with CSS."
      },
      {
        id: "html-lesson-forms",
        title: "Forms and Accessible Labels",
        xp: 50,
        difficulty: "Lesson 5",
        prompt: "Build form controls that people can understand and use.",
        body: "Inputs need labels. Buttons should say what action they perform. A form should group related fields and make the required action obvious."
      }
    ],
    challenges: [
      {
        id: "html-heading-paragraph",
        title: "Create a text intro",
        xp: 80,
        difficulty: "Start",
        prompt: "Add a level-one heading and a paragraph inside the intro section.",
        starter: `<section class="intro">
  <!-- Add your heading and paragraph here -->
</section>`,
        hint: "Use one h1 for the main title and one p for the supporting sentence.",
        checks: [
          { label: "Includes a level-one heading", pattern: /<h1[\s>][\s\S]*<\/h1>/i },
          { label: "Includes a paragraph", pattern: /<p[\s>][\s\S]*<\/p>/i }
        ]
      },
      {
        id: "html-link-image",
        title: "Add a link and image",
        xp: 80,
        difficulty: "Explore",
        prompt: "Add one link with an href and one image with alt text.",
        starter: `<section class="resource">
  <!-- Add your link and image here -->
</section>`,
        hint: "Use <a href=\"...\"> for the link and <img src=\"...\" alt=\"...\"> for the image.",
        checks: [
          { label: "Includes a link", pattern: /<a[^>]+href=["'][^"']+["'][^>]*>[\s\S]*<\/a>/i },
          { label: "Includes an image", pattern: /<img[^>]+src=["'][^"']+["'][^>]*>/i },
          { label: "Image has alt text", pattern: /<img[^>]+alt=["'][^"']+["'][^>]*>/i }
        ]
      },
      {
        id: "html-nav",
        title: "Create a nav shell",
        xp: 80,
        difficulty: "Build",
        prompt: "Create a nav with three links for Home, Lessons, and Profile.",
        starter: `<header>
  <!-- Build your nav here -->
</header>`,
        hint: "A nav element can contain anchor tags. Give each anchor an href.",
        checks: [
          { label: "Uses a nav element", pattern: /<nav[\s>][\s\S]*<\/nav>/i },
          { label: "Has at least three links", test: (source) => (source.match(/<a[\s>][\s\S]*?<\/a>/gi) || []).length >= 3 },
          { label: "Links include href attributes", pattern: /<a[^>]+href=/i }
        ]
      },
      {
        id: "html-semantic-card",
        title: "Build a semantic card",
        xp: 80,
        difficulty: "Structure",
        prompt: "Create an article card with a header, section, and footer.",
        starter: `<article class="quest-card">
  <!-- Build a semantic card here -->
</article>`,
        hint: "Inside article, use header for the title area, section for the content, and footer for the action or metadata.",
        checks: [
          { label: "Uses article", pattern: /<article[\s>][\s\S]*<\/article>/i },
          { label: "Includes a header", pattern: /<header[\s>][\s\S]*<\/header>/i },
          { label: "Includes a section", pattern: /<section[\s>][\s\S]*<\/section>/i },
          { label: "Includes a footer", pattern: /<footer[\s>][\s\S]*<\/footer>/i }
        ]
      },
      {
        id: "html-accessible-form",
        title: "Make a labeled form",
        xp: 80,
        difficulty: "Master",
        prompt: "Build a contact form with two labels, two inputs, and a submit button.",
        starter: `<form class="contact-form">
  <!-- Build your accessible form here -->
</form>`,
        hint: "Each input should have a matching label. Add a button with type=\"submit\".",
        checks: [
          { label: "Uses a form", pattern: /<form[\s>][\s\S]*<\/form>/i },
          { label: "Includes at least two labels", test: (source) => (source.match(/<label[\s>][\s\S]*?<\/label>/gi) || []).length >= 2 },
          { label: "Includes at least two inputs", test: (source) => (source.match(/<input[\s>]/gi) || []).length >= 2 },
          { label: "Includes a submit button", pattern: /<button[^>]+type=["']submit["'][^>]*>[\s\S]*<\/button>/i }
        ]
      }
    ],
    projects: [
      {
        id: "html-project-about",
        title: "About Me Mini Page",
        xp: 80,
        difficulty: "Project 1",
        prompt: "Build a small personal page with a heading, image, paragraph, and link.",
        starter: `<main class="about-page">
  <!-- Build your About Me page here -->
</main>`,
        hint: "Use h1, img with alt text, p, and a link with href.",
        checks: [
          { label: "Uses main", pattern: /<main[\s>][\s\S]*<\/main>/i },
          { label: "Includes h1", pattern: /<h1[\s>][\s\S]*<\/h1>/i },
          { label: "Includes image alt text", pattern: /<img[^>]+alt=["'][^"']+["'][^>]*>/i },
          { label: "Includes a link with href", pattern: /<a[^>]+href=["'][^"']+["'][^>]*>[\s\S]*<\/a>/i }
        ]
      },
      {
        id: "html-project-recipe",
        title: "Recipe Card",
        xp: 80,
        difficulty: "Project 2",
        prompt: "Create a recipe card with ingredients and ordered steps.",
        starter: `<article class="recipe-card">
  <!-- Build your recipe card here -->
</article>`,
        hint: "Use h1 or h2, ul for ingredients, and ol for ordered steps.",
        checks: [
          { label: "Uses article", pattern: /<article[\s>][\s\S]*<\/article>/i },
          { label: "Includes a heading", pattern: /<h[12][\s>][\s\S]*<\/h[12]>/i },
          { label: "Includes an unordered list", pattern: /<ul[\s>][\s\S]*<\/ul>/i },
          { label: "Includes an ordered list", pattern: /<ol[\s>][\s\S]*<\/ol>/i }
        ]
      },
      {
        id: "html-project-portfolio",
        title: "Portfolio Homepage Shell",
        xp: 80,
        difficulty: "Project 3",
        prompt: "Build a portfolio shell with header, nav, main, two sections, and footer.",
        starter: `<!-- Build your portfolio shell here -->`,
        hint: "Use semantic layout: header, nav, main, section, section, footer.",
        checks: [
          { label: "Includes header", pattern: /<header[\s>][\s\S]*<\/header>/i },
          { label: "Includes nav", pattern: /<nav[\s>][\s\S]*<\/nav>/i },
          { label: "Includes main", pattern: /<main[\s>][\s\S]*<\/main>/i },
          { label: "Includes at least two sections", test: (source) => (source.match(/<section[\s>][\s\S]*?<\/section>/gi) || []).length >= 2 },
          { label: "Includes footer", pattern: /<footer[\s>][\s\S]*<\/footer>/i }
        ]
      }
    ],
    quizzes: [
      {
        id: "html-quiz-basics",
        title: "HTML Basics Check",
        xp: 55,
        difficulty: "Quiz 1",
        prompt: "Which element should be used for the main page heading?",
        answer: "h1",
        hint: "The main heading is the highest-level heading.",
        body: "Type the correct tag name without angle brackets."
      },
      {
        id: "html-quiz-accessibility",
        title: "Accessibility Check",
        xp: 55,
        difficulty: "Quiz 2",
        prompt: "Which attribute describes an image for people who cannot see it?",
        answer: "alt",
        hint: "This attribute belongs on img elements.",
        body: "Type the attribute name only."
      }
    ]
  },
  {
    id: "css",
    order: 2,
    title: "CSS",
    realm: "Cascade Falls",
    short: "Style and layout",
    description: "Control spacing, color, responsive layouts, and visual hierarchy.",
    color: 0x36a4ff,
    accent: "#36a4ff",
    unlockXp: 1000,
    position: [-1.9, 0, 2.7],
    lessons: [
      "Use layout properties before decorative polish.",
      "Flexbox is strong for one-dimensional alignment.",
      "Responsive CSS should adapt the layout, not just shrink everything."
    ],
    challenges: [
      {
        id: "css-responsive-nav",
        title: "Responsive nav",
        xp: 25,
        difficulty: "Layout",
        prompt: "Style .nav as a flexible row and add a mobile media query.",
        starter: `.nav {
  /* Make this a horizontal layout */
}

.nav a {
  color: white;
}`,
        hint: "Set display: flex on .nav, add gap, and use @media for small screens.",
        checks: [
          { label: "Uses flex layout", pattern: /\.nav\s*{[\s\S]*display\s*:\s*flex/i },
          { label: "Adds spacing with gap", pattern: /gap\s*:/i },
          { label: "Includes a media query", pattern: /@media\s*\(/i }
        ]
      },
      {
        id: "css-card-focus",
        title: "Focus state polish",
        xp: 20,
        difficulty: "Access",
        prompt: "Add a visible keyboard focus style for .quest-button.",
        starter: `.quest-button {
  background: #1a7f37;
  color: white;
}`,
        hint: "Target :focus-visible and add an outline or box-shadow.",
        checks: [
          { label: "Uses focus-visible", pattern: /:focus-visible/i },
          { label: "Adds an outline or shadow", pattern: /(outline|box-shadow)\s*:/i }
        ]
      }
    ]
  },
  {
    id: "javascript",
    order: 3,
    title: "JavaScript",
    realm: "Script Citadel",
    short: "Add interactivity",
    description: "React to user input, update the page, and coordinate app behavior.",
    color: 0xffc233,
    accent: "#ffc233",
    unlockXp: 2000,
    position: [2.4, 0, 2.0],
    lessons: [
      "Use querySelector to find an element before changing it.",
      "Events are messages from the browser about user actions.",
      "Keep repeated behavior inside named functions."
    ],
    challenges: [
      {
        id: "js-magic-button",
        title: "Magic button",
        xp: 30,
        difficulty: "Logic",
        prompt: "Make the button turn blue when clicked.",
        starter: `const button = document.querySelector("#magic-button");

function activateMagic() {
  // Change the button color here
}

button.addEventListener("click", activateMagic);`,
        hint: "Inside activateMagic, set button.style.backgroundColor to blue.",
        checks: [
          { label: "Selects the button", pattern: /querySelector\s*\(\s*["']#magic-button["']\s*\)/i },
          { label: "Listens for click", pattern: /addEventListener\s*\(\s*["']click["']/i },
          { label: "Changes the background color to blue", pattern: /(backgroundColor|background)\s*=\s*["']blue["']/i }
        ]
      },
      {
        id: "js-score-loop",
        title: "Total XP",
        xp: 35,
        difficulty: "Data",
        prompt: "Loop through challenge scores and return their total.",
        starter: `function totalXp(scores) {
  let total = 0;
  // Add every score to total
  return total;
}`,
        hint: "Use for...of, forEach, or reduce to add every score.",
        checks: [
          { label: "Defines totalXp", pattern: /function\s+totalXp\s*\(/i },
          { label: "Loops over scores", pattern: /(for\s*\(|for\s*\(|forEach|reduce)/i },
          { label: "Returns total", pattern: /return\s+total/i }
        ]
      }
    ]
  },
  {
    id: "python",
    order: 4,
    title: "Python",
    realm: "Python Peaks",
    short: "Think in functions",
    description: "Write readable functions, conditionals, loops, and data transformations.",
    color: 0x7b65ff,
    accent: "#8a78ff",
    unlockXp: 3000,
    position: [-3.5, 0, -1.6],
    lessons: [
      "Python rewards clear names and direct control flow.",
      "Indentation defines the block structure.",
      "Return values make functions reusable."
    ],
    challenges: [
      {
        id: "py-xp-bonus",
        title: "Award bonus XP",
        xp: 35,
        difficulty: "Function",
        prompt: "Return base XP plus a 10 point bonus when streak is at least 3.",
        starter: `def award_xp(base_xp, streak):
    # Return base_xp plus a bonus for active learners
    pass`,
        hint: "Use if streak >= 3, then return base_xp + 10. Otherwise return base_xp.",
        checks: [
          { label: "Defines award_xp", pattern: /def\s+award_xp\s*\(\s*base_xp\s*,\s*streak\s*\)\s*:/i },
          { label: "Checks streak", pattern: /if\s+streak\s*>=\s*3\s*:/i },
          { label: "Returns a bonus", pattern: /return\s+base_xp\s*\+\s*10/i }
        ]
      }
    ]
  },
  {
    id: "sql",
    order: 5,
    title: "SQL",
    realm: "Data District",
    short: "Ask good questions",
    description: "Query, filter, sort, and combine data from tables.",
    color: 0x2dd4bf,
    accent: "#2dd4bf",
    unlockXp: 4000,
    position: [0.2, 0, -2.4],
    lessons: [
      "SELECT chooses columns, FROM chooses the table.",
      "WHERE narrows rows before you sort or limit results.",
      "ORDER BY makes query output easier to inspect."
    ],
    challenges: [
      {
        id: "sql-top-learners",
        title: "Top learners",
        xp: 35,
        difficulty: "Query",
        prompt: "Select name and xp from learners with streak at least 3, sorted by xp descending.",
        starter: `-- learners: id, name, xp, streak
SELECT
  -- columns here
FROM learners;`,
        hint: "Use WHERE streak >= 3 and ORDER BY xp DESC.",
        checks: [
          { label: "Selects name and xp", pattern: /select[\s\S]*name[\s\S]*xp/i },
          { label: "Reads from learners", pattern: /from\s+learners/i },
          { label: "Filters by streak", pattern: /where[\s\S]*streak\s*>=\s*3/i },
          { label: "Sorts by XP descending", pattern: /order\s+by\s+xp\s+desc/i }
        ]
      }
    ]
  },
  {
    id: "react",
    order: 6,
    title: "React",
    realm: "Component Forge",
    short: "Build stateful UI",
    description: "Compose components and update interface state from user actions.",
    color: 0xff5da2,
    accent: "#ff75b2",
    unlockXp: 5000,
    position: [4.3, 0, -1.6],
    lessons: [
      "Components should receive data through props and own only the state they need.",
      "useState stores values that should trigger a re-render.",
      "Event handlers update state in response to user action."
    ],
    challenges: [
      {
        id: "react-counter",
        title: "Quest counter",
        xp: 45,
        difficulty: "State",
        prompt: "Create a counter button that increases when clicked.",
        starter: `function QuestCounter() {
  // Add state here
  return (
    <button>
      Quests: 0
    </button>
  );
}`,
        hint: "Use useState(0), then onClick to call setCount(count + 1).",
        checks: [
          { label: "Uses useState", pattern: /useState\s*\(\s*0\s*\)/i },
          { label: "Adds an onClick handler", pattern: /onClick\s*=/i },
          { label: "Updates the count", pattern: /set[A-Za-z0-9_]*\s*\([^)]*\+\s*1\s*\)/i }
        ]
      }
    ]
  }
];

function getNode(nodeId) {
  return languageNodes.find((node) => node.id === nodeId) || languageNodes[0];
}

function getChallenge(challengeId) {
  for (const node of languageNodes) {
    const challenge = node.challenges.find((item) => item.id === challengeId);
    if (challenge) {
      return { node, challenge };
    }
  }
  return { node: languageNodes[0], challenge: languageNodes[0].challenges[0] };
}

function getActivities(node, kind) {
  const items = node?.[kind];
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => {
    if (typeof item === "string") {
      return {
        id: `${node.id}-${kind}-${index + 1}`,
        title: `${node.title} ${kind.slice(0, -1)} ${index + 1}`,
        xp: 0,
        difficulty: `${index + 1}`,
        prompt: item,
        body: item
      };
    }
    return item;
  });
}

function getActivity(nodeId, kind, activityId) {
  const node = getNode(nodeId);
  const activities = getActivities(node, kind);
  return {
    node,
    activity: activities.find((item) => item.id === activityId) || activities[0] || null
  };
}

function evaluateChallenge(challenge, source) {
  const missing = challenge.checks.filter((check) => {
    if (typeof check.test === "function") {
      return !check.test(source);
    }
    return !check.pattern.test(source);
  });

  return {
    passed: missing.length === 0,
    missing: missing.map((check) => check.label)
  };
}

window.CodeQuestData = {
  evaluateChallenge,
  getActivities,
  getActivity,
  getChallenge,
  getNode,
  languageNodes
};
