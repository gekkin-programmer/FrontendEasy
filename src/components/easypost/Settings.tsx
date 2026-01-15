'use client';
import React, { useState, useEffect, useRef } from 'react';
import ConnectAccounts from './ConnectAccounts';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  FiUser, FiShield, FiBell, FiMonitor, FiUsers, FiCreditCard,
  FiTrash2, FiSave, FiBriefcase, FiGlobe, FiImage, FiUploadCloud, FiLoader
} from 'react-icons/fi';

// 🚀 LIVE BACKEND URL
const API_URL = 'https://easypostv2.onrender.com/api'; 

type SettingsTab = 'profile' | 'workspace' | 'account' | 'notifications' | 'team' | 'billing';

// --- NEU COMPONENTS ---
const NeuCard = ({ title, description, children, className = "" }: any) => (
  <div className={cn("bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000] p-0 overflow-hidden", className)}>
    {(title || description) && (
        <div className="px-6 py-4 border-b-2 border-black bg-yellow-50">
            {title && <h3 className="text-lg font-black uppercase tracking-tight">{title}</h3>}
            {description && <p className="text-xs font-mono text-gray-600 mt-1">{description}</p>}
        </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const NeuButton = ({ children, onClick, className = "", variant = "primary", disabled = false, icon }: any) => {
  const baseStyles = "relative font-bold text-sm transition-all duration-150 border-2 border-black disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 px-4 py-2 uppercase";
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none",
    secondary: "bg-white text-black hover:bg-yellow-100 shadow-[2px_2px_0px_0px_#000] active:translate-y-[2px] active:shadow-none",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-[2px_2px_0px_0px_#000] active:translate-y-[2px] active:shadow-none"
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
        {label && <label className="block text-xs font-black uppercase mb-1">{label}</label>}
        <input 
            type={type} 
            value={value} 
            onChange={onChange} 
            disabled={disabled} 
            placeholder={placeholder}
            className="w-full px-3 py-2 bg-white border-2 border-black font-mono text-sm focus:outline-none focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_#000] transition-all disabled:bg-gray-100 disabled:text-gray-400 placeholder:text-gray-300" 
        />
    </div>
);

// --- MAIN SETTINGS COMPONENT ---
export default function Settings({ workspaceId, workspaceName = 'My Workspace' }: { workspaceId: string, workspaceName?: string }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <FiUser size={16} /> },
    { id: 'workspace', label: 'Workspace', icon: <FiBriefcase size={16} /> },
    { id: 'account', label: 'Connections', icon: <FiShield size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell size={16} /> },
    { id: 'team', label: 'Members', icon: <FiUsers size={16} /> },
    { id: 'billing', label: 'Billing', icon: <FiCreditCard size={16} /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 font-sans text-black">
        <aside className="lg:w-64 flex-shrink-0">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-black uppercase border-2 border-black transition-all duration-200 ${activeTab === tab.id ? 'bg-[#3C48F6] text-white shadow-[4px_4px_0px_0px_#000] translate-x-[-2px]' : 'bg-white text-black hover:bg-yellow-100 hover:translate-x-1'}`}>
                <span className={activeTab === tab.id ? 'text-white' : 'text-black'}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 space-y-8">
            {/* 1. PROFILE TAB */}
            {activeTab === 'profile' && <ProfileSettings />}
            
            {/* 2. WORKSPACE TAB */}
            {activeTab === 'workspace' && <WorkspaceSettings workspaceId={workspaceId} initialName={workspaceName} />}
            
            {/* 3. ACCOUNT TAB */}
            {activeTab === 'account' && <NeuCard title="Connected Accounts" description="MANAGE SOCIAL MEDIA"><ConnectAccounts /></NeuCard>}
            
            {/* Placeholders */}
            {activeTab === 'notifications' && <div className="text-center p-8 bg-white border-2 border-black font-bold">NOTIFICATIONS_COMING_SOON</div>}
            {activeTab === 'team' && <div className="text-center p-8 bg-white border-2 border-black font-bold">TEAM_COMING_SOON</div>}
            {activeTab === 'billing' && <div className="text-center p-8 bg-white border-2 border-black font-bold">BILLING_COMING_SOON</div>}
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
    const [fetching, setFetching] = useState(true);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            const token = localStorage.getItem('accessToken');
            try {
                const res = await fetch(`${API_URL}/workspaces/${workspaceId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if(res.ok) {
                    const data = await res.json();
                    setFormData({
                        name: data.name || '',
                        description: data.description || '',
                        website: data.website || '',
                        logo: data.logo || ''
                    });
                }
            } catch (e) { console.error(e); } finally { setFetching(false); }
        };
        if(workspaceId) fetchDetails();
    }, [workspaceId]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const token = localStorage.getItem('accessToken');
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/media/upload`, { 
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: uploadFormData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Upload failed');
            const logoUrl = data.media?.url || data.url || data.secure_url;
            if (!logoUrl) throw new Error("No URL returned");
            setFormData(prev => ({ ...prev, logo: logoUrl })); 
            toast.success("LOGO_UPLOADED");
        } catch (err: any) { toast.error("UPLOAD_ERROR"); } finally { setUploading(false); }
    };

    const handleUpdate = async () => {
        if (!formData.name.trim()) return toast.error("Name is required");
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        const payload = { ...formData, website: formData.website.trim() === "" ? undefined : formData.website };

        try {
            const res = await fetch(`${API_URL}/workspaces/${workspaceId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Update failed');
            toast.success("WORKSPACE_UPDATED");
        } catch (e: any) { toast.error("UPDATE_FAILED"); } finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!confirm("ARE_YOU_SURE?")) return;
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`${API_URL}/workspaces/${workspaceId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Delete failed');
            toast.success("WORKSPACE_DELETED");
            window.location.href = '/dashboard'; 
        } catch (e) { toast.error("DELETE_FAILED"); } finally { setLoading(false); }
    };

    if (fetching) return <div className="p-8 text-center font-mono animate-pulse">LOADING_DATA...</div>;

    return (
        <div className="space-y-8">
            <NeuCard title="Brand Settings" description="CONFIGURE YOUR WORKSPACE IDENTITY">
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-black uppercase mb-2">Workspace Logo</label>
                        <div className="flex items-start gap-6">
                            <div className="relative w-24 h-24 border-2 border-black bg-gray-100 shrink-0 shadow-[4px_4px_0px_0px_#000]">
                                {formData.logo ? (
                                    <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400"><FiImage size={24} /></div>
                                )}
                                {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white"><FiLoader className="animate-spin" /></div>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                                <NeuButton variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}><FiUploadCloud /> UPLOAD_NEW_LOGO</NeuButton>
                                <p className="text-xs font-mono text-gray-500 max-w-[200px]">Max 2MB. Recommended 500x500.</p>
                            </div>
                        </div>
                    </div>
                    <NeuInput label="Workspace Name" value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Digital Agency" />
                    <div>
                        <label className="block text-xs font-black uppercase mb-1">Description (Optional)</label>
                        <textarea value={formData.description} onChange={(e:any) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 bg-white border-2 border-black font-mono text-sm focus:outline-none focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_#000] transition-all min-h-[100px] resize-none placeholder:text-gray-300" placeholder="e.g. We help local businesses grow." />
                    </div>
                    <div className="relative">
                        <NeuInput label="Website URL (Optional)" value={formData.website} onChange={(e:any) => setFormData({...formData, website: e.target.value})} placeholder="https://easy.cm" />
                        <div className="absolute top-7 right-3 text-gray-400 pointer-events-none"><FiGlobe /></div>
                    </div>
                    <div className="flex justify-end pt-4 border-t-2 border-dashed border-gray-200">
                        <NeuButton onClick={handleUpdate} disabled={loading || uploading} icon={<FiSave />}>{loading ? 'SAVING...' : 'SAVE_CHANGES'}</NeuButton>
                    </div>
                </div>
            </NeuCard>
            <NeuCard title="Danger Zone" description="IRREVERSIBLE ACTIONS" className="border-red-500">
                <div className="flex justify-between items-center">
                    <div><h4 className="font-black text-red-600">ARCHIVE WORKSPACE</h4><p className="text-xs text-gray-500 font-mono">THIS WILL HIDE THE WORKSPACE FROM YOUR LIST.</p></div>
                    <NeuButton variant="danger" onClick={handleDelete} disabled={loading} icon={<FiTrash2 />}>DELETE_WORKSPACE</NeuButton>
                </div>
            </NeuCard>
        </div>
    );
}

// --- SUB-COMPONENT: PROFILE SETTINGS ---
function ProfileSettings() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch User (GET /auth/profile)
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if(!token) return;
      try {
        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if(res.ok) {
            const data = await res.json();
            setUser(data);
            setFormData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                phone: data.phone || '',
                avatar: data.avatar || ''
            });
        }
      } catch (e) { console.error(e); }
    };
    fetchUser();
  }, []);

  // 2. Upload Avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      const token = localStorage.getItem('accessToken');
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      try {
          const res = await fetch(`${API_URL}/media/upload`, { 
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: uploadFormData
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Upload failed');
          const avatarUrl = data.media?.url || data.url || data.secure_url;
          if (!avatarUrl) throw new Error("No URL returned");
          setFormData(prev => ({ ...prev, avatar: avatarUrl })); 
          toast.success("AVATAR_UPLOADED");
      } catch (err: any) { toast.error("UPLOAD_ERROR"); } finally { setUploading(false); }
  };

  // 3. Update User (PATCH /users/:id)
  const handleSave = async () => {
    if (!user?.id) return;
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    try {
        const res = await fetch(`${API_URL}/users/${user.id}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(formData)
        });
        if(!res.ok) throw new Error("Failed to update");
        toast.success("PROFILE_UPDATED");
    } catch (e) { toast.error("UPDATE_FAILED"); } finally { setLoading(false); }
  };

  if (!user) return <div className="p-8 text-center font-mono animate-pulse">LOADING_PROFILE...</div>;

  return (
    <div className="space-y-8">
      <NeuCard title="Public Profile" description="VISIBLE TO TEAM MEMBERS">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0 flex flex-col items-center gap-3">
            <div className="relative w-28 h-28 border-2 border-black bg-yellow-100 flex items-center justify-center text-black text-4xl font-black shadow-[4px_4px_0px_0px_#000] overflow-hidden group">
               {formData.avatar ? (
                 <img src={formData.avatar} className="w-full h-full object-cover" />
               ) : (
                 <span>{formData.firstName ? formData.firstName.charAt(0).toUpperCase() : 'U'}</span>
               )}
               {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white"><FiLoader className="animate-spin text-2xl" /></div>}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
            <NeuButton variant="secondary" onClick={() => fileInputRef.current?.click()} className="text-[10px] py-1 px-2 h-auto" disabled={uploading}>CHANGE_PHOTO</NeuButton>
          </div>
          {/* Fields */}
          <div className="flex-1 space-y-4 w-full max-w-lg">
             <div className="grid grid-cols-2 gap-4">
                 <NeuInput label="First Name" value={formData.firstName} onChange={(e:any) => setFormData({...formData, firstName: e.target.value})} />
                 <NeuInput label="Last Name" value={formData.lastName} onChange={(e:any) => setFormData({...formData, lastName: e.target.value})} />
             </div>
             <NeuInput label="Phone Number" value={formData.phone} onChange={(e:any) => setFormData({...formData, phone: e.target.value})} placeholder="+237..." />
          </div>
        </div>
        <div className="mt-8 flex justify-end pt-4 border-t-2 border-dashed border-gray-200">
            <NeuButton onClick={handleSave} disabled={loading || uploading} className="px-8" icon={<FiSave />}>{loading ? 'SAVING...' : 'SAVE_CHANGES'}</NeuButton>
        </div>
      </NeuCard>
      <NeuCard title="Account Security" description="USED FOR LOGIN & ALERTS">
         <div className="max-w-lg space-y-4">
             <NeuInput label="Email Address" value={formData.email} disabled type="email" />
             <div className="flex items-center justify-between p-3 border-2 border-black bg-gray-50">
                 <div className="text-sm">
                    <p className="font-bold uppercase">Email Verified</p>
                    <p className="text-xs font-mono">MANAGED_BY_GOOGLE</p>
                 </div>
                 <div className="bg-black text-white p-1 border-2 border-black"><FiUser /></div>
             </div>
         </div>
      </NeuCard>
    </div>
  );
}