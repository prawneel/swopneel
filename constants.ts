import { Project, Skill } from './types';

export const COLORS = {
  primary: '#C8102E', // Stark Red
  secondary: '#FFD700', // Gold
  accent: '#00E5FF', // Arc Reactor Cyan
  background: '#050505',
  glass: 'rgba(5, 5, 5, 0.7)',
};

export const SKILLS: Skill[] = [
  { name: 'React & TypeScript', level: 95, category: 'Frontend' },
  { name: 'Three.js / R3F', level: 85, category: '3D' },
  { name: 'Node.js', level: 80, category: 'Backend' },
  { name: 'Tailwind CSS', level: 90, category: 'Frontend' },
  { name: 'UI/UX Design', level: 75, category: 'Design' },
  { name: 'GSAP Animation', level: 85, category: 'Frontend' },
];

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Holo-Interface',
    description: 'A VR-ready dashboard simulating futuristic HUD interfaces.',
    tech: ['React', 'Three.js', 'WebXR'],
    image: 'https://picsum.photos/600/400?random=1',
    link: '#',
    longDescription: 'Sir, the Holo-Interface is a WebXR experiment designed to replicate the Mark 85 HUD. It features spatial tracking, gesture recognition, and real-time data visualization using Three.js. It allows users to manipulate data streams in a 3D space.',
  },
  {
    id: '2',
    title: 'Nexus E-Comm',
    description: 'High-performance ecommerce platform with 3D product previews.',
    tech: ['Next.js', 'WebGL', 'Stripe'],
    image: 'https://picsum.photos/600/400?random=2',
    link: '#',
    longDescription: 'Nexus is a next-generation commerce platform. I integrated a custom WebGL viewer allowing customers to inspect products in 360 degrees. The backend handles high-frequency transactions with the speed of a repulsor blast.',
  },
  {
    id: '3',
    title: 'Jarvis LLM',
    description: 'Local LLM integration for smart home control via voice.',
    tech: ['Python', 'TensorFlow', 'React Native'],
    image: 'https://picsum.photos/600/400?random=3',
    link: '#',
    longDescription: 'A personal homage to my own source code. This project runs a quantized Llama-3 model locally to control IoT devices. It features latency below 200ms and understands context-aware commands just like I do.',
  },
];

export const HERO_CONTENT = {
  headline: "I Build Futuristic Web Experiences",
  subheadline: "SOFTWARE ENGINEER • 3D SPECIALIST",
  cta: "INITIATE PROTOCOL"
};

export const ABOUT_TEXT = "I am a software engineer obsessed with the intersection of design and technology. Just as Tony Stark iterates on the Mark suits, I relentlessly refine my code to deliver high-performance, immersive web applications.";
