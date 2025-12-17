import React, { useState, useEffect } from 'react';
import { Project, Skill } from '../types';
import { getProjects, saveProjects, getSkills, saveSkills, resetData } from '../services/dataService';

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Data State
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'projects' | 'skills'>('projects');
  const [cvVersion, setCvVersion] = useState<number>(1);
  const [cvUploading, setCvUploading] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editingSkillIndex, setEditingSkillIndex] = useState<number>(-1);

  useEffect(() => {
    // Load data when authentication is successful or initially to verify integrity
    setProjects(getProjects());
    setSkills(getSkills());

    // load cv version
    try {
      // lazy-import to avoid SSR issues
      import('../services/cvService').then(mod => {
        setCvVersion(mod.getCVVersion());
      }).catch(() => {});
    } catch (e) {}
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPass = password.trim();
    
    if (cleanEmail === 'swopnil@gmail.com' && cleanPass === 'swopnil@123') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid Credentials. Please check for extra spaces.');
    }
  };

  const handleExit = () => {
    window.location.hash = '';
  };

  const handleResetAll = () => {
    if (window.confirm("WARNING: This will reset ALL data (Projects and Skills) to factory defaults. Proceed?")) {
      resetData();
      setProjects(getProjects());
      setSkills(getSkills());
    }
  };

  // --- PROJECT ACTIONS ---
  const handleSaveProject = (project: Project) => {
    let newProjects;
    if (projects.find(p => p.id === project.id)) {
      newProjects = projects.map(p => p.id === project.id ? project : p);
    } else {
      newProjects = [...projects, project];
    }
    setProjects(newProjects);
    saveProjects(newProjects);
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    if (projects.length <= 3) {
      alert("System Protocol: Minimum of 3 projects required for portfolio integrity.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this file?")) {
      const newProjects = projects.filter(p => p.id !== id);
      setProjects(newProjects);
      saveProjects(newProjects);
    }
  };

  const handleAddProject = () => {
    setEditingProject({
      id: Date.now().toString(),
      title: 'New Project',
      description: 'Project description...',
      tech: ['React'],
      image: 'https://picsum.photos/600/400',
      link: '#',
      longDescription: ''
    });
  };

  // --- SKILL ACTIONS ---
  const startEditSkill = (skill: Skill, index: number) => {
    setEditingSkill(skill);
    setEditingSkillIndex(index);
  };

  const startAddSkill = () => {
    setEditingSkill({ name: 'New Skill', level: 50, category: 'Frontend' });
    setEditingSkillIndex(-1); // New item
  };

  const commitSaveSkill = () => {
    if (!editingSkill) return;
    let newSkills = [...skills];
    if (editingSkillIndex >= 0) {
      newSkills[editingSkillIndex] = editingSkill;
    } else {
      newSkills.push(editingSkill);
    }
    setSkills(newSkills);
    saveSkills(newSkills);
    setEditingSkill(null);
    setEditingSkillIndex(-1);
  };

  const deleteSkill = (index: number) => {
    if (window.confirm("Delete this skill node?")) {
      const newSkills = skills.filter((_, i) => i !== index);
      setSkills(newSkills);
      saveSkills(newSkills);
    }
  };


  // --- RENDER ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono-tech relative z-[100]">
         <button 
            onClick={handleExit}
            className="absolute top-8 left-8 text-cyan-600 hover:text-cyan-400"
         >
            ← RETURN TO PORTFOLIO
         </button>

        <div className="bg-gray-900 p-8 border border-cyan-500 rounded-lg w-96 shadow-[0_0_50px_rgba(0,255,255,0.2)]">
          <h1 className="text-2xl text-cyan-500 mb-6 text-center tracking-widest">STARK INDUSTRIES<br/>SECURE LOGIN</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              placeholder="ID" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-black border border-gray-700 p-2 text-white focus:border-cyan-500 outline-none"
            />
            <input 
              type="password" 
              placeholder="PASSPHRASE" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black border border-gray-700 p-2 text-white focus:border-cyan-500 outline-none"
            />
            <button type="submit" className="w-full bg-cyan-900/50 hover:bg-cyan-500 text-white p-2 border border-cyan-500 transition-colors">
              ACCESS MAINFRAME
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-mono-tech overflow-y-auto relative z-[100]">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-cyan-900 pb-4">
          <div className="flex items-center gap-4">
              <button onClick={handleExit} className="text-gray-500 hover:text-white mr-4">← EXIT</button>
              <h1 className="text-3xl text-cyan-500">MAINFRAME ADMIN</h1>
          </div>
          <div className="flex gap-4">
             <button onClick={handleResetAll} className="text-red-500 text-sm hover:underline">RESET SYSTEM</button>
             <button onClick={() => setIsAuthenticated(false)} className="bg-red-900/20 text-red-500 px-4 py-1 border border-red-500">LOGOUT</button>
          </div>
        </header>

        {/* TABS */}
        <div className="flex gap-4 mb-8">
            <button 
              onClick={() => { setActiveTab('projects'); setEditingProject(null); setEditingSkill(null); }}
                className={`px-6 py-2 border ${activeTab === 'projects' ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-cyan-500 border-cyan-500'}`}
            >
                PROJECTS
            </button>
            <button 
              onClick={() => { setActiveTab('skills'); setEditingProject(null); setEditingSkill(null); }}
              className={`px-6 py-2 border ${activeTab === 'skills' ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-cyan-500 border-cyan-500'}`}
            >
              TECH STACK / SKILLS
            </button>
            <button
              onClick={() => { setActiveTab('cv' as any); setEditingProject(null); setEditingSkill(null); }}
              className={`px-6 py-2 border ${activeTab === ('cv' as any) ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-transparent text-cyan-500 border-cyan-500'}`}
            >
              CV
            </button>
        </div>

        {/* --- PROJECTS TAB --- */}
        {activeTab === 'projects' && (
            <>
                {editingProject ? (
                <div className="bg-gray-900/50 p-6 border border-cyan-500 mb-8 animate-in fade-in">
                    <h2 className="text-xl text-white mb-4">EDITING NODE: {editingProject.title}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">TITLE</label>
                        <input 
                        className="w-full bg-black border border-gray-700 p-2 text-white" 
                        value={editingProject.title} 
                        onChange={e => setEditingProject({...editingProject, title: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">IMAGE URL</label>
                        <input 
                        className="w-full bg-black border border-gray-700 p-2 text-white" 
                        value={editingProject.image} 
                        onChange={e => setEditingProject({...editingProject, image: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs text-gray-500">SHORT DESCRIPTION</label>
                        <input 
                        className="w-full bg-black border border-gray-700 p-2 text-white" 
                        value={editingProject.description} 
                        onChange={e => setEditingProject({...editingProject, description: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs text-gray-500">LONG DESCRIPTION (FOR MODAL)</label>
                        <textarea 
                        className="w-full bg-black border border-gray-700 p-2 text-white h-32" 
                        value={editingProject.longDescription || ''} 
                        onChange={e => setEditingProject({...editingProject, longDescription: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs text-gray-500">TECH STACK (Comma separated)</label>
                        <input 
                        className="w-full bg-black border border-gray-700 p-2 text-white" 
                        value={editingProject.tech.join(', ')} 
                        onChange={e => setEditingProject({...editingProject, tech: e.target.value.split(',').map(s => s.trim())})}
                        />
                    </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                    <button onClick={() => setEditingProject(null)} className="text-gray-500 hover:text-white">CANCEL</button>
                    <button onClick={() => handleSaveProject(editingProject)} className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2">SAVE CHANGES</button>
                    </div>
                </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(p => (
                    <div key={p.id} className="bg-black/40 border border-gray-800 p-4 hover:border-cyan-500/50 transition-colors">
                        <img src={p.image} className="w-full h-32 object-cover mb-4 opacity-50" alt="" />
                        <h3 className="text-cyan-400 font-bold">{p.title}</h3>
                        <p className="text-gray-500 text-sm mb-4 truncate">{p.description}</p>
                        <div className="flex justify-between mt-auto">
                        <button onClick={() => setEditingProject(p)} className="text-cyan-600 hover:text-cyan-400">EDIT</button>
                        <button onClick={() => handleDeleteProject(p.id)} className="text-red-900 hover:text-red-500">DELETE</button>
                        </div>
                    </div>
                    ))}
                    <button 
                    onClick={handleAddProject}
                    className="border-2 border-dashed border-gray-800 flex items-center justify-center h-full min-h-[200px] text-gray-600 hover:text-cyan-500 hover:border-cyan-500 transition-colors"
                    >
                    + ADD NEW PROJECT
                    </button>
                </div>
                )}
            </>
        )}

        {/* --- SKILLS TAB --- */}
        {activeTab === 'skills' && (
            <>
                {editingSkill ? (
                    <div className="bg-gray-900/50 p-6 border border-cyan-500 mb-8 animate-in fade-in max-w-2xl">
                        <h2 className="text-xl text-white mb-4">EDITING SKILL NODE</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500">SKILL NAME</label>
                                <input 
                                className="w-full bg-black border border-gray-700 p-2 text-white" 
                                value={editingSkill.name} 
                                onChange={e => setEditingSkill({...editingSkill, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500">PROFICIENCY LEVEL (0-100)</label>
                                <input 
                                type="number"
                                min="0" max="100"
                                className="w-full bg-black border border-gray-700 p-2 text-white" 
                                value={editingSkill.level} 
                                onChange={e => setEditingSkill({...editingSkill, level: parseInt(e.target.value) || 0})}
                                />
                                <div className="w-full h-2 bg-gray-800 rounded overflow-hidden">
                                    <div className="h-full bg-cyan-500" style={{width: `${editingSkill.level}%`}}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500">CATEGORY</label>
                                <select 
                                    className="w-full bg-black border border-gray-700 p-2 text-white"
                                    value={editingSkill.category}
                                    onChange={e => setEditingSkill({...editingSkill, category: e.target.value as any})}
                                >
                                    <option value="Frontend">Frontend</option>
                                    <option value="Backend">Backend</option>
                                    <option value="3D">3D / WebGL</option>
                                    <option value="Design">Design</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setEditingSkill(null)} className="text-gray-500 hover:text-white">CANCEL</button>
                            <button onClick={commitSaveSkill} className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2">SAVE CHANGES</button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {skills.map((skill, idx) => (
                            <div key={idx} className="bg-black/40 border border-gray-800 p-4 hover:border-cyan-500/50 transition-colors flex flex-col">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-cyan-400 font-bold">{skill.name}</span>
                                    <span className="text-xs text-gray-500 border border-gray-800 px-1">{skill.category}</span>
                                </div>
                                <div className="w-full h-1 bg-gray-900 mb-4">
                                    <div className="h-full bg-cyan-500" style={{ width: `${skill.level}%` }}></div>
                                </div>
                                <div className="flex justify-end gap-3 mt-auto text-sm">
                                    <button onClick={() => startEditSkill(skill, idx)} className="text-cyan-600 hover:text-cyan-400">EDIT</button>
                                    <button onClick={() => deleteSkill(idx)} className="text-red-900 hover:text-red-500">DELETE</button>
                                </div>
                            </div>
                        ))}
                         <button 
                            onClick={startAddSkill}
                            className="border-2 border-dashed border-gray-800 flex items-center justify-center h-full min-h-[100px] text-gray-600 hover:text-cyan-500 hover:border-cyan-500 transition-colors"
                            >
                            + ADD SKILL
                        </button>
                    </div>
                )}
            </>
        )}

        {/* --- CV TAB --- */}
        {activeTab === ('cv' as any) && (
          <div className="bg-gray-900/50 p-6 border border-cyan-500 mb-8 max-w-2xl">
            <h2 className="text-xl text-white mb-4">Manage CV</h2>
            <p className="text-gray-400 text-sm mb-4">Current version: <span className="font-bold text-cyan-400">{cvVersion}</span></p>

            <div className="mb-4">
              <label className="block mb-2 text-xs text-gray-500">Upload PDF (drop or choose file)</label>
              <div
                onDrop={async (e) => {
                  e.preventDefault();
                  const f = e.dataTransfer?.files?.[0];
                  if (!f) return;
                  if (f.type !== 'application/pdf') { alert('Please upload a PDF'); return; }
                  setCvUploading(true);

                  // Try server upload first
                  try {
                    const arr = await f.arrayBuffer();
                    const b64 = Buffer.from(arr).toString('base64');
                    const resp = await fetch('/api/upload-cv', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: f.name, type: f.type, content: b64 })
                    });
                    if (resp.ok) {
                      const j = await resp.json();
                      setCvVersion(j.version || 1);
                      setCvUploading(false);
                      alert('CV uploaded to server and version updated to ' + j.version);
                      return;
                    }
                  } catch (e) {
                    console.warn('Server upload failed, falling back to local IndexedDB', e);
                  }

                  // Fallback to local store
                  try {
                    const mod = await import('../services/cvService');
                    await mod.saveCV(f);
                    const ver = mod.bumpCVVersion();
                    setCvVersion(ver);
                    alert('CV uploaded locally and version updated to ' + ver);
                  } catch (e) {
                    alert('Upload failed: ' + String(e));
                  } finally {
                    setCvUploading(false);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                className="w-full border-2 border-dashed border-gray-700 p-6 rounded text-center text-gray-500 bg-black/40"
              >
                {cvUploading ? 'Uploading...' : 'Drop PDF here or click to choose'}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.type !== 'application/pdf') { alert('Please upload a PDF'); return; }
                    setCvUploading(true);

                    try {
                      const arr = await f.arrayBuffer();
                      const b64 = Buffer.from(arr).toString('base64');
                      // Try Vercel endpoint first
                      let resp = await fetch('/api/upload-cv', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: f.name, type: f.type, content: b64 })
                      });
                      // If not ok, try Netlify functions path
                      if (!resp.ok) {
                        resp = await fetch('/.netlify/functions/upload-cv', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name: f.name, type: f.type, content: b64 })
                        });
                      }
                      if (resp.ok) {
                        const j = await resp.json();
                        setCvVersion(j.version || 1);
                        setCvUploading(false);
                        alert('CV uploaded to server and version updated to ' + j.version);
                        return;
                      }
                    } catch (e) {
                      console.warn('Server upload failed, falling back to local IndexedDB', e);
                    }

                    // Fallback local
                    try {
                      const mod = await import('../services/cvService');
                      await mod.saveCV(f);
                      const ver = mod.bumpCVVersion();
                      setCvVersion(ver);
                      alert('CV uploaded locally and version updated to ' + ver);
                    } catch (e) {
                      alert('Upload failed: ' + String(e));
                    } finally {
                      setCvUploading(false);
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={async () => {
                  const mod = await import('../services/cvService');
                  const stored = await mod.getCV();
                  if (!stored) { alert('No uploaded CV found'); return; }
                  const url = URL.createObjectURL(stored.file as Blob);
                  window.open(url, '_blank');
                  setTimeout(() => URL.revokeObjectURL(url), 3000);
                }}
                className="bg-cyan-600 px-4 py-2"
              >Preview CV</button>

              <button
                onClick={async () => {
                  if (!confirm('Delete uploaded CV and revert to public file?')) return;
                  const mod = await import('../services/cvService');
                  await mod.deleteCV();
                  mod.bumpCVVersion();
                  setCvVersion(mod.getCVVersion());
                  alert('Uploaded CV removed.');
                }}
                className="bg-red-800 px-4 py-2"
              >Delete Uploaded CV</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;