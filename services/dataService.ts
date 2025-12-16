import { Project, Skill } from '../types';
import { PROJECTS as DEFAULT_PROJECTS, SKILLS as DEFAULT_SKILLS } from '../constants';

const PROJECT_STORAGE_KEY = 'stark_folio_projects';
const SKILL_STORAGE_KEY = 'stark_folio_skills';

// --- PROJECTS ---
export const getProjects = (): Project[] => {
  if (typeof window === 'undefined') return DEFAULT_PROJECTS;
  const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
  if (!stored) return DEFAULT_PROJECTS;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_PROJECTS;
  }
};

export const saveProjects = (projects: Project[]) => {
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
  window.dispatchEvent(new Event('dataUpdated'));
};

// --- SKILLS ---
export const getSkills = (): Skill[] => {
  if (typeof window === 'undefined') return DEFAULT_SKILLS;
  const stored = localStorage.getItem(SKILL_STORAGE_KEY);
  if (!stored) return DEFAULT_SKILLS;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_SKILLS;
  }
};

export const saveSkills = (skills: Skill[]) => {
  localStorage.setItem(SKILL_STORAGE_KEY, JSON.stringify(skills));
  window.dispatchEvent(new Event('dataUpdated'));
};

// --- GENERAL ---
export const resetData = () => {
  localStorage.removeItem(PROJECT_STORAGE_KEY);
  localStorage.removeItem(SKILL_STORAGE_KEY);
  window.dispatchEvent(new Event('dataUpdated'));
};

export const getPortfolioContext = (): string => {
  const projects = getProjects();
  const skills = getSkills();
  
  const projectText = projects.map(p => `Project: ${p.title} (Tech: ${p.tech.join(', ')}). Desc: ${p.description}. Full Details: ${p.longDescription}`).join('\n');
  const skillText = skills.map(s => `Skill: ${s.name} (${s.level}%) - ${s.category}`).join('\n');
  
  return `
  CURRENT PORTFOLIO DATA (DYNAMICALLY UPDATED):
  
  [SKILLS / TECH STACK]
  ${skillText}
  
  [PROJECTS]
  ${projectText}
  `;
};