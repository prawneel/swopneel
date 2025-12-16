export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  image: string;
  link: string;
  longDescription?: string;
}

export interface Skill {
  name: string;
  level: number;
  category: 'Frontend' | '3D' | 'Backend' | 'Design';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface SectionProps {
  id: string;
  className?: string;
  children: React.ReactNode;
}
