import type { Snapshot } from './types';

/**
 * Seed content — every fact here comes directly from Drashya Vegda's provided
 * profile brief. Nothing (awards, stats, URLs, technologies, results) is invented.
 * Missing information is represented as null / empty and surfaced in the UI as an
 * honest "pending" state. Everything is editable from /admin.
 */
export const SEED: Snapshot = {
  profile: {
    name: 'Drashya Vegda',
    title: 'IT Engineering Student | Aspiring AI & Software Developer',
    intro:
      "I'm Drashya Vegda, an aspiring Software Developer and IT Engineering student who loves building innovative solutions using software development and AI.",
    email: 'drashyavegda1969@gmail.com',
    location: 'Ahmedabad, Gujarat, India',
    avatar: '/images/avatar.png',
    socials: {
      github: 'https://github.com/drashyavegda',
      linkedin: 'https://www.linkedin.com/in/drashya-vegda-6a2a07434/',
      vercel: 'https://vercel.com/drashyavegda',
    },
    languages: ['English', 'Hindi', 'Gujarati'],
    interests: [
      'Artificial Intelligence and emerging technologies',
      'Problem-solving and competitive programming',
      'Hackathons and innovation',
      'Gaming and technology',
      'Learning new skills and exploring ideas',
    ],
    qualities: ['Quick learner', 'Problem solver', 'Innovative thinker'],
    careerGoals: [
      'Become a skilled Software Engineer',
      'Explore and build AI-powered applications',
      'Work with leading technology companies',
      'Build useful real-world software products',
      'Eventually create innovative products and startups',
    ],
    journey:
      'Started learning programming during the first year of college and continues developing skills through practical projects, coding practice, DSA and hackathons.',
    typingRoles: [
      'Aspiring Software Developer',
      'IT Engineering Student',
      'AI Enthusiast',
      'Problem Solver',
    ],
    tagline: 'Building the future, one line of code at a time.',
  },

  availability: { status: 'hidden', visible: false },

  education: {
    college: 'L.D. College of Engineering, Ahmedabad',
    degree: 'Bachelor of Engineering (B.E.)',
    branch: 'Information Technology',
    admissionYear: 2025,
    graduationYear: 2029,
    currentYear: 'Second Year',
    currentSemester: 'Third Semester',
    timeline: [
      {
        id: 'tl-1',
        year: '2025',
        title: 'Joined L.D. College of Engineering',
        description:
          'Started B.E. in Information Technology at L.D. College of Engineering, Ahmedabad.',
      },
      {
        id: 'tl-2',
        year: '2025 – 2029',
        title: 'B.E. in Information Technology',
        description: 'Expected degree duration — Bachelor of Engineering, Information Technology branch.',
      },
      {
        id: 'tl-3',
        year: 'Currently',
        title: 'Second Year, Third Semester',
        description:
          'Continuing coursework while building projects, practicing DSA and taking part in hackathons.',
      },
    ],
    achievements: [],
    coursework: [],
  },

  skills: [
    { id: 'sk-c', name: 'C', category: 'Programming Languages', description: 'Practiced through college coursework and coding practice.', learning: false },
    { id: 'sk-cpp', name: 'C++', category: 'Programming Languages', description: 'Used for coursework and competitive problem solving.', learning: false },
    { id: 'sk-java', name: 'Java', category: 'Programming Languages', description: 'Learned core language fundamentals through coursework and practice.', learning: false },
    { id: 'sk-html', name: 'HTML', category: 'Web Development', description: 'Builds structured, semantic web pages.', learning: false },
    { id: 'sk-css', name: 'CSS', category: 'Web Development', description: 'Styles responsive layouts and modern UI.', learning: false },
    { id: 'sk-git', name: 'Git', category: 'Development Tools', description: 'Version control for personal and hackathon projects.', learning: false },
    { id: 'sk-github', name: 'GitHub', category: 'Development Tools', description: 'Hosts and shares code repositories.', learning: false },
    { id: 'sk-vscode', name: 'Visual Studio Code', category: 'Development Tools', description: 'Primary code editor.', learning: false },
    { id: 'sk-vercel', name: 'Vercel', category: 'Development Tools', description: 'Deploys and hosts web projects.', learning: false },
    { id: 'sk-dsa', name: 'Data Structures and Algorithms', category: 'Currently Learning', description: 'Actively learning and practicing DSA.', learning: true },
    { id: 'sk-sql', name: 'SQL', category: 'Currently Learning', description: 'Currently learning databases and SQL queries.', learning: true },
    { id: 'sk-ai', name: 'Artificial Intelligence', category: 'Areas of Interest', description: 'Focus area for learning and AI-powered projects.', learning: false },
    { id: 'sk-swe', name: 'Software Development', category: 'Areas of Interest', description: 'Building practical, real-world software products.', learning: false },
    { id: 'sk-ps', name: 'Problem Solving', category: 'Areas of Interest', description: 'Competitive programming and logical problem solving.', learning: false },
  ],

  projects: [
    {
      id: 'pj-wasteflow',
      slug: 'wasteflow-ai',
      title: 'WasteFlow AI – AI-Powered Waste Management & Sustainability Platform',
      category: 'AI / Sustainability',
      description:
        'A sustainability-focused platform that uses AI to help users identify waste, understand recycling possibilities and encourage responsible waste management. It also focuses on water conservation, energy efficiency and carbon-footprint awareness.',
      featured: true,
      order: 1,
      highlights: [
        'AI-powered waste classification',
        'Recycling guidance',
        'Waste management assistance',
        'Sustainability awareness',
        'Water and energy conservation',
        'Carbon-footprint awareness',
      ],
      technologies: [],
      demoUrl: null,
      githubUrl: null,
      screenshots: [],
      caseStudy: { problem: '', solution: '', process: '', challenges: '', results: '' },
      seoTitle: 'WasteFlow AI — AI-Powered Waste Management & Sustainability Platform',
      seoDescription:
        'WasteFlow AI uses AI to help users identify waste, understand recycling possibilities and build sustainability awareness.',
    },
    {
      id: 'pj-fintrack',
      slug: 'fintrack',
      title: 'FinTrack – Smart Personal Finance Management Platform',
      category: 'Finance / AI',
      description:
        'A finance-focused platform designed to help users manage their finances, track expenses, understand spending habits and make better financial decisions. It also includes an AI-powered financial support chat.',
      featured: true,
      order: 2,
      highlights: [
        'Financial management',
        'Expense tracking',
        'Spending awareness',
        'AI-powered financial support chat',
      ],
      technologies: [],
      demoUrl: null,
      githubUrl: null,
      screenshots: [],
      caseStudy: { problem: '', solution: '', process: '', challenges: '', results: '' },
      seoTitle: 'FinTrack — Smart Personal Finance Management Platform',
      seoDescription:
        'FinTrack helps users manage finances, track expenses, understand spending habits and chat with an AI financial assistant.',
    },
    {
      id: 'pj-medinav',
      slug: 'medinav-ai',
      title: 'MediNav AI – AI-Powered Health Navigation Platform',
      category: 'Artificial Intelligence / Healthcare',
      description:
        'An AI-powered platform designed to help users understand health-related information, explore healthcare guidance and navigate healthcare resources more easily.',
      featured: true,
      order: 3,
      highlights: [],
      technologies: [],
      demoUrl: null,
      githubUrl: null,
      screenshots: [],
      caseStudy: { problem: '', solution: '', process: '', challenges: '', results: '' },
      seoTitle: 'MediNav AI — AI-Powered Health Navigation Platform',
      seoDescription:
        'MediNav AI helps users understand health information and navigate healthcare resources more easily.',
    },
    {
      id: 'pj-quietplace',
      slug: 'the-quiet-place',
      title: 'The Quiet Place',
      category: 'Web Development / Productivity',
      description:
        'A workplace discovery platform designed to help users find suitable places to work or study based on their preferences.',
      featured: false,
      order: 4,
      highlights: [],
      technologies: [],
      demoUrl: null,
      githubUrl: null,
      screenshots: [],
      caseStudy: { problem: '', solution: '', process: '', challenges: '', results: '' },
      seoTitle: 'The Quiet Place — Workplace Discovery Platform',
      seoDescription:
        'A workplace discovery platform that helps users find suitable places to work or study based on their preferences.',
    },
    {
      id: 'pj-learnwise',
      slug: 'learnwise-ai',
      title: 'LearnWise AI',
      category: 'AI / Education',
      description:
        'An AI-focused learning platform designed to explore smarter and more accessible learning experiences.',
      featured: false,
      order: 5,
      highlights: [],
      technologies: [],
      demoUrl: null,
      githubUrl: null,
      screenshots: [],
      caseStudy: { problem: '', solution: '', process: '', challenges: '', results: '' },
      seoTitle: 'LearnWise AI — Smarter Learning Platform',
      seoDescription:
        'An AI-focused learning platform designed to explore smarter and more accessible learning experiences.',
    },
  ],

  hackathons: [
    { id: 'hk-1', name: 'Agentic AI', date: null, project: null, technologies: [], status: 'participated', certificateFile: null, certificateLink: null, notes: '' },
    { id: 'hk-2', name: "College.dev – Solve India's Garbage Problem", date: null, project: null, technologies: [], status: 'participated', certificateFile: null, certificateLink: null, notes: '' },
    { id: 'hk-3', name: 'Narayana National', date: null, project: null, technologies: [], status: 'participated', certificateFile: null, certificateLink: null, notes: '' },
    { id: 'hk-4', name: 'Code Variant', date: null, project: null, technologies: [], status: 'participated', certificateFile: null, certificateLink: null, notes: '' },
    { id: 'hk-5', name: 'Social Impact', date: null, project: null, technologies: [], status: 'participated', certificateFile: null, certificateLink: null, notes: '' },
  ],

  certificates: [
    { id: 'ct-1', title: 'Agentic AI — Participation Certificate', org: '', date: null, file: null, kind: 'image' },
    { id: 'ct-2', title: "College.dev – Solve India's Garbage Problem — Participation Certificate", org: '', date: null, file: null, kind: 'image' },
    { id: 'ct-3', title: 'Narayana National — Participation Certificate', org: '', date: null, file: null, kind: 'image' },
    { id: 'ct-4', title: 'Code Variant — Participation Certificate', org: '', date: null, file: null, kind: 'image' },
    { id: 'ct-5', title: 'Social Impact — Participation Certificate', org: '', date: null, file: null, kind: 'image' },
  ],

  learning: [
    { id: 'lt-1', title: 'C Programming', note: 'Learning topic — not a completed certification.' },
    { id: 'lt-2', title: 'C++ Programming', note: 'Learning topic — not a completed certification.' },
    { id: 'lt-3', title: 'Java Programming', note: 'Learning topic — not a completed certification.' },
    { id: 'lt-4', title: 'Web Development', note: 'Learning topic — not a completed certification.' },
    { id: 'lt-5', title: 'Data Structures and Algorithms', note: 'Learning topic — not a completed certification.' },
    { id: 'lt-6', title: 'SQL', note: 'Learning topic — not a completed certification.' },
    { id: 'lt-7', title: 'Artificial Intelligence', note: 'Learning topic — not a completed certification.' },
  ],

  posts: [
    {
      id: 'post-journey-en',
      slug: 'my-programming-journey',
      title: 'My Programming Journey So Far',
      excerpt:
        'From writing my first line of code in the first year of college to building AI-powered platforms and taking part in hackathons — a quick look at my journey.',
      content: `## Where it started

I started learning programming during my first year of college, after joining the **B.E. Information Technology** program at **L.D. College of Engineering, Ahmedabad** in 2025.

## What I've been working on

Since then I've been building my skills through:

- Practical projects like **WasteFlow AI**, **FinTrack** and **MediNav AI**
- Coding practice and **Data Structures & Algorithms**
- Hackathons — I've taken part in more than 10 hackathons and coding competitions, including *Agentic AI*, *College.dev – Solve India's Garbage Problem*, *Narayana National*, *Code Variant* and *Social Impact*

## Languages and tools

I currently work with **C**, **C++** and **Java**, build for the web with **HTML** and **CSS**, and use **Git**, **GitHub**, **VS Code** and **Vercel** in my day-to-day workflow. **DSA** and **SQL** are what I'm actively learning right now.

## What's next

My goal is to become a skilled software engineer, explore AI-powered applications, and eventually build useful real-world products. This blog will document what I learn along the way.

> *This is a starter post — Drashya can edit or replace it anytime from the Admin Dashboard.*`,
      coverImage: null,
      category: 'Programming',
      language: 'en',
      publishedAt: '2025-11-03',
      status: 'published',
      seoTitle: '',
      seoDescription: '',
    },
    {
      id: 'post-journey-hi',
      slug: 'mera-programming-safar',
      title: 'मेरी प्रोग्रामिंग यात्रा',
      excerpt:
        'कॉलेज के पहले वर्ष में पहली लाइन ऑफ कोड लिखने से लेकर AI-आधारित प्रोजेक्ट बनाने और हैकाथॉन में भाग लेने तक — मेरी यात्रा एक नज़र में।',
      content: `## शुरुआत

मैंने 2025 में **एल.डी. इंजीनियरिंग कॉलेज, अहमदाबाद** में **इन्फॉर्मेशन टेक्नोलॉजी** की पढ़ाई शुरू की और पहले वर्ष में ही प्रोग्रामिंग सीखना शुरू किया।

## अब तक क्या किया

- **WasteFlow AI**, **FinTrack** और **MediNav AI** जैसे व्यावहारिक प्रोजेक्ट
- कोडिंग प्रैक्टिस और **डेटा स्ट्रक्चर व अल्गोरिदम (DSA)**
- 10 से अधिक हैकाथॉन और कोडिंग प्रतियोगिताओं में भाग लिया — जिनमें *Agentic AI*, *College.dev*, *Narayana National*, *Code Variant* और *Social Impact* शामिल हैं

## भाषाएँ और टूल्स

मैं **C**, **C++** और **Java** पर काम करता हूँ, वेब के लिए **HTML** और **CSS** का उपयोग करता हूँ, और **Git**, **GitHub**, **VS Code** व **Vercel** मेरे मुख्य टूल्स हैं। वर्तमान में **DSA** और **SQL** सीख रहा हूँ।

> *यह एक स्टार्टर पोस्ट है — एडमिन डैशबोर्ड से इसे कभी भी संपादित या बदला जा सकता है।*`,
      coverImage: null,
      category: 'Programming',
      language: 'hi',
      publishedAt: '2025-11-03',
      status: 'published',
      seoTitle: '',
      seoDescription: '',
    },
    {
      id: 'post-journey-gu',
      slug: 'mari-programming-yatra',
      title: 'મારી પ્રોગ્રામિંગ યાત્રા',
      excerpt:
        'કૉલેજના પહેલા વર્ષમાં કોડની પહેલી લાઈન લખવાથી લઈને AI-આધારિત પ્રોજેક્ટ બનાવવા અને હેકાથોનમાં ભાગ લેવા સુધી — મારી યાત્રા એક નજરમાં.',
      content: `## શરૂઆત

મેં 2025માં **એલ.ડી. એન્જિનિયરિંગ કૉલેજ, અમદાવાદ**માં **ઇન્ફોર્મેશન ટેક્નોલોજી**નો અભ્યાસ શરૂ કર્યો અને પહેલા વર્ષમાં જ પ્રોગ્રામિંગ શીખવાની શરૂઆત કરી.

## અત્યાર સુધી શું કર્યું

- **WasteFlow AI**, **FinTrack** અને **MediNav AI** જેવા વ્યવહારુ પ્રોજેક્ટ
- કોડિંગ પ્રેક્ટિસ અને **ડેટા સ્ટ્રક્ચર અને અલ્ગોરિધમ (DSA)**
- 10થી વધુ હેકાથોન અને કોડિંગ સ્પર્ધાઓમાં ભાગ લીધો — જેમાં *Agentic AI*, *College.dev*, *Narayana National*, *Code Variant* અને *Social Impact*નો સમાવેશ થાય છે

## ભાષાઓ અને ટૂલ્સ

હું **C**, **C++** અને **Java** પર કામ કરું છું, વેબ માટે **HTML** અને **CSS** વાપરું છું, અને **Git**, **GitHub**, **VS Code** તથા **Vercel** મારાં મુખ્ય સાધનો છે. હાલ **DSA** અને **SQL** શીખી રહ્યો છું.

> *આ એક સ્ટાર્ટર પોસ્ટ છે — એડમિન ડેશબોર્ડથી ક્યારે પણ એડિટ કે બદલી શકાય છે.*`,
      coverImage: null,
      category: 'Programming',
      language: 'gu',
      publishedAt: '2025-11-03',
      status: 'published',
      seoTitle: '',
      seoDescription: '',
    },
  ],

  testimonials: [],

  resume: { file: null, uploadedAt: null },

  settings: {
    seoTitle: 'Drashya Vegda — IT Engineering Student | Aspiring AI & Software Developer',
    seoDescription:
      "Portfolio of Drashya Vegda, an aspiring Software Developer and IT Engineering student at L.D. College of Engineering, Ahmedabad — building innovative solutions with software development and AI.",
    seoKeywords:
      'Drashya Vegda, software developer portfolio, IT engineering student, AI developer, Ahmedabad, L.D. College of Engineering, WasteFlow AI, FinTrack, MediNav AI',
    ogImage: '/og.png',
  },

  messages: [],

  updatedAt: new Date().toISOString(),
};
