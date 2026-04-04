'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/src/lib/api';
import ConnectAccounts from './ConnectAccounts';

import {
  FiUser, FiShield, FiBell, FiUsers, FiCreditCard,
  FiTrash2, FiSave, FiBriefcase, FiGlobe, FiImage, FiUploadCloud, FiLoader, FiDatabase,
  FiCheck, FiZap, FiStar, FiTrendingUp, FiMail, FiSmartphone, FiToggleLeft, FiToggleRight
} from 'react-icons/fi';
import MediaGallery from './MediaGallery';

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

// --- SETTINGS TAB BUTTON (outside to avoid component-in-render) ---
function TabBtn({ tab, activeTab, setActiveTab }: { tab: { id: SettingsTab; label: string; icon: React.ReactNode }; activeTab: SettingsTab; setActiveTab: (t: SettingsTab) => void }) {
  return (
    <button
      onClick={() => setActiveTab(tab.id)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 text-xs font-black uppercase border-2 border-black dark:border-white transition-all duration-150",
        activeTab === tab.id
          ? "bg-[#3C48F5] text-white border-[#3C48F5] shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff]"
          : "bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:translate-x-0.5"
      )}
    >
      <span>{tab.icon}</span>
      {tab.label}
    </button>
  );
}

// --- MAIN SETTINGS COMPONENT ---
export default function Settings({ workspaceId, workspaceName }: { workspaceId: string, workspaceName?: string }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const ACCOUNT_TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <FiUser size={15} /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell size={15} /> },
    { id: 'billing', label: 'Billing', icon: <FiCreditCard size={15} /> },
  ];
  const WORKSPACE_TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'workspace', label: 'General', icon: <FiBriefcase size={15} /> },
    { id: 'account', label: 'Connections', icon: <FiShield size={15} /> },
    { id: 'storage', label: 'Storage', icon: <FiDatabase size={15} /> },
    { id: 'team', label: 'Members', icon: <FiUsers size={15} /> },
  ];

  const activeLabel = [...ACCOUNT_TABS, ...WORKSPACE_TABS].find(t => t.id === activeTab)?.label || '';

  return (
    <div className="font-sans text-black dark:text-white transition-colors">
      {/* Page Header */}
      <div className="mb-8 pb-6 border-b-2 border-black dark:border-white flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase text-gray-400 dark:text-zinc-500 tracking-widest mb-1">Settings</p>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">{activeLabel}</h1>
        </div>
        {workspaceName && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
            <div className="w-2 h-2 bg-[#3C48F5]" />
            <span className="text-[10px] font-black uppercase text-black dark:text-white truncate max-w-[140px]">{workspaceName}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-56 flex-shrink-0 space-y-6">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-2 px-1">Account</p>
            <nav className="space-y-1">
              {ACCOUNT_TABS.map(tab => <TabBtn key={tab.id} tab={tab} activeTab={activeTab} setActiveTab={setActiveTab} />)}
            </nav>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-2 px-1">Workspace</p>
            <nav className="space-y-1">
              {WORKSPACE_TABS.map(tab => <TabBtn key={tab.id} tab={tab} activeTab={activeTab} setActiveTab={setActiveTab} />)}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 space-y-8">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'workspace' && <WorkspaceSettings workspaceId={workspaceId} initialName={workspaceName || ''} />}
          {activeTab === 'account' && <div className="animate-in fade-in duration-300"><ConnectAccounts workspaceId={workspaceId} /></div>}
          {activeTab === 'storage' && <div className="animate-in fade-in duration-300"><MediaGallery /></div>}
          {activeTab === 'notifications' && <NotificationsSettings />}
          {activeTab === 'team' && <MembersSettings workspaceId={workspaceId} />}
          {activeTab === 'billing' && <BillingSettings />}
        </main>
      </div>
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

  if (!user) return (
    <div className="space-y-8 animate-pulse">
      <NeuCard title="Public Profile">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="w-28 h-28 bg-gray-200 dark:bg-zinc-700 border-2 border-black dark:border-white flex-shrink-0" />
          <div className="flex-1 space-y-4 w-full max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 dark:bg-zinc-700 border-2 border-black dark:border-white" />
              <div className="h-10 bg-gray-200 dark:bg-zinc-700 border-2 border-black dark:border-white" />
            </div>
            <div className="h-10 bg-gray-200 dark:bg-zinc-700 border-2 border-black dark:border-white" />
            <div className="h-10 w-1/2 bg-gray-200 dark:bg-zinc-700 border-2 border-black dark:border-white ml-auto" />
          </div>
        </div>
      </NeuCard>
      <NeuCard title="Account Security">
        <div className="max-w-lg space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-zinc-700 border-2 border-black dark:border-white" />
          <div className="h-12 bg-gray-200 dark:bg-zinc-700 border-2 border-black dark:border-white" />
        </div>
      </NeuCard>
    </div>
  );

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

// --- NOTIFICATIONS ROW (declared outside to avoid re-mount on each render) ---
type NotifPrefs = {
  emailPostPublished: boolean; emailPostFailed: boolean; emailWeeklyReport: boolean;
  emailTeamInvite: boolean; pushNewComment: boolean; pushScheduleReminder: boolean; pushPlatformAlert: boolean;
};
function NotifRow({ label, desc, value, onToggle }: { label: string; desc: string; value: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-dashed border-gray-200 dark:border-zinc-700 last:border-0">
      <div>
        <p className="text-sm font-black uppercase text-black dark:text-white">{label}</p>
        <p className="text-xs font-mono text-gray-500 dark:text-zinc-400">{desc}</p>
      </div>
      <button onClick={onToggle} className="flex-shrink-0 ml-4">
        {value
          ? <FiToggleRight size={28} className="text-[#3C48F5]" />
          : <FiToggleLeft size={28} className="text-gray-300 dark:text-zinc-600" />}
      </button>
    </div>
  );
}

// --- SUB-COMPONENT: NOTIFICATIONS SETTINGS ---
function NotificationsSettings() {
  const [prefs, setPrefs] = useState<NotifPrefs>({
    emailPostPublished: true, emailPostFailed: true, emailWeeklyReport: false,
    emailTeamInvite: true, pushNewComment: true, pushScheduleReminder: true, pushPlatformAlert: true,
  });
  const [saving, setSaving] = useState(false);

  const toggle = (key: keyof NotifPrefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    toast.success("NOTIFICATION_PREFS_SAVED");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <NeuCard title="Email Notifications" description="MESSAGES SENT TO YOUR REGISTERED EMAIL">
        <div className="space-y-0">
          <NotifRow label="Post Published" desc="When a scheduled post goes live" value={prefs.emailPostPublished} onToggle={() => toggle('emailPostPublished')} />
          <NotifRow label="Post Failed" desc="When a post fails to publish" value={prefs.emailPostFailed} onToggle={() => toggle('emailPostFailed')} />
          <NotifRow label="Weekly Report" desc="Summary of performance every Monday" value={prefs.emailWeeklyReport} onToggle={() => toggle('emailWeeklyReport')} />
          <NotifRow label="Team Invite" desc="When someone joins your workspace" value={prefs.emailTeamInvite} onToggle={() => toggle('emailTeamInvite')} />
        </div>
      </NeuCard>
      <NeuCard title="Push Notifications" description="IN-APP ALERTS">
        <div className="space-y-0">
          <NotifRow label="New Comment" desc="When someone replies to your post" value={prefs.pushNewComment} onToggle={() => toggle('pushNewComment')} />
          <NotifRow label="Schedule Reminder" desc="15 min before a scheduled post" value={prefs.pushScheduleReminder} onToggle={() => toggle('pushScheduleReminder')} />
          <NotifRow label="Platform Alert" desc="OAuth expiry or platform errors" value={prefs.pushPlatformAlert} onToggle={() => toggle('pushPlatformAlert')} />
        </div>
      </NeuCard>
      <div className="flex justify-end">
        <NeuButton onClick={handleSave} disabled={saving} icon={<FiSave />}>
          {saving ? 'SAVING...' : 'SAVE_PREFERENCES'}
        </NeuButton>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: MEMBERS SETTINGS ---
function MembersSettings({ workspaceId }: { workspaceId: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>(`/workspace-members?workspaceId=${workspaceId}`)
      .then(res => setMembers(Array.isArray(res) ? res : (res as any)?.data || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  const ACTIVITY_LABELS: Record<string, string> = {
    OWNER: 'Managing workspace',
    ADMIN: 'Admin controls',
    EDITOR: 'Editing content',
    VIEWER: 'Viewing dashboard',
  };

  const ROLE_COLOR: Record<string, string> = {
    OWNER: 'bg-[#3C48F5] text-white',
    ADMIN: 'bg-black dark:bg-white text-white dark:text-black',
    EDITOR: 'bg-yellow-400 text-black',
    VIEWER: 'bg-gray-100 dark:bg-zinc-700 text-black dark:text-white',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <NeuCard title="Workspace Members" description={`${members.length} MEMBER${members.length !== 1 ? 'S' : ''} IN THIS WORKSPACE`}>
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[0,1,2].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 border-2 border-black dark:border-white">
                <div className="w-10 h-10 bg-gray-200 dark:bg-zinc-700 border-2 border-black dark:border-white flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-gray-200 dark:bg-zinc-700" />
                  <div className="h-2 w-48 bg-gray-100 dark:bg-zinc-800" />
                </div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-zinc-700" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-zinc-700">
            <FiUsers size={32} className="mx-auto mb-3 text-gray-300 dark:text-zinc-700" />
            <p className="text-xs font-black uppercase text-gray-400">No_Members_Yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((m: any) => {
              const initials = (m.user?.firstName?.[0] || '') + (m.user?.lastName?.[0] || '') || m.user?.email?.[0]?.toUpperCase() || '?';
              const activity = ACTIVITY_LABELS[m.role] || 'Active';
              return (
                <div key={m.id} className="flex items-center gap-4 p-4 border-2 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                  <div className="w-10 h-10 border-2 border-black dark:border-white bg-white dark:bg-zinc-700 flex items-center justify-center font-black uppercase text-sm text-black dark:text-white flex-shrink-0">
                    {m.user?.avatar
                      ? <img src={m.user.avatar} className="w-full h-full object-cover" alt="" />
                      : initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black uppercase text-black dark:text-white truncate">
                      {m.user?.firstName || ''} {m.user?.lastName || ''}{(!m.user?.firstName && !m.user?.lastName) ? (m.user?.email || 'Unknown') : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      <p className="text-[10px] font-mono text-gray-500 dark:text-zinc-400 truncate">{activity} · {m.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={cn("px-2 py-1 text-[10px] font-black uppercase border border-black dark:border-white", ROLE_COLOR[m.role] || ROLE_COLOR.VIEWER)}>
                      {m.role}
                    </span>
                    {m.role !== 'OWNER' && (
                      <button
                        onClick={async () => {
                          if (!confirm(`Remove ${m.user?.email}?`)) return;
                          await api.delete(`/workspace-members/${m.id}`);
                          setMembers(prev => prev.filter(x => x.id !== m.id));
                          toast.success("MEMBER_REMOVED");
                        }}
                        className="p-1.5 border-2 border-black dark:border-white text-black dark:text-white hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                        title="Remove member"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </NeuCard>
    </div>
  );
}

// --- SUB-COMPONENT: BILLING SETTINGS ---
function BillingSettings() {
  const USAGE = [
    { label: 'Scheduled Posts', used: 3, limit: 10, unit: 'posts' },
    { label: 'Social Accounts', used: 2, limit: 2, unit: 'accounts' },
    { label: 'Media Storage', used: 18, limit: 100, unit: 'MB' },
    { label: 'Team Members', used: 1, limit: 1, unit: 'members' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Current Plan Banner */}
      <NeuCard title="Subscription" description="YOUR CURRENT PLAN & BILLING CYCLE">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-black dark:bg-white border-2 border-black dark:border-white flex items-center justify-center shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
              <FiZap size={24} className="text-white dark:text-black" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <p className="text-2xl font-black uppercase text-black dark:text-white">Free</p>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white">Active</span>
              </div>
              <p className="text-xs font-mono text-gray-500 dark:text-zinc-400">No billing cycle · Upgrade anytime</p>
            </div>
          </div>
          <NeuButton onClick={() => window.location.href = '/pricing'} icon={<FiZap />}>
            Upgrade_Plan
          </NeuButton>
        </div>
      </NeuCard>

      {/* Usage Meters */}
      <NeuCard title="Usage" description="CURRENT PERIOD CONSUMPTION">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {USAGE.map((u) => {
            const pct = Math.min(Math.round((u.used / u.limit) * 100), 100);
            const isNearLimit = pct >= 80;
            return (
              <div key={u.label}>
                <div className="flex justify-between text-xs font-black uppercase mb-2">
                  <span className="text-black dark:text-white">{u.label}</span>
                  <span className={isNearLimit ? 'text-red-500' : 'text-gray-500 dark:text-zinc-400'}>
                    {u.used} / {u.limit} {u.unit}
                  </span>
                </div>
                <div className="h-3 border-2 border-black dark:border-white bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={cn("h-full transition-all", isNearLimit ? "bg-red-500" : "bg-[#3C48F5]")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </NeuCard>

      {/* Payment Method */}
      <NeuCard title="Payment Method" description="HOW YOU PAY FOR YOUR SUBSCRIPTION">
        <div className="flex items-center justify-between flex-wrap gap-4 py-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 border-2 border-black dark:border-white bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
              <FiCreditCard size={16} className="text-gray-400 dark:text-zinc-500" />
            </div>
            <p className="text-sm font-mono text-gray-400 dark:text-zinc-500 uppercase">No payment method on file</p>
          </div>
          <NeuButton variant="secondary" icon={<FiCreditCard />} onClick={() => toast.info("Stripe billing portal coming soon")}>
            Add_Card
          </NeuButton>
        </div>
      </NeuCard>

      {/* Invoice History */}
      <NeuCard title="Invoice History" description="PAST TRANSACTIONS & RECEIPTS">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b-2 border-black dark:border-white">
                <th className="text-left py-2 pr-4 font-black uppercase text-black dark:text-white">Date</th>
                <th className="text-left py-2 pr-4 font-black uppercase text-black dark:text-white">Description</th>
                <th className="text-left py-2 pr-4 font-black uppercase text-black dark:text-white">Amount</th>
                <th className="text-left py-2 font-black uppercase text-black dark:text-white">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="py-10 text-center">
                  <FiCreditCard size={28} className="mx-auto mb-2 text-gray-200 dark:text-zinc-700" />
                  <p className="text-[10px] font-black uppercase text-gray-300 dark:text-zinc-600">No_Invoices_Yet</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </NeuCard>
    </div>
  );
}