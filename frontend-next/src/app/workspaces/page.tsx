'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // <--- ADDED
import { 
  FiPlus, FiSettings, FiTrash2, FiUsers, FiBriefcase, 
  FiCheck, FiX, FiGlobe, FiBell, FiLayout, FiAlertTriangle, FiLoader
} from 'react-icons/fi';
import { FaTwitter, FaLinkedin, FaInstagram, FaFacebook } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  getWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace, Workspace 
} from '@/services/workspaceApi';

// Import the branded loader if you want a smooth transition
import SpinningLoader from '@/src/components/SpinningLoader'; 

export default function WorkspaceManager() {
  const router = useRouter(); // <--- ADDED

  // --- Data State ---
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); // <--- ADDED
  
  // --- View State ---
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedWorkspace, setSelectedWorkspace] = useState<Partial<Workspace> | null>(null);
  
  // --- Drag & Drop State ---
  const [isDragging, setIsDragging] = useState(false);
  const [trashHovered, setTrashHovered] = useState(false);
  const trashRef = useRef<HTMLDivElement>(null);

  // --- Custom Delete Modal State ---
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Workspace | null>(null);

  // --- Load Data ---
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await getWorkspaces();
      setWorkspaces(data);

      // If the user only has one workspace, skip the picker and go straight to dashboard
      if (data.length === 1) {
        setIsRedirecting(true);
        setTimeout(() => {
          router.push(`/dashboard/${data[0].id}`);
        }, 800);
        return;
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load workspaces", error);
      setIsLoading(false);
    }
  };

  // --- Form Helpers (Unchanged) ---
  const toggleSetting = (field: keyof Workspace) => {
    if (!selectedWorkspace) return;
    setSelectedWorkspace({ ...selectedWorkspace, [field]: !selectedWorkspace[field] });
  };

  const togglePlatform = (platform: string) => {
    if (!selectedWorkspace) return;
    const current = selectedWorkspace.default_platforms || [];
    const updated = current.includes(platform)
      ? current.filter(p => p !== platform)
      : [...current, platform];
    setSelectedWorkspace({ ...selectedWorkspace, default_platforms: updated });
  };

  // --- Save Handler ---
  const handleSubmit = async () => {
    if (!selectedWorkspace?.name) return alert('Name is required');
    setIsSaving(true);
    try {
      if (view === 'create') await createWorkspace(selectedWorkspace);
      else if (view === 'edit' && selectedWorkspace.id) await updateWorkspace(selectedWorkspace.id, selectedWorkspace);
      await loadData(); 
      setView('list');
    } catch (error) { alert(error); } 
    finally { setIsSaving(false); }
  };

  // --- Drag Logic (Unchanged) ---
  const checkDeleteDrop = (event: any, info: any, ws: Workspace) => {
    setIsDragging(false);
    setTrashHovered(false);

    if (!trashRef.current) return;
    const bin = trashRef.current.getBoundingClientRect();
    const point = info.point;

    if (point.x >= bin.left && point.x <= bin.right && point.y >= bin.top && point.y <= bin.bottom) {
      setItemToDelete(ws);
      setDeleteModalOpen(true);
    }
  };

  // --- Confirm Delete ---
  const confirmDelete = async () => {
    const id = itemToDelete?.id || selectedWorkspace?.id;
    if (!id) return;

    setIsSaving(true);
    await deleteWorkspace(id);
    await loadData();
    
    setDeleteModalOpen(false);
    setItemToDelete(null);
    setView('list');
    setIsSaving(false);
  };

  // --- 🔄 LOADING STATES ---
  
  // 1. If Redirecting to Dashboard (Smart Route)
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <SpinningLoader fullScreen={false} size={80} />
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Setting up your dashboard...</p>
      </div>
    );
  }

  // 2. If Fetching Data
  if (isLoading) {
    return <SpinningLoader fullScreen={true} />;
  }

  // --- MAIN RENDER (If Multiple Workspaces / Agency Mode) ---
  return (
    <div className="min-h-screen relative font-sans text-gray-800 overflow-hidden selection:bg-indigo-100">
      
      {/* --- NEW BACKGROUND LAYER --- */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-slate-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[#3C48F6] opacity-20 blur-[100px]"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10 p-6 md:p-12">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workspace Manager</h1>
            <p className="text-gray-500 mt-1">Manage your organizations, teams, and billing.</p>
          </div>
          {/* Optional: Show Plan Badge */}
          <div className="bg-white/80 backdrop-blur border border-gray-200 px-3 py-1 rounded-full text-xs font-bold text-gray-500">
            Current Plan: <span className="text-[#3C48F6]">Agency/Pro</span>
          </div>
        </div>

        {/* --- LIST VIEW (Draggable) --- */}
        {view === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-32">
            
            {/* Create Button */}
            <button 
              onClick={() => { setSelectedWorkspace({}); setView('create'); }} 
              className="border-2 border-dashed border-gray-300/80 bg-white/50 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:border-[#3C48F6] hover:bg-blue-50/50 transition-all h-64 group"
            >
              <div className="w-12 h-12 rounded-full bg-white border flex items-center justify-center text-[#3C48F6] shadow-sm group-hover:scale-110 transition-transform"><FiPlus size={24} /></div>
              <span className="font-bold text-gray-600 group-hover:text-[#3C48F6]">Create New</span>
            </button>

            <AnimatePresence>
              {workspaces.map((ws) => (
                <motion.div 
                  key={ws.id}
                  layoutId={`card-${ws.id}`}
                  drag
                  dragSnapToOrigin
                  dragElastic={0.1}
                  whileDrag={{ scale: 1.05, zIndex: 50, opacity: 0.9, cursor: 'grabbing' }}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={(e, info) => checkDeleteDrop(e, info, ws)}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 flex flex-col justify-between h-64 group hover:shadow-xl hover:border-blue-200 transition-all relative overflow-hidden cursor-grab active:cursor-grabbing"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start z-10 pointer-events-none">
                    <div className="flex items-center gap-3 pointer-events-auto">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white" style={{ backgroundColor: ws.color }}>{ws.name.charAt(0)}</div>
                      <div>
                        <h3 className="font-bold text-gray-900 leading-tight">{ws.name}</h3>
                        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{ws.role}</span>
                      </div>
                    </div>
                    <button onClick={() => { setSelectedWorkspace(ws); setView('edit'); }} className="pointer-events-auto p-2 text-gray-400 hover:bg-gray-100 rounded-lg hover:text-gray-900 transition-colors"><FiSettings /></button>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pointer-events-none">
                    <div className="bg-gray-50/80 p-2 rounded-lg border border-gray-100">
                       <p className="text-gray-400 text-[10px] uppercase font-bold flex items-center gap-1 mb-1"><FiUsers/> Members</p>
                       <p className="text-lg font-bold text-gray-900">{ws.members}</p>
                    </div>
                    <div className="bg-gray-50/80 p-2 rounded-lg border border-gray-100">
                       <p className="text-gray-400 text-[10px] uppercase font-bold flex items-center gap-1 mb-1"><FiBriefcase/> Projects</p>
                       <p className="text-lg font-bold text-gray-900">{ws.projects}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center z-10 mt-auto pointer-events-auto pt-4 border-t border-gray-50">
                     <Link href={`/dashboard/${ws.id}`}>
                      <button className="text-sm font-bold text-white bg-[#3C48F6] px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 hover:translate-y-[-1px]">
                          Enter <FiCheck />
                      </button>
                     </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* --- FULL SETTINGS FORM (Restored) --- */}
        {(view === 'edit' || view === 'create') && selectedWorkspace && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 z-20 relative">
            <div className="bg-gray-50/80 backdrop-blur px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{view === 'create' ? 'Create Workspace' : 'Settings'}</h2>
              <button onClick={() => setView('list')} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><FiX /></button>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* LEFT COLUMN */}
              <div className="lg:col-span-7 space-y-8">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-bold text-gray-900">Workspace Name</span>
                    <input type="text" value={selectedWorkspace.name || ''} onChange={(e) => setSelectedWorkspace({...selectedWorkspace, name: e.target.value})} className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 p-3 text-sm focus:border-[#3C48F6] outline-none border transition-colors" placeholder="e.g. Acme Corp" />
                  </label>
                </div>

                {/* Localization */}
                <div>
                   <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100"><FiGlobe className="text-gray-400"/> Localization</h3>
                   <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-xs font-bold text-gray-500 uppercase">Timezone</span>
                        <select value={selectedWorkspace.timezone || 'UTC'} onChange={(e) => setSelectedWorkspace({...selectedWorkspace, timezone: e.target.value})} className="mt-1 block w-full rounded-lg border-gray-300 bg-white p-2.5 text-sm border outline-none focus:border-[#3C48F6]">
                          <option value="America/New_York">New York (EST)</option>
                          <option value="Europe/London">London (GMT)</option>
                          <option value="Asia/Tokyo">Tokyo (JST)</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-xs font-bold text-gray-500 uppercase">Language</span>
                        <select value={selectedWorkspace.default_language || 'en'} onChange={(e) => setSelectedWorkspace({...selectedWorkspace, default_language: e.target.value})} className="mt-1 block w-full rounded-lg border-gray-300 bg-white p-2.5 text-sm border outline-none focus:border-[#3C48F6]">
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </label>
                   </div>
                </div>

                {/* Platforms */}
                <div>
                   <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100"><FiLayout className="text-gray-400"/> Default Platforms</h3>
                   <div className="flex gap-4">
                      {[
                        { id: 'twitter', icon: FaTwitter, color: 'text-sky-500' },
                        { id: 'linkedin', icon: FaLinkedin, color: 'text-blue-700' },
                        { id: 'instagram', icon: FaInstagram, color: 'text-pink-600' },
                        { id: 'facebook', icon: FaFacebook, color: 'text-blue-600' }
                      ].map((p) => {
                        const isSelected = (selectedWorkspace.default_platforms || []).includes(p.id);
                        return (
                          <button key={p.id} onClick={() => togglePlatform(p.id)} className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[#3C48F6] bg-blue-50 ring-2 ring-blue-100 ring-offset-2' : 'border-gray-200 bg-white grayscale hover:grayscale-0'}`}>
                            <p.icon className={`w-5 h-5 ${p.color}`} />
                          </button>
                        )
                      })}
                   </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="lg:col-span-5 space-y-8">
                 <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4"><FiBell className="text-gray-400"/> Notifications</h3>
                    <div className="space-y-4">
                       <ToggleRow label="Publish Alerts" desc="When a post goes live." active={selectedWorkspace.notify_on_publish} onClick={() => toggleSetting('notify_on_publish')} />
                       <ToggleRow label="Failure Alerts" desc="If an API error occurs." active={selectedWorkspace.notify_on_failure} onClick={() => toggleSetting('notify_on_failure')} />
                       <ToggleRow label="Weekly Report" desc="Email analytics summary." active={selectedWorkspace.weekly_report} onClick={() => toggleSetting('weekly_report')} />
                    </div>
                 </div>

                 <div className="space-y-3">
                   <button onClick={handleSubmit} disabled={isSaving} className="w-full bg-[#3C48F6] text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-transform active:scale-95 flex justify-center items-center gap-2">
                      {isSaving && <FiLoader className="animate-spin"/>} Save Changes
                   </button>
                   
                   {view === 'edit' && (
                     <button onClick={() => { setItemToDelete(selectedWorkspace as Workspace); setDeleteModalOpen(true); }} className="w-full bg-white border border-red-100 text-red-500 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                       <FiTrash2 /> Delete Workspace
                     </button>
                   )}
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- RECYCLE BIN (Fixed Bottom) --- */}
      <motion.div
        ref={trashRef}
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: isDragging ? 0 : 100, 
          opacity: isDragging ? 1 : 0,
          scale: trashHovered ? 1.1 : 1
        }}
        onMouseEnter={() => setTrashHovered(true)}
        onMouseLeave={() => setTrashHovered(false)}
        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-40 w-72 h-20 rounded-2xl border-2 flex items-center justify-center gap-3 backdrop-blur-md transition-colors duration-200
          ${trashHovered ? 'bg-red-100 border-red-500 text-red-600 shadow-2xl shadow-red-500/20' : 'bg-white/80 border-gray-300 text-gray-400 shadow-xl'}`}
      >
        <FiTrash2 className={`w-8 h-8 ${trashHovered ? 'animate-bounce' : ''}`} />
        <span className="font-bold text-sm">
          {trashHovered ? 'Release to Delete' : 'Drag here to delete'}
        </span>
      </motion.div>

      {/* --- CUSTOM DANGER MODAL --- */}
      <AnimatePresence>
        {deleteModalOpen && itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setDeleteModalOpen(false)}
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative z-10 overflow-hidden border border-gray-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                  <FiAlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Workspace?</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Are you sure you want to delete <span className="font-bold text-gray-900">"{itemToDelete.name}"</span>? <br/>
                  All projects and members will be permanently removed.
                </p>
                
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button 
                    onClick={() => setDeleteModalOpen(false)}
                    className="py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                  >
                    {isSaving ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Helper for Toggles
function ToggleRow({ label, desc, active, onClick }: any) {
  return (
    <div className="flex items-center justify-between">
       <div>
         <p className="text-sm font-medium text-gray-900">{label}</p>
         <p className="text-xs text-gray-500">{desc}</p>
       </div>
       <button 
         onClick={onClick}
         className={`w-11 h-6 rounded-full relative transition-colors duration-200 ease-in-out ${active ? 'bg-[#3C48F6]' : 'bg-gray-300'}`}
       >
         <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
       </button>
    </div>
  )
}