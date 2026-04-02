'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/src/lib/api'; // Use our robust client for Profile/Workspace too
import ConnectAccounts from './ConnectAccounts'; // 🟢 The new component we built

import {
  FiUser, FiShield, FiBell, FiUsers, FiCreditCard,
  FiTrash2, FiSave, FiBriefcase, FiGlobe, FiImage, FiUploadCloud, FiLoader, FiDatabase // ➤ Added FiDatabase
} from 'react-icons/fi';
import MediaGallery from './MediaGallery'; // ➤ Import MediaGallery for Storage tab

// --- CONFIG ---
type SettingsTab = 'profile' | 'workspace' | 'account' | 'notifications' | 'team' | 'billing' | 'storage'; // ➤ Added storage

// --- NEU COMPONENTS (Reused) ---
const NeuCard = ({ title, description, children, className = "" }: any) => (
  <div className={cn("bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] p-0 overflow-hidden", className)}>
    {(title || description) && (
        <div className="px-6 py-4 border-b-2 border-black dark:border-white bg-white dark:bg-zinc-800">
            {title && <h3 className="text-lg font-black uppercase tracking-tight text-black dark:text-white">{title}</h3>}
            {description && <p className="text-xs font-mono text-gray-600 dark:text-zinc-400 mt-1">{description}</p>}
        </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const NeuButton = ({ children, onClick, className = "", variant = "primary", disabled = false, icon }: any) => {
  const baseStyles = "relative font-bold text-sm transition-all duration-150 border-2 border-black dark:border-white disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 px-4 py-2 uppercase";
  const variants = {
    primary: "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-y-[2px] active:shadow-none",
    secondary: "bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-yellow-100 dark:hover:bg-zinc-800 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-y-[2px] active:shadow-none",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] active:translate-y-[2px] active:shadow-none"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={cn(baseStyles, variants[variant as keyof typeof variants] || variants.primary, className)}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

const NeuInput = ({ label, type = "text", value, onChange, disabled, placeholder }: any) => (
    <div className="w-full">
        {label && <label className="block text-xs font-black uppercase mb-1 text-black dark:text-white">{label}</label>}
        <input 
            type={type} 
            value={value} 
            onChange={onChange} 
            disabled={disabled} 
            placeholder={placeholder}
            className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border-2 border-black dark:border-white font-mono text-sm focus:outline-none focus:bg-yellow-50 dark:focus:bg-zinc-700 focus:shadow-[4px_4px_0px_0px_#000] dark:focus:shadow-[4px_4px_0px_0px_#fff] transition-all disabled:bg-zinc-200 dark:disabled:bg-zinc-900 disabled:text-gray-500 dark:disabled:text-zinc-600 placeholder:text-gray-400 dark:placeholder:text-zinc-600 text-black dark:text-white"
        />
    </div>
);

// --- MAIN SETTINGS COMPONENT ---
export default function Settings({ workspaceId, workspaceName }: { workspaceId: string, workspaceName?: string }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <FiUser size={16} /> },
    { id: 'workspace', label: 'Workspace', icon: <FiBriefcase size={16} /> },
    { id: 'account', label: 'Connections', icon: <FiShield size={16} /> },
    { id: 'storage', label: 'Storage', icon: <FiDatabase size={16} /> }, // ➤ New Tab
    { id: 'notifications', label: 'Notifications', icon: <FiBell size={16} /> },
    { id: 'team', label: 'Members', icon: <FiUsers size={16} /> },
    { id: 'billing', label: 'Billing', icon: <FiCreditCard size={16} /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 font-sans text-black dark:text-white transition-colors">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-black uppercase border-2 border-black dark:border-white transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-[#3C48F6] text-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] -translate-x-0.5"
                    : "bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:translate-x-1"
                )}
              >
                <span className={activeTab === tab.id ? 'text-white' : 'text-black dark:text-white'}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 space-y-8">
            
            {/* 1. PROFILE TAB */}
            {activeTab === 'profile' && <ProfileSettings />}
            
            {/* 2. WORKSPACE TAB */}
            {activeTab === 'workspace' && <WorkspaceSettings workspaceId={workspaceId} initialName={workspaceName || ''} />}
            
            {/* 3. CONNECTIONS TAB (Fixed) */}
            {activeTab === 'account' && (
                <div className="animate-in fade-in duration-300">
                    {/* 🟢 THIS USES YOUR NEW REACT QUERY COMPONENT */}
                    <ConnectAccounts workspaceId={workspaceId} />
                </div>
            )}

            {/* 🟢 STORAGE TAB */}
            {activeTab === 'storage' && (
                <div className="animate-in fade-in duration-300">
                    <MediaGallery />
                </div>
            )}            
            {/* Placeholders */}
            {activeTab === 'notifications' && <NeuCard title="Notifications"><div className="text-center p-8 font-bold text-gray-400">MODULE_NOT_LOADED</div></NeuCard>}
            {activeTab === 'team' && <NeuCard title="Team Management"><div className="text-center p-8 font-bold text-gray-400">MODULE_NOT_LOADED</div></NeuCard>}
            {activeTab === 'billing' && <NeuCard title="Billing & Plans"><div className="text-center p-8 font-bold text-gray-400">MODULE_NOT_LOADED</div></NeuCard>}
        </main>
    </div>
  );
}

// --- SUB-COMPONENT: WORKSPACE SETTINGS ---
function WorkspaceSettings({ workspaceId, initialName }: { workspaceId: string, initialName: string }) {
    const [formData, setFormData] = useState({
        name: initialName,
        description: '',
        website: '',
        logo: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // Fetch details on mount
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await api.get<any>(`/workspaces/${workspaceId}`);
                setFormData({
                    name: data.name || '',
                    description: data.description || '',
                    website: data.website || '',
                    logo: data.logo || ''
                });
            } catch (e) { console.error("Workspace fetch error", e); }
        };
        if(workspaceId) fetchDetails();
    }, [workspaceId]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        try {
            const data = await api.upload<any>('/media/upload', uploadFormData);
            const logoUrl = data.media?.url || data.url || data.secure_url;
            setFormData(prev => ({ ...prev, logo: logoUrl })); 
            toast.success("LOGO_UPLOADED");
        } catch (err: any) { toast.error("UPLOAD_ERROR"); } finally { setUploading(false); }
    };

    const handleUpdate = async () => {
        if (!formData.name.trim()) return toast.error("NAME_REQUIRED");
        setLoading(true);
        try {
            await api.patch(`/workspaces/${workspaceId}`, {
                ...formData,
                website: formData.website.trim() === "" ? undefined : formData.website
            });
            toast.success("WORKSPACE_UPDATED");
        } catch (e: any) { toast.error("UPDATE_FAILED"); } finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!confirm("CONFIRM DELETION?")) return;
        setLoading(true);
        try {
            await api.delete(`/workspaces/${workspaceId}`);
            toast.success("WORKSPACE_DELETED");
            window.location.href = '/dashboard'; 
        } catch (e) { toast.error("DELETE_FAILED"); } finally { setLoading(false); }
    };

    return (
        <div className="space-y-8">
            <NeuCard title="Brand Settings" description="CONFIGURE YOUR WORKSPACE IDENTITY">
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-black uppercase mb-2 text-black dark:text-white">Workspace Logo</label>
                        <div className="flex items-start gap-6">
                            <div className="relative w-24 h-24 border-2 border-black dark:border-white bg-gray-100 dark:bg-zinc-800 shrink-0 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                                {formData.logo ? (
                                    <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-zinc-600"><FiImage size={24} /></div>
                                )}
                                {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white"><FiLoader className="animate-spin" /></div>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                                <NeuButton variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}><FiUploadCloud /> UPLOAD_LOGO</NeuButton>
                                <p className="text-xs font-mono text-gray-500 dark:text-zinc-400 max-w-[200px]">Max 2MB. Recommended 500x500.</p>
                            </div>
                        </div>
                    </div>
                    <NeuInput label="Workspace Name" value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Digital Agency" />
                    <div>
                        <label className="block text-xs font-black uppercase mb-1 text-black dark:text-white">Description</label>
                        <textarea value={formData.description} onChange={(e:any) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border-2 border-black dark:border-white font-mono text-sm focus:outline-none focus:bg-yellow-50 dark:focus:bg-zinc-700 focus:shadow-[4px_4px_0px_0px_#000] dark:focus:shadow-[4px_4px_0px_0px_#fff] transition-all min-h-[100px] resize-none placeholder:text-gray-400 dark:placeholder:text-zinc-600 text-black dark:text-white" placeholder="e.g. We help local businesses grow." />
                    </div>
                    <div className="relative">
                        <NeuInput label="Website URL" value={formData.website} onChange={(e:any) => setFormData({...formData, website: e.target.value})} placeholder="https://easy.cm" />
                        <div className="absolute top-7 right-3 text-gray-400 dark:text-zinc-600 pointer-events-none"><FiGlobe /></div>
                    </div>
                    <div className="flex justify-end pt-4 border-t-2 border-dashed border-gray-200 dark:border-zinc-700">
                        <NeuButton onClick={handleUpdate} disabled={loading || uploading} icon={<FiSave />}>{loading ? 'SAVING...' : 'SAVE_CHANGES'}</NeuButton>
                    </div>
                </div>
            </NeuCard>
            <NeuCard title="Danger Zone" description="IRREVERSIBLE ACTIONS" className="border-red-500 dark:border-red-600">
                <div className="flex justify-between items-center">
                    <div><h4 className="font-black text-black dark:text-white uppercase">ARCHIVE WORKSPACE</h4><p className="text-xs text-gray-500 dark:text-zinc-400 font-mono">THIS WILL HIDE THE WORKSPACE FROM YOUR LIST.</p></div>
                    <NeuButton variant="secondary" onClick={handleDelete} disabled={loading} icon={<FiTrash2 />}>DELETE</NeuButton>
                </div>
            </NeuCard>
        </div>
    );
}

// --- SUB-COMPONENT: PROFILE SETTINGS ---
function ProfileSettings() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', avatar: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.get<any>('/auth/profile');
        setUser(data);
        setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            avatar: data.avatar || ''
        });
      } catch (e) { console.error(e); }
    };
    fetchUser();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      try {
          const data = await api.upload<any>('/media/upload', uploadFormData);
          const avatarUrl = data.media?.url || data.url || data.secure_url;
          setFormData(prev => ({ ...prev, avatar: avatarUrl })); 
          toast.success("AVATAR_UPLOADED");
      } catch (err: any) { toast.error("UPLOAD_ERROR"); } finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
        await api.patch(`/users/${user.id}`, formData);
        toast.success("PROFILE_UPDATED");
    } catch (e) { toast.error("UPDATE_FAILED"); } finally { setLoading(false); }
  };

  if (!user) return <div className="p-8 text-center font-mono animate-pulse text-black dark:text-white uppercase transition-colors">LOADING_PROFILE...</div>;

  return (
    <div className="space-y-8">
      <NeuCard title="Public Profile" description="VISIBLE TO TEAM MEMBERS">
        <div className="flex flex-col md:flex-row items-start gap-8 transition-colors">
          <div className="flex-shrink-0 flex flex-col items-center gap-3">
            <div className="relative w-28 h-28 border-2 border-black dark:border-white bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-black dark:text-white text-4xl font-black shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] overflow-hidden group transition-all">
               {formData.avatar ? <img src={formData.avatar} className="w-full h-full object-cover" /> : (formData.firstName ? <span>{formData.firstName.charAt(0).toUpperCase()}</span> : <FiUser size={40} strokeWidth={1.5} />)}
               {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white"><FiLoader className="animate-spin text-2xl" /></div>}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
            <NeuButton variant="secondary" onClick={() => fileInputRef.current?.click()} className="text-[10px] py-1 px-2 h-auto" disabled={uploading}>CHANGE_PHOTO</NeuButton>
          </div>
          <div className="flex-1 space-y-4 w-full max-w-lg">
             <div className="grid grid-cols-2 gap-4">
                 <NeuInput label="First Name" value={formData.firstName} onChange={(e:any) => setFormData({...formData, firstName: e.target.value})} />
                 <NeuInput label="Last Name" value={formData.lastName} onChange={(e:any) => setFormData({...formData, lastName: e.target.value})} />
             </div>
             <NeuInput label="Phone Number" value={formData.phone} onChange={(e:any) => setFormData({...formData, phone: e.target.value})} placeholder="+237..." />
          </div>
        </div>
        <div className="mt-8 flex justify-end pt-4 border-t-2 border-dashed border-gray-200 dark:border-zinc-700">
            <NeuButton onClick={handleSave} disabled={loading || uploading} className="px-8" icon={<FiSave />}>{loading ? 'SAVING...' : 'SAVE_CHANGES'}</NeuButton>
        </div>
      </NeuCard>
      <NeuCard title="Account Security" description="USED FOR LOGIN & ALERTS">
         <div className="max-w-lg space-y-4">
             <NeuInput label="Email Address" value={formData.email} disabled type="email" />
             <div className="flex items-center justify-between p-3 border-2 border-black dark:border-white bg-gray-50 dark:bg-zinc-800 transition-colors">
                 <div className="text-sm text-black dark:text-white uppercase"><p className="font-bold">Email Verified</p><p className="text-xs font-mono opacity-70">MANAGED_BY_PROVIDER</p></div>
                 <div className="bg-black dark:bg-white text-white dark:text-black p-1 border-2 border-black dark:border-white transition-colors"><FiShield /></div>
             </div>
         </div>
      </NeuCard>
    </div>
  );
}