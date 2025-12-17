import { getPortfolioContext, getProjects, getSkills } from './dataService';

// Client-side lightweight fallback for Jarvis.
// Avoids importing server SDKs into the browser bundle.
export const sendMessageToJarvis = async (message: string): Promise<string> => {
  try {
    const msg = (message || '').toLowerCase();

    // Try to detect intent
    if (msg.includes('project') || msg.includes('projects') || msg.includes('mission')) {
      const projects = getProjects();
      if (projects.length === 0) return 'No mission logs available.';
      const titles = projects.slice(0, 3).map(p => p.title).join(', ');
      return `Available missions: ${titles}. Ask for details on any mission.`;
    }

    if (msg.includes('tech') || msg.includes('stack') || msg.includes('skill') || msg.includes('skills')) {
      const skills = getSkills();
      if (skills.length === 0) return 'No skills recorded.';
      const top = skills.slice(0, 5).map(s => `${s.name} (${s.level}%)`).join(', ');
      return `Core stack: ${top}.`;
    }

    if (msg.includes('about') || msg.includes('who are you') || msg.includes('identity')) {
      const context = getPortfolioContext();
      // Return a concise summary from context
      const firstLine = context.split('\n').slice(0,6).join(' ');
      return `Briefly: ${firstLine.substring(0, 200)}...`;
    }

    // Default small conversational replies
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('greetings')) {
      return 'Greetings. J.A.R.V.I.S. online. How may I assist you?';
    }

    // If message looks like a command or url/open request, echo back
    if (msg.length < 40) {
      return `Processing command: ${message}`;
    }

    // Fallback: summarize portfolio context concisely
    const ctx = getPortfolioContext();
    return ctx.split('\n').slice(0, 6).join(' ').substring(0, 200) + '...';
  } catch (e) {
    console.error('Jarvis fallback error', e);
    return 'Jarvis encountered an error handling your request.';
  }
};