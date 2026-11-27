export interface ProjectItem {
  id: string;
  name: string;
  category: string;
  year: string;
  desc: string;
  architecture: string;
  highlights: string[];
  tags: string[];
  repoPath: string;
  previewImage: string;
  previewAlt: string;
}

export interface TechItem {
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'Core';
  summary: string;
}

export interface BioGalleryPhoto {
  id: string;
  src: string;
  alt: string;
  caption: string;
}

export interface BioPillar {
  number: string;
  title: string;
  description: string;
}

export const PORTFOLIO_DATA = {
  identity: {
    fullName: 'Muhammad Fazle Ferino',
    shortName: 'Fazle',
    tagline: 'Securing Digital Infrastructure & Crafting Interactive Web Experiences',
    roles: [
      'Cybersecurity Engineering Student',
      'Full-Stack Web Developer',
      'UI/UX Enthusiast',
    ],
    institution: 'Politeknik Artificial Intelligence Budi Mulia Dua (PLAI BMD)',
    scholarship: 'Beasiswa AInovation',
    location: 'Sleman, DI Yogyakarta',
    github: 'https://github.com/fazle-star',
    email: 'm.fazle2006@gmail.com',
    portraitCutout: '/src/assets/images/fazle-portrait-nobg.png',
  },
  about: {
    id: 'about',
    number: '01',
    title: 'About & Tech Stack',
    bio: 'First-semester Cybersecurity Engineering student at Politeknik Artificial Intelligence Budi Mulia Dua (PLAI BMD) in Sleman, Yogyakarta, and full-stack developer building resilient web applications and intuitive user interfaces.',
    techStack: [
      { name: 'HTML5', category: 'Core', summary: 'Semantic document architecture and accessible markup.' },
      { name: 'CSS3', category: 'Core', summary: '3D transforms, clip-path masking, and responsive layout systems.' },
      { name: 'JavaScript', category: 'Core', summary: 'Event-driven DOM mechanics and animation controllers.' },
      { name: 'TypeScript', category: 'Frontend', summary: 'Strict type safety across full-stack schemas and UI state.' },
      { name: 'React', category: 'Frontend', summary: 'Component-driven interfaces with predictable state hooks.' },
      { name: 'Next.js', category: 'Frontend', summary: 'Server-rendered routes and optimized web delivery.' },
      { name: 'Node.js', category: 'Backend', summary: 'REST API services, authentication, and runtime tooling.' },
      { name: 'Python', category: 'Backend', summary: 'Security scripting, sandboxed execution, and automation.' },
      { name: 'PostgreSQL', category: 'Database', summary: 'Relational data modeling with strict transactional integrity.' },
      { name: 'MySQL', category: 'Database', summary: 'Structured query optimization and normalized schemas.' },
    ] as TechItem[],
  },
  whoIsFazle: {
    id: 'who-is-fazle',
    number: '02',
    title: 'Who Is Fazle?',
    headline: 'Builder at heart, security engineer in training.',
    narrative:
      'Muhammad Fazle Ferino is a Cybersecurity Engineering student at Politeknik AI Budi Mulia Dua (PLAI BMD) Yogyakarta and a recipient of the Beasiswa AInovation scholarship. Blending full-stack web engineering with offensive and defensive security discipline, he designs digital products that feel refined on the surface and stay resilient underneath.',
    biodata: [
      { label: 'Full Name', value: 'Muhammad Fazle Ferino' },
      { label: 'Domicile', value: 'Sleman, DI Yogyakarta' },
      { label: 'Education', value: 'PLAI BMD · Beasiswa AInovation' },
      { label: 'Core Focus', value: 'Cybersecurity, Full-Stack & UI/UX' },
    ],
    pillars: [
      {
        number: '01',
        title: 'The Builder',
        description:
          'Architecting end-to-end web platforms with React, TypeScript, Next.js, Node.js, and PostgreSQL—translating messy workflows into calm, high-speed interfaces.',
      },
      {
        number: '02',
        title: 'The Defender',
        description:
          'Training in web exploitation, CTF problem solving, Linux hardening, and secure coding principles as a Cybersecurity Engineering scholar at PLAI BMD.',
      },
      {
        number: '03',
        title: 'Beyond the Screen',
        description:
          'Driven by curiosity for editorial UI craft, tactile 3D web choreography, and sharing practical tooling with Yogyakarta’s growing developer community.',
      },
    ] as BioPillar[],
    gallery: [
      {
        id: 'workspace',
        src: '/src/assets/images/fazle_coding_workspace_1795711554705.jpg',
        alt: 'Muhammad Fazle Ferino coding full-stack architecture at an evening studio desk',
        caption: 'Late-night full-stack architecture in Sleman',
      },
      {
        id: 'campus',
        src: '/src/assets/images/fazle_campus_plai_1795711554306.jpg',
        alt: 'Politeknik AI Budi Mulia Dua campus atmosphere in Yogyakarta at golden hour',
        caption: 'PLAI BMD campus · Beasiswa AInovation',
      },
      {
        id: 'security-lab',
        src: '/src/assets/images/fazle_ctf_security_1795711555327.jpg',
        alt: 'Cybersecurity lab workstation displaying Linux terminal and packet inspection telemetry',
        caption: 'Packet inspection & CTF lab sessions',
      },
      {
        id: 'yogyakarta',
        src: '/src/assets/images/fazle_yogyakarta_portrait_1795711554839.jpg',
        alt: 'Student walking through modern architectural campus walkway in Yogyakarta at dusk',
        caption: 'Building across Sleman & Yogyakarta',
      },
    ] as BioGalleryPhoto[],
  },
  projects: {
    id: 'projects',
    number: '03',
    title: 'Featured Projects',
    items: [
      {
        id: 'sipandu',
        name: 'SIPANDU',
        category: 'Healthcare Systems',
        year: '2026',
        desc: 'Sistem Informasi Posyandu healthcare monitoring web app with maternal, infant, and elderly tracking.',
        architecture: 'Modular React frontend engineered for community health cadres, featuring structured patient cohort tracking, growth milestone records, and accessible low-latency data entry.',
        highlights: [
          'Maternal, infant, and elderly health registry workflows',
          'Clear visual hierarchy designed for rapid field check-ins',
          'Responsive interface built for desktop and mobile clinic tablets',
        ],
        tags: ['React', 'UI/UX', 'Healthcare'],
        repoPath: 'https://github.com/fazle-star',
        previewImage: '/src/assets/images/preview_sipandu_1795711551556.jpg',
        previewAlt: 'SIPANDU healthcare monitoring dashboard UI preview',
      },
      {
        id: 'absen-resto',
        name: 'absen-resto',
        category: 'Hospitality PWA',
        year: '2026',
        desc: 'Full-stack QR-code restaurant attendance Progressive Web App.',
        architecture: 'End-to-end TypeScript PWA combining camera-based QR shift verification with a Node.js API and PostgreSQL attendance ledger.',
        highlights: [
          'Dynamic QR check-in validation with server-side timestamping',
          'Role-aware shift logs stored in PostgreSQL',
          'Installable PWA footprint for floor staff devices',
        ],
        tags: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        repoPath: 'https://github.com/fazle-star',
        previewImage: '/src/assets/images/preview_absen_resto_1795711552576.jpg',
        previewAlt: 'absen-resto QR restaurant attendance Progressive Web App UI preview',
      },
      {
        id: 'dapur-sistem',
        name: 'dapur-sistem',
        category: 'Real-Time Operations',
        year: '2026',
        desc: 'Real-time kitchen management Progressive Web App.',
        architecture: 'High-contrast kitchen display and station synchronization system built on Vite, React, and Supabase real-time channels.',
        highlights: [
          'Instant order queue synchronization across prep stations',
          'Low-glare dark interface calibrated for kitchen environments',
          'Zero-reload order state transitions and completion tracking',
        ],
        tags: ['Vite', 'React', 'Supabase'],
        repoPath: 'https://github.com/fazle-star',
        previewImage: '/src/assets/images/preview_dapur_sistem_1795711552524.jpg',
        previewAlt: 'dapur-sistem real-time kitchen display operations board UI preview',
      },
      {
        id: 'pythonverse-learning-hub',
        name: 'pythonverse-learning-hub',
        category: 'Interactive EdTech',
        year: '2026',
        desc: 'Interactive Python tutorial platform with sandboxed live code execution.',
        architecture: 'Curriculum platform pairing guided Python exercises with an isolated execution web server that enforces strict resource and namespace boundaries.',
        highlights: [
          'Isolated sandbox execution for untrusted student snippets',
          'Structured lesson progression with immediate stdout feedback',
          'Hardened web server boundary against command injection',
        ],
        tags: ['Python', 'Web Server', 'Sandbox'],
        repoPath: 'https://github.com/fazle-star',
        previewImage: '/src/assets/images/preview_pythonverse_1795711553667.jpg',
        previewAlt: 'pythonverse-learning-hub interactive Python IDE and sandbox console UI preview',
      },
    ] as ProjectItem[],
  },
  cybersecurity: {
    id: 'cybersecurity',
    number: '04',
    title: 'Cybersecurity & CTF',
    focus: [
      {
        title: 'Web Exploitation',
        detail: 'Analyzing HTTP request/response lifecycles, authentication flaws, XSS, and SQL injection vectors.',
      },
      {
        title: 'Capture The Flag (CTF)',
        detail: 'Solving structured jeopardy challenges across web security, forensics, and Linux privilege escalation.',
      },
      {
        title: 'Network & System Security',
        detail: 'Hardening virtualized Linux environments, inspecting packet flows, and auditing service exposures.',
      },
      {
        title: 'Secure Coding',
        detail: 'Applying parameterized queries, strict input validation, and least-privilege boundaries from line one.',
      },
    ],
    tools: [
      { name: 'Burp Suite', role: 'HTTP Proxy & Request Auditing' },
      { name: 'Kali Linux', role: 'Offensive & Reconnaissance Environment' },
      { name: 'Debian VM', role: 'Hardened Server & Lab Sandboxing' },
      { name: 'OverTheWire', role: 'Linux & Wargame Foundations' },
    ],
  },
  contact: {
    id: 'contact',
    number: '05',
    title: 'Contact & Socials',
    githubUrl: 'https://github.com/fazle-star',
  },
} as const;
