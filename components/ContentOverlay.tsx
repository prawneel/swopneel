import React, { useState, useEffect } from 'react';
import Section from './ui/Section';
import HologramCard from './ui/HologramCard';
import Navbar from './ui/Navbar';
import Footer from './ui/Footer';
import { HERO_CONTENT, ABOUT_TEXT } from '../constants';
import { getProjects, getSkills } from '../services/dataService';
import { Project, Skill } from '../types';
import { speak, playClickSound } from '../services/audioService';
import { getCV as getStoredCV } from '../services/cvService';
import { getLocalMeta } from '../services/cvMetaService';

const ContentOverlay: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalMouse, setModalMouse] = useState({ x: 0, y: 0 });
  const [textIndex, setTextIndex] = useState(0);
  const [currentRole, setCurrentRole] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Dynamic Data State
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  
  const [projectIndex, setProjectIndex] = useState(0); // For carousel

  const roles = ["DEVELOPER", "DESIGNER", "TECH ENTHUSIAST"];
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 1500;

  useEffect(() => {
    // Initial Load
    setProjects(getProjects());
    setSkills(getSkills());

    // Listen for Admin Updates
    const handleUpdate = () => {
      setProjects(getProjects());
      setSkills(getSkills());
    };
    window.addEventListener('dataUpdated', handleUpdate);
    return () => window.removeEventListener('dataUpdated', handleUpdate);
  }, []);

  useEffect(() => {
    const handleTyping = () => {
      const fullText = roles[textIndex];
      
      if (isDeleting) {
        setCurrentRole(fullText.substring(0, currentRole.length - 1));
      } else {
        setCurrentRole(fullText.substring(0, currentRole.length + 1));
      }

      if (!isDeleting && currentRole === fullText) {
        setTimeout(() => setIsDeleting(true), pauseTime);
      } else if (isDeleting && currentRole === '') {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % roles.length);
      }
    };

    const timer = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);
    return () => clearTimeout(timer);
  }, [currentRole, isDeleting, textIndex]);

  const handleProjectClick = (project: Project) => {
    playClickSound();
    setSelectedProject(project);
    if (project.longDescription) {
      speak(project.longDescription);
    } else {
      speak(`Accessing secure files for ${project.title}.`);
    }
  };

  const closeProjectModal = () => {
    playClickSound();
    setSelectedProject(null);
    setModalMouse({ x: 0, y: 0 });
    window.speechSynthesis.cancel();
  };

  const nextProjects = () => {
    playClickSound();
    setProjectIndex(prev => (prev + 1) % projects.length);
  };

  const prevProjects = () => {
    playClickSound();
    setProjectIndex(prev => (prev - 1 + projects.length) % projects.length);
  };

  const handleDownloadCV = () => {
    playClickSound();
    speak("Downloading secure personnel file.");
    try {
      // 1) Prefer uploaded CV stored in IndexedDB (admin override local)
      const stored = await getStoredCV();
      if (stored && stored.file) {
        const blob = stored.file as Blob;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = stored.name || 'cv.pdf';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 200);
        return;
      }

      // 2) Use server meta (cv_meta.json) if available to cache-bust and get filename
      const meta = getLocalMeta();
      let filename = 'ashish dhamala cv.pdf';
      let version = Date.now();
      if (meta && meta.filename) {
        filename = meta.filename;
        version = meta.version || Date.now();
      }

      const filePath = `/${encodeURIComponent(filename)}?v=${version}`;
      const link = document.createElement('a');
      link.href = filePath;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 150);
    } catch (err) {
      console.error('Download error', err);
      alert('Unable to download CV. Please check the file or try again.');
    }
  };

  const onModalMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2; 
    const y = (clientY / innerHeight - 0.5) * 2; 
    setModalMouse({ x, y });
  };

  // Logic to show 3 projects at a time if carousel needed
  const visibleProjects = projects.length > 3 
    ? [
        projects[projectIndex % projects.length],
        projects[(projectIndex + 1) % projects.length],
        projects[(projectIndex + 2) % projects.length],
      ]
    : projects;

  return (
    <div id="content" className="relative w-full z-10 flex flex-col min-h-screen">
      <Navbar />

      {/* Decorative HUD Corners */}
      <div className="fixed top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-lg z-30 pointer-events-none"></div>
      <div className="fixed top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg z-30 pointer-events-none"></div>
      <div className="fixed bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg z-30 pointer-events-none"></div>
      <div className="fixed bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-cyan-500/30 rounded-br-lg z-30 pointer-events-none"></div>
      
      {/* Side Data Bars */}
      <div className="fixed left-8 top-1/2 w-[2px] h-40 bg-gradient-to-b from-transparent via-cyan-900 to-transparent -translate-y-1/2 z-20 hidden md:block"></div>
      <div className="fixed right-8 top-1/2 w-[2px] h-40 bg-gradient-to-b from-transparent via-cyan-900 to-transparent -translate-y-1/2 z-20 hidden md:block"></div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
          onMouseMove={onModalMouseMove}
        >
          <div className="relative max-w-5xl w-full">
            <HologramCard className="w-full bg-black/90 border border-cyan-500 shadow-[0_0_100px_rgba(0,229,255,0.15)] overflow-hidden relative">
              
              {/* Parallax Background Elements */}
              <div 
                className="absolute inset-0 pointer-events-none z-0 opacity-10"
                style={{ transform: `translate(${modalMouse.x * -20}px, ${modalMouse.y * -20}px) transition: transform 0.1s linear` }}
              >
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.5)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
              </div>

              <button 
                onClick={closeProjectModal}
                className="absolute top-4 right-4 text-cyan-500 hover:text-white font-mono-tech text-xl border border-cyan-500/50 px-3 py-1 hover:bg-cyan-900/50 transition-all z-20"
              >
                [ ABORT ]
              </button>
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
                <div 
                  className="h-64 md:h-96 bg-gray-900 rounded-lg overflow-hidden border border-cyan-900/50 relative group"
                  style={{ transform: `perspective(1000px) rotateY(${modalMouse.x * 2}deg) rotateX(${modalMouse.y * -2}deg)` }}
                >
                  <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 scale-100 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay"></div>
                </div>
                
                <div className="flex flex-col justify-center">
                  <div className="text-cyan-500 font-mono-tech text-xs tracking-[0.2em] mb-2">CLASSIFIED PROJECT FILE // 00{selectedProject.id}</div>
                  <h2 
                    className="text-4xl md:text-5xl text-white font-bold mb-4 font-mono-tech uppercase drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]"
                    style={{ transform: `translate(${modalMouse.x * 10}px, ${modalMouse.y * 10}px)` }}
                  >
                    {selectedProject.title}
                  </h2>
                  
                  <div className="flex gap-2 mb-6">
                     {selectedProject.tech.map(t => (
                        <span key={t} className="text-xs bg-cyan-900/20 border border-cyan-500/30 text-cyan-300 px-2 py-1 font-mono-tech">
                          {t}
                        </span>
                      ))}
                  </div>
                  
                  <p className="text-cyan-100 text-lg leading-relaxed mb-8 font-[Rajdhani] border-l-2 border-cyan-500/50 pl-4">
                    {selectedProject.longDescription || selectedProject.description}
                  </p>

                  <a 
                    href={selectedProject.link}
                    className="inline-flex justify-center items-center gap-2 py-4 bg-red-700/90 hover:bg-red-600 text-white font-bold tracking-widest uppercase border border-red-500 transition-all shadow-[0_0_20px_rgba(200,16,46,0.4)] hover:shadow-[0_0_30px_rgba(200,16,46,0.6)]"
                  >
                    <span>Launch Protocol</span>
                    <span>➜</span>
                  </a>
                </div>
              </div>
            </HologramCard>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <Section id="landing" className="items-center justify-center text-center">
        <div className="flex flex-col gap-8 relative z-10 w-full">
          {/* Subtle Background Text */}
           <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-[15rem] font-bold text-white/[0.02] pointer-events-none whitespace-nowrap overflow-hidden">
            STARK.DEV
          </div>

          <h1 className="text-7xl md:text-9xl font-bold text-white uppercase tracking-tighter font-[Rajdhani] drop-shadow-[0_0_30px_rgba(0,229,255,0.3)]">
            I AM <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-white to-cyan-400 animate-pulse">SWOPNIL</span>
          </h1>
          
          <div className="h-12 flex items-center justify-center">
            <h2 className="text-2xl md:text-4xl font-mono-tech text-red-500 tracking-[0.3em] relative bg-black/50 px-4 py-1 border-x border-red-500/50">
              {currentRole}
              <span className="animate-pulse border-r-4 border-red-500 ml-1 h-full inline-block align-middle">&nbsp;</span>
            </h2>
          </div>
          
          <button 
            onClick={handleDownloadCV}
            className="mt-8 px-12 py-4 mx-auto bg-transparent border border-cyan-500/50 text-cyan-400 font-mono-tech tracking-[0.2em] hover:bg-cyan-900/20 hover:border-cyan-400 hover:text-white transition-all duration-300 backdrop-blur-sm group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3 font-bold text-sm">
               DOWNLOAD CV_V2.5
            </span>
            <div className="absolute inset-0 bg-cyan-500/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0"></div>
          </button>
        </div>
      </Section>

      {/* About Section */}
      <Section id="about" className="justify-end md:items-end">
        <HologramCard title="IDENTITY RECORD" className="md:w-1/2 backdrop-blur-md border-l-4 border-l-yellow-500">
          <p className="text-xl leading-relaxed font-[Rajdhani] text-gray-200 group-hover:text-white transition-colors">
            {ABOUT_TEXT}
          </p>
          <div className="mt-6 flex gap-4 text-cyan-500 font-mono-tech text-xs border-t border-gray-800 pt-4">
             <div className="flex flex-col">
                <span className="text-gray-500">CURRENT LOC</span>
                <span>SAN FRANCISCO, CA</span>
             </div>
             <div className="flex flex-col">
                <span className="text-gray-500">OPERATING SYSTEM</span>
                <span>STARK OS v4.2</span>
             </div>
          </div>
        </HologramCard>
      </Section>

      {/* Skills Section */}
      <Section id="skills">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full items-center">
          <div>
            <h2 className="text-5xl text-white font-bold mb-6 uppercase border-l-4 border-red-600 pl-6 drop-shadow-[0_0_10px_rgba(200,16,46,0.5)]">
              Core<br/>Systems
            </h2>
            <p className="text-gray-400 font-mono-tech text-sm max-w-sm">
              Advanced proficiency in frontend architecture and 3D rendering pipelines. 
            </p>
          </div>
          <div className="grid gap-3">
            {skills.map((skill, idx) => (
              <div key={idx} className="bg-black/40 border border-gray-800 p-4 skew-x-[-10deg] hover:border-cyan-500 transition-all duration-300 group hover:translate-x-2">
                <div className="flex justify-between text-gray-300 font-mono-tech mb-2 skew-x-[10deg]">
                  <span className="group-hover:text-cyan-400 font-bold tracking-wider">{skill.name}</span>
                  <span className="text-cyan-700">{skill.level}%</span>
                </div>
                <div className="w-full h-1 bg-gray-900 overflow-hidden skew-x-[10deg]">
                  <div 
                    className="h-full bg-cyan-500 shadow-[0_0_10px_#00E5FF] group-hover:bg-yellow-400 group-hover:shadow-[0_0_10px_#FFD700] transition-colors duration-500" 
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Projects Section with Carousel */}
      <Section id="projects">
        <div className="w-full mb-12 flex justify-between items-end">
            <div>
                 <h2 className="text-6xl text-white font-bold uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Mission Log</h2>
                 <div className="h-1 w-24 bg-red-600 mt-4"></div>
            </div>
            {projects.length > 3 && (
                <div className="flex gap-4">
                    <button onClick={prevProjects} className="w-12 h-12 border border-cyan-500 flex items-center justify-center text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all">←</button>
                    <button onClick={nextProjects} className="w-12 h-12 border border-cyan-500 flex items-center justify-center text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all">→</button>
                </div>
            )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {visibleProjects.map((project) => (
            <HologramCard 
              key={project.id} 
              className="h-full flex flex-col hover:-translate-y-2 transition-transform duration-300" 
              isInteractive={true}
              onClick={() => handleProjectClick(project)}
            >
              <div className="h-48 bg-gray-900 mb-5 rounded-sm overflow-hidden relative">
                <img src={project.image} alt={project.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-2 right-2 text-xs font-mono-tech text-cyan-400 bg-black/50 px-2 rounded">
                    SECURE // 0{project.id}
                </div>
              </div>
              <h3 className="text-2xl text-white font-bold mb-2 font-mono-tech group-hover:text-cyan-400 transition-colors">{project.title}</h3>
              <p className="text-gray-400 text-sm mb-6 flex-grow leading-relaxed line-clamp-3">{project.description}</p>
              
              <div className="mt-auto border-t border-gray-800 pt-4 flex justify-between items-center">
                  <div className="text-xs text-gray-500 font-mono-tech">CLICK TO ACCESS</div>
                  <div className="text-red-500 font-bold text-lg">➜</div>
              </div>
            </HologramCard>
          ))}
        </div>
      </Section>

      {/* Contact Section */}
      <section 
        id="contact" 
        className="min-h-screen w-full flex flex-col justify-center items-center px-6 md:px-20 lg:px-32 relative z-10 pointer-events-none"
      >
        <div className="pointer-events-auto max-w-3xl w-full relative">
          {/* Background Plate */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md -skew-x-6 border border-gray-800 transform scale-105 z-0"></div>
          
          <div className="relative z-10 p-8 md:p-12 text-center">
            <h2 className="text-4xl md:text-6xl text-white font-bold mb-4 uppercase">Initialize Connection</h2>
            <p className="text-cyan-500 font-mono-tech mb-8 text-lg tracking-wider">SECURE CHANNEL OPEN</p>
            
            <form className="space-y-4 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="CODENAME" className="bg-gray-900/50 border border-gray-700 p-4 text-white focus:border-cyan-500 focus:bg-gray-900 focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] focus:outline-none w-full transition-all font-mono-tech" />
                <input type="email" placeholder="FREQUENCY (EMAIL)" className="bg-gray-900/50 border border-gray-700 p-4 text-white focus:border-cyan-500 focus:bg-gray-900 focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] focus:outline-none w-full transition-all font-mono-tech" />
              </div>
              <textarea rows={4} placeholder="TRANSMISSION DATA" className="bg-gray-900/50 border border-gray-700 p-4 text-white focus:border-cyan-500 focus:bg-gray-900 focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] focus:outline-none w-full transition-all font-mono-tech"></textarea>
              <button className="w-full py-5 bg-gradient-to-r from-red-800 to-red-600 text-white font-bold tracking-[0.2em] uppercase hover:from-red-600 hover:to-red-500 transition-all shadow-[0_0_30px_rgba(200,16,46,0.4)] clip-path-slant">
                SEND TRANSMISSION
              </button>
            </form>

            <div className="mt-12 flex justify-center gap-12 border-t border-gray-800 pt-8">
              {['GITHUB', 'LINKEDIN', 'TWITTER'].map(social => (
                <a key={social} href="#" className="text-gray-500 hover:text-white font-mono-tech transition-colors hover:drop-shadow-[0_0_5px_#ffffff] text-sm">
                  [{social}]
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContentOverlay;