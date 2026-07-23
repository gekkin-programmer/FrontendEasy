'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import ConnectAccounts from './ConnectAccounts';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useLanguage } from '@/context/LanguageContext';

import {
  FiUser, FiShield, FiBell, FiUsers, FiCreditCard,
  FiTrash2, FiSave, FiBriefcase, FiGlobe, FiImage, FiUploadCloud, FiLoader, FiDatabase,
  FiCheck, FiZap, FiStar, FiTrendingUp, FiMail, FiSmartphone, FiToggleLeft, FiToggleRight,
  FiX, FiPlus, FiPhone, FiLock
} from 'react-icons/fi';
import MediaGallery from './MediaGallery';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PK
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK)
  : null;

// --- CONFIG ---
type SettingsTab = 'profile' | 'workspace' | 'account' | 'notifications' | 'team' | 'billing' | 'storage'; // ➤ Added storage

// --- NEU COMPONENTS (Reused) ---
const NeuCard = ({ title, description, children, className = "" }: any) => (
  <div className={cn("bg-white dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-[16px] p-0 overflow-hidden", className)}>
    {(title || description) && (
        <div className="px-6 py-4 border-b border-black/5 dark:border-white/5">
            {title && <h3 className="text-base font-bold text-[#040028] dark:text-white">{title}</h3>}
            {description && <p className="text-xs text-[#8E8E8E] mt-1">{description}</p>}
        </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const NeuButton = ({ children, onClick, className = "", variant = "primary", disabled = false, icon }: any) => {
  const baseStyles = "relative font-semibold text-sm transition-all duration-200 rounded-[10px] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 px-4 py-2.5";
  const variants = {
    primary: "bg-[#174CD2] text-white hover:bg-[#123a9e]",
    secondary: "bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white border border-black/10 dark:border-white/10 hover:border-[#174CD2]",
    danger: "bg-red-600 text-white hover:bg-red-700"
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
        {label && <label className="block text-xs font-semibold mb-1 text-[#040028] dark:text-white">{label}</label>}
        <input
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full px-3 py-2.5 bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 rounded-[10px] font-medium text-sm focus:outline-none focus:border-[#174CD2] focus:ring-2 focus:ring-[#174CD2]/15 transition-all disabled:bg-[#F5F7FA] dark:disabled:bg-white/5 disabled:text-[#8E8E8E] placeholder:text-[#8E8E8E] text-[#040028] dark:text-white"
        />
    </div>
);

// --- SETTINGS TAB BUTTON (outside to avoid component-in-render) ---
function TabBtn({ tab, activeTab, setActiveTab }: { tab: { id: SettingsTab; label: string; icon: React.ReactNode }; activeTab: SettingsTab; setActiveTab: (t: SettingsTab) => void }) {
  return (
    <button
      onClick={() => setActiveTab(tab.id)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-[10px] transition-all duration-200",
        activeTab === tab.id
          ? "bg-[#040028] dark:bg-white text-white dark:text-[#040028]"
          : "bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white border border-black/10 dark:border-white/10 hover:border-[#174CD2]"
      )}
    >
      <span>{tab.icon}</span>
      {tab.label}
    </button>
  );
}

// --- MAIN SETTINGS COMPONENT ---
export default function Settings({ workspaceId, workspaceName }: { workspaceId: string, workspaceName?: string }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const ACCOUNT_TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: t('Profile', 'Profil'), icon: <FiUser size={15} /> },
    { id: 'notifications', label: t('Notifications', 'Notifications'), icon: <FiBell size={15} /> },
    { id: 'billing', label: t('Billing', 'Facturation'), icon: <FiCreditCard size={15} /> },
  ];
  const WORKSPACE_TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'workspace', label: t('General', 'Général'), icon: <FiBriefcase size={15} /> },
    { id: 'account', label: t('Connections', 'Connexions'), icon: <FiShield size={15} /> },
    { id: 'storage', label: t('Storage', 'Stockage'), icon: <FiDatabase size={15} /> },
    { id: 'team', label: t('Members', 'Membres'), icon: <FiUsers size={15} /> },
  ];

  const activeLabel = [...ACCOUNT_TABS, ...WORKSPACE_TABS].find(t => t.id === activeTab)?.label || '';

  return (
    <div className="font-sans text-[#040028] dark:text-white transition-colors">
      {/* Page Header */}
      <div className="mb-8 pb-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase text-[#8E8E8E] tracking-widest mb-1">{t('Settings', 'Paramètres')}</p>
          <h1 className="text-2xl font-bold text-[#040028] dark:text-white">{activeLabel}</h1>
        </div>
        {workspaceName && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-white dark:bg-[#0A0A2E] border border-black/10 dark:border-white/10">
            <span className="text-xs font-semibold text-[#040028] dark:text-white truncate max-w-[140px]">{workspaceName}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-56 flex-shrink-0 lg:self-start lg:sticky lg:top-24 space-y-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] mb-2 px-1">{t('Account', 'Compte')}</p>
            <nav className="space-y-1">
              {ACCOUNT_TABS.map(tab => <TabBtn key={tab.id} tab={tab} activeTab={activeTab} setActiveTab={setActiveTab} />)}
            </nav>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E8E] mb-2 px-1">{t('Workspace', 'Espace de travail')}</p>
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
          {activeTab === 'storage' && <div className="animate-in fade-in duration-300"><MediaGallery workspaceId={workspaceId} /></div>}
          {activeTab === 'notifications' && <NotificationsSettings />}
          {activeTab === 'team' && <MembersSettings workspaceId={workspaceId} />}
          {activeTab === 'billing' && <BillingSettings workspaceId={workspaceId} />}
        </main>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: WORKSPACE SETTINGS ---
function WorkspaceSettings({ workspaceId, initialName }: { workspaceId: string, initialName: string }) {
    const { t } = useLanguage();
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
            toast.success(t('Logo uploaded', 'Logo téléchargé'));
        } catch (err: any) { toast.error(t('Upload error', 'Erreur de téléchargement')); } finally { setUploading(false); }
    };

    const handleUpdate = async () => {
        if (!formData.name.trim()) return toast.error(t('Name is required', 'Le nom est requis'));
        setLoading(true);
        try {
            await api.patch(`/workspaces/${workspaceId}`, {
                ...formData,
                website: formData.website.trim() === "" ? undefined : formData.website
            });
            toast.success(t('Workspace updated', 'Espace de travail mis à jour'));
        } catch (e: any) { toast.error(t('Update failed', 'Échec de la mise à jour')); } finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!confirm(t('Confirm deletion?', 'Confirmer la suppression ?'))) return;
        setLoading(true);
        try {
            await api.delete(`/workspaces/${workspaceId}`);
            toast.success(t('Workspace deleted', 'Espace de travail supprimé'));
            window.location.href = '/dashboard';
        } catch (e) { toast.error(t('Delete failed', 'Échec de la suppression')); } finally { setLoading(false); }
    };

    return (
        <div className="space-y-8">
            <NeuCard title={t('Brand settings', 'Paramètres de marque')} description={t('Configure your workspace identity', 'Configurez l\'identité de votre espace')}>
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold mb-2 text-[#040028] dark:text-white">{t('Workspace logo', 'Logo de l\'espace')}</label>
                        <div className="flex items-start gap-6">
                            <div className="relative w-24 h-24 rounded-[14px] bg-[#F5F7FA] dark:bg-white/5 shrink-0 overflow-hidden border border-black/5 dark:border-white/10">
                                {formData.logo ? (
                                    <img src={formData.logo} alt={t('Logo', 'Logo')} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#8E8E8E]"><FiImage size={24} /></div>
                                )}
                                {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white"><FiLoader className="animate-spin" /></div>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                                <NeuButton variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}><FiUploadCloud /> {t('Upload logo', 'Télécharger le logo')}</NeuButton>
                                <p className="text-xs text-[#8E8E8E] max-w-[200px]">{t('Max 2MB. Recommended 500x500.', 'Max 2 Mo. Recommandé 500x500.')}</p>
                            </div>
                        </div>
                    </div>
                    <NeuInput label={t('Workspace name', 'Nom de l\'espace')} value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} placeholder={t('e.g. Digital Agency', 'ex. Agence digitale')} />
                    <div>
                        <label className="block text-xs font-semibold mb-1 text-[#040028] dark:text-white">{t('Description', 'Description')}</label>
                        <textarea value={formData.description} onChange={(e:any) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2.5 bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 rounded-[10px] font-medium text-sm focus:outline-none focus:border-[#174CD2] focus:ring-2 focus:ring-[#174CD2]/15 transition-all min-h-[100px] resize-none placeholder:text-[#8E8E8E] text-[#040028] dark:text-white" placeholder={t('e.g. We help local businesses grow.', 'ex. Nous aidons les entreprises locales à croître.')} />
                    </div>
                    <div className="relative">
                        <NeuInput label={t('Website URL', 'URL du site web')} value={formData.website} onChange={(e:any) => setFormData({...formData, website: e.target.value})} placeholder="https://easy.cm" />
                        <div className="absolute top-7 right-3 text-[#8E8E8E] pointer-events-none"><FiGlobe /></div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-black/5 dark:border-white/5">
                        <NeuButton onClick={handleUpdate} disabled={loading || uploading} icon={<FiSave />}>{loading ? t('Saving...', 'Sauvegarde...') : t('Save changes', 'Enregistrer')}</NeuButton>
                    </div>
                </div>
            </NeuCard>
            <NeuCard title={t('Danger zone', 'Zone dangereuse')} description={t('Irreversible actions', 'Actions irréversibles')} className="border border-red-200 dark:border-red-900/40">
                <div className="flex justify-between items-center">
                    <div><h4 className="font-semibold text-[#040028] dark:text-white">{t('Archive workspace', 'Archiver l\'espace')}</h4><p className="text-xs text-[#8E8E8E]">{t('This will hide the workspace from your list.', 'Cela masquera l\'espace de votre liste.')}</p></div>
                    <NeuButton variant="danger" onClick={handleDelete} disabled={loading} icon={<FiTrash2 />}>{t('Delete', 'Supprimer')}</NeuButton>
                </div>
            </NeuCard>
        </div>
    );
}

const getAvatarUrl = (seed: string) => `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`;

// --- SUB-COMPONENT: PROFILE SETTINGS ---
function ProfileSettings() {
  const { t } = useLanguage();
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
          toast.success(t('Avatar uploaded', 'Avatar téléchargé'));
      } catch (err: any) { toast.error(t('Upload error', 'Erreur de téléchargement')); } finally { setUploading(false); }
  };

  const handleSave = async () => {
    const userId = user?.id || user?.sub;
    if (!userId) return;
    setLoading(true);
    try {
        await api.patch(`/users/${userId}`, formData);
        toast.success(t('Profile updated', 'Profil mis à jour'));
    } catch (e) { toast.error(t('Update failed', 'Échec de la mise à jour')); } finally { setLoading(false); }
  };

  if (!user) return (
    <div className="space-y-8">
      <NeuCard title={t('Public profile', 'Profil public')}>
        <div className="flex flex-col md:flex-row items-start gap-8">
          <Skeleton className="w-28 h-28 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-4 w-full max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 rounded-[10px]" />
              <Skeleton className="h-10 rounded-[10px]" />
            </div>
            <Skeleton className="h-10 rounded-[10px]" />
            <Skeleton className="h-10 w-1/2 rounded-[10px] ml-auto" />
          </div>
        </div>
      </NeuCard>
      <NeuCard title={t('Account security', 'Sécurité du compte')}>
        <div className="max-w-lg space-y-4">
          <Skeleton className="h-10 rounded-[10px]" />
          <Skeleton className="h-12 rounded-[10px]" />
        </div>
      </NeuCard>
    </div>
  );

  return (
    <div className="space-y-8">
      <NeuCard title={t('Public profile', 'Profil public')} description={t('Visible to team members', 'Visible par les membres de l\'équipe')}>
        <div className="flex flex-col md:flex-row items-start gap-8 transition-colors">
          <div className="flex-shrink-0 flex flex-col items-center gap-3">
            <div className="relative w-28 h-28 rounded-full bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 flex items-center justify-center text-[#040028] dark:text-white text-4xl font-bold overflow-hidden group transition-all">
               <img src={formData.avatar || getAvatarUrl(formData.firstName || formData.email || 'User')} className="w-full h-full object-cover" />
               {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white"><FiLoader className="animate-spin text-2xl" /></div>}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
            <NeuButton variant="secondary" onClick={() => fileInputRef.current?.click()} className="text-xs py-1.5 px-3 h-auto" disabled={uploading}>{t('Change photo', 'Changer la photo')}</NeuButton>
          </div>
          <div className="flex-1 space-y-4 w-full max-w-lg">
             <div className="grid grid-cols-2 gap-4">
                 <NeuInput label={t('First name', 'Prénom')} value={formData.firstName} onChange={(e:any) => setFormData({...formData, firstName: e.target.value})} />
                 <NeuInput label={t('Last name', 'Nom')} value={formData.lastName} onChange={(e:any) => setFormData({...formData, lastName: e.target.value})} />
             </div>
             <NeuInput label={t('Phone number', 'Numéro de téléphone')} value={formData.phone} onChange={(e:any) => setFormData({...formData, phone: e.target.value})} placeholder="+237..." />
          </div>
        </div>
        <div className="mt-8 flex justify-end pt-4 border-t border-black/5 dark:border-white/5">
            <NeuButton onClick={handleSave} disabled={loading || uploading} className="px-8 bg-[#040028] hover:bg-[#040028] dark:bg-white dark:hover:bg-white dark:text-[#040028]" icon={<FiSave />}>{loading ? t('Saving...', 'Sauvegarde...') : t('Save changes', 'Enregistrer')}</NeuButton>
        </div>
      </NeuCard>
      <NeuCard title={t('Account security', 'Sécurité du compte')} description={t('Used for login & alerts', 'Utilisé pour la connexion et les alertes')}>
         <div className="max-w-lg space-y-4">
             <NeuInput label={t('Email address', 'Adresse e-mail')} value={formData.email} disabled type="email" />
             <div className="flex items-center justify-between p-3 rounded-[10px] bg-white dark:bg-[#0A0A2E] transition-colors">
                 <div className="text-sm text-[#040028] dark:text-white"><p className="font-semibold">{t('Email verified', 'E-mail vérifié')}</p><p className="text-xs text-[#8E8E8E]">{t('Managed by provider', 'Géré par le fournisseur')}</p></div>
                 <div className="bg-[#174CD2] text-white p-2 rounded-full transition-colors"><FiShield size={14} /></div>
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
    <div className="flex items-center justify-between py-3 border-b border-black/5 dark:border-white/5 last:border-0">
      <div>
        <p className="text-sm font-semibold text-[#040028] dark:text-white">{label}</p>
        <p className="text-xs text-[#8E8E8E]">{desc}</p>
      </div>
      <button onClick={onToggle} className="flex-shrink-0 ml-4">
        {value
          ? <FiToggleRight size={28} className="text-[#174CD2]" />
          : <FiToggleLeft size={28} className="text-[#D9D9D9] dark:text-zinc-600" />}
      </button>
    </div>
  );
}

// --- SUB-COMPONENT: NOTIFICATIONS SETTINGS ---
function NotificationsSettings() {
  const { t } = useLanguage();
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
    toast.success(t('Notification preferences saved', 'Préférences de notification enregistrées'));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <NeuCard title={t('Email notifications', 'Notifications par e-mail')} description={t('Messages sent to your registered email', 'Messages envoyés à votre e-mail enregistré')}>
        <div className="space-y-0">
          <NotifRow label={t('Post published', 'Publication publiée')} desc={t('When a scheduled post goes live', 'Quand une publication programmée est mise en ligne')} value={prefs.emailPostPublished} onToggle={() => toggle('emailPostPublished')} />
          <NotifRow label={t('Post failed', 'Publication échouée')} desc={t('When a post fails to publish', 'Quand une publication échoue')} value={prefs.emailPostFailed} onToggle={() => toggle('emailPostFailed')} />
          <NotifRow label={t('Weekly report', 'Rapport hebdomadaire')} desc={t('Summary of performance every Monday', 'Résumé des performances chaque lundi')} value={prefs.emailWeeklyReport} onToggle={() => toggle('emailWeeklyReport')} />
          <NotifRow label={t('Team invite', 'Invitation d\'équipe')} desc={t('When someone joins your workspace', 'Quand quelqu\'un rejoint votre espace')} value={prefs.emailTeamInvite} onToggle={() => toggle('emailTeamInvite')} />
        </div>
      </NeuCard>
      <NeuCard title={t('Push notifications', 'Notifications push')} description={t('In-app alerts', 'Alertes dans l\'application')}>
        <div className="space-y-0">
          <NotifRow label={t('New comment', 'Nouveau commentaire')} desc={t('When someone replies to your post', 'Quand quelqu\'un répond à votre publication')} value={prefs.pushNewComment} onToggle={() => toggle('pushNewComment')} />
          <NotifRow label={t('Schedule reminder', 'Rappel de planification')} desc={t('15 min before a scheduled post', '15 min avant une publication planifiée')} value={prefs.pushScheduleReminder} onToggle={() => toggle('pushScheduleReminder')} />
          <NotifRow label={t('Platform alert', 'Alerte plateforme')} desc={t('OAuth expiry or platform errors', 'Expiration OAuth ou erreurs de plateforme')} value={prefs.pushPlatformAlert} onToggle={() => toggle('pushPlatformAlert')} />
        </div>
      </NeuCard>
      <div className="flex justify-end">
        <NeuButton onClick={handleSave} disabled={saving} icon={<FiSave />}>
          {saving ? t('Saving...', 'Sauvegarde...') : t('Save preferences', 'Enregistrer les préférences')}
        </NeuButton>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: MEMBERS SETTINGS ---
function MembersSettings({ workspaceId }: { workspaceId: string }) {
  const { t } = useLanguage();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>(`/workspace-members?workspaceId=${workspaceId}`)
      .then(res => setMembers(Array.isArray(res) ? res : (res as any)?.data || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  const ACTIVITY_LABELS: Record<string, string> = {
    OWNER: t('Managing workspace', 'Gestion de l\'espace'),
    ADMIN: t('Admin controls', 'Contrôles admin'),
    EDITOR: t('Editing content', 'Modification du contenu'),
    VIEWER: t('Viewing dashboard', 'Consultation du tableau de bord'),
  };

  const ROLE_COLOR: Record<string, string> = {
    OWNER: 'bg-[#174CD2] text-white',
    ADMIN: 'bg-[#040028] dark:bg-white text-white dark:text-[#040028]',
    EDITOR: 'bg-yellow-400 text-black',
    VIEWER: 'bg-[#F5F7FA] dark:bg-white/10 text-[#040028] dark:text-white',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <NeuCard title={t('Workspace members', 'Membres de l\'espace')} description={`${members.length} ${t('member', 'membre')}${members.length !== 1 ? t('s', 's') : ''} ${t('in this workspace', 'dans cet espace')}`}>
        {loading ? (
          <div className="space-y-3">
            {[0,1,2].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-[14px] border border-black/5 dark:border-white/5">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2 w-48" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12 rounded-[14px] border border-dashed border-black/10 dark:border-white/10">
            <FiUsers size={32} className="mx-auto mb-3 text-[#D9D9D9] dark:text-zinc-700" />
            <p className="text-xs font-semibold text-[#8E8E8E]">{t('No members yet', 'Aucun membre pour l\'instant')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((m: any) => {
              const initials = (m.user?.firstName?.[0] || '') + (m.user?.lastName?.[0] || '') || m.user?.email?.[0]?.toUpperCase() || '?';
              const activity = ACTIVITY_LABELS[m.role] || t('Active', 'Actif');
              return (
                <div key={m.id} className="flex items-center gap-4 p-4 rounded-[14px] border border-black/5 dark:border-white/5 bg-white dark:bg-[#0A0A2E] hover:border-[#174CD2]/30 transition-all">
                  <div className="w-10 h-10 rounded-full bg-[#F5F7FA] dark:bg-white/10 flex items-center justify-center font-semibold text-sm text-[#040028] dark:text-white flex-shrink-0 overflow-hidden">
                    {m.user?.avatar
                      ? <img src={m.user.avatar} className="w-full h-full object-cover" alt="" />
                      : initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#040028] dark:text-white truncate">
                      {m.user?.firstName || ''} {m.user?.lastName || ''}{(!m.user?.firstName && !m.user?.lastName) ? (m.user?.email || t('Unknown', 'Inconnu')) : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      <p className="text-[11px] text-[#8E8E8E] truncate">{activity} · {m.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={cn("px-2.5 py-1 text-[10px] font-semibold uppercase rounded-full", ROLE_COLOR[m.role] || ROLE_COLOR.VIEWER)}>
                      {m.role}
                    </span>
                    {m.role !== 'OWNER' && (
                      <button
                        onClick={async () => {
                          if (!confirm(`${t('Remove', 'Retirer')} ${m.user?.email}?`)) return;
                          await api.delete(`/workspace-members/${m.id}`);
                          setMembers(prev => prev.filter(x => x.id !== m.id));
                          toast.success(t('Member removed', 'Membre retiré'));
                        }}
                        className="p-1.5 rounded-[8px] text-[#8E8E8E] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-all"
                        title={t('Remove member', 'Retirer le membre')}
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

// --- PLAN CONFIG ---
const PLAN_LIMITS: Record<string, { posts: number; accounts: number; storageMB: number; members: number }> = {
  FREE:    { posts: 10,     accounts: 2,  storageMB: 100,   members: 1  },
  STARTER: { posts: 100,    accounts: 5,  storageMB: 1024,  members: 5  },
  PRO:     { posts: 99999,  accounts: 20, storageMB: 10240, members: 20 },
};
const PLAN_LABEL: Record<string, string> = { FREE: 'Free', STARTER: 'Starter', PRO: 'Pro' };

// --- SUB-COMPONENT: STRIPE CARD FORM ---
function StripeCardForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const { t } = useLanguage();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const { data: intentData } = await api.post<any>('/payments/methods/card/setup-intent', {}) as any;
      const result = await stripe.confirmCardSetup(intentData.clientSecret, {
        payment_method: { card: elements.getElement(CardElement)! },
      });
      if (result.error) {
        toast.error(result.error.message || t('Card error', 'Erreur de carte'));
        return;
      }
      await api.post('/payments/methods/card/confirm', {
        stripePaymentMethodId: result.setupIntent!.payment_method,
      });
      toast.success(t('Card saved', 'Carte enregistrée'));
      qc.invalidateQueries({ queryKey: ['payment-methods'] });
      onSuccess();
    } catch {
      toast.error(t('Failed to save card', 'Échec de l\'enregistrement de la carte'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 rounded-[10px] border border-[#D9D9D9] dark:border-white/10 bg-white dark:bg-white/5">
        <CardElement
          options={{
            style: {
              base: {
                fontFamily: 'Rubik, sans-serif',
                fontSize: '14px',
                color: '#040028',
                '::placeholder': { color: '#8E8E8E' },
              },
            },
          }}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-[10px] text-sm font-semibold text-[#040028] dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/5 transition-all">
          {t('Cancel', 'Annuler')}
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2.5 rounded-[10px] bg-[#174CD2] text-white text-sm font-semibold hover:bg-[#123a9e] transition-all disabled:opacity-50">
          {loading ? <FiLoader className="animate-spin" /> : t('Save card', 'Enregistrer la carte')}
        </button>
      </div>
    </form>
  );
}

// --- SUB-COMPONENT: ADD MOBILE MONEY MODAL ---
function MobileMoneyModal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  const [msisdn, setMsisdn] = useState('');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const detected = msisdn.length >= 9
    ? (msisdn.startsWith('23767') || msisdn.startsWith('23768') || /^237650|237651|237652|237653|237654/.test(msisdn)
      ? 'MTN_MOMO_CMR' : 'ORANGE_CMR')
    : null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msisdn) return;
    setLoading(true);
    try {
      await api.post('/payments/methods/mobile-money', { msisdn, label: label || undefined });
      toast.success(t('Number saved', 'Numéro enregistré'));
      qc.invalidateQueries({ queryKey: ['payment-methods'] });
      onClose();
    } catch {
      toast.error(t('Failed to save number', 'Échec de l\'enregistrement du numéro'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#040028]/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#0A0A2E] rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] w-full max-w-sm overflow-hidden">
        <div className="bg-[#174CD2] text-white px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-sm">{t('Add Mobile Money', 'Ajouter Mobile Money')}</span>
          <button onClick={onClose} className="hover:bg-white/15 rounded-full p-1 transition-colors"><FiX size={18} /></button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#040028] dark:text-white block mb-1">{t('Phone number (with country code)', 'Numéro de téléphone (avec indicatif)')}</label>
            <input
              type="tel"
              value={msisdn}
              onChange={e => setMsisdn(e.target.value.replace(/\s/g, ''))}
              placeholder={t('e.g. 237699123456', 'ex. 237699123456')}
              className="w-full rounded-[10px] border border-[#D9D9D9] dark:border-white/10 bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-[#174CD2] focus:ring-2 focus:ring-[#174CD2]/15 transition-all"
              required
            />
            {detected && (
              <div className="flex items-center gap-2 mt-2">
                {detected === 'MTN_MOMO_CMR'
                  ? <Image src="/assets/MTNmoney.png" alt="MTN" width={48} height={20} className="object-contain" />
                  : <Image src="/assets/Orangemoney.png" alt="Orange" width={48} height={20} className="object-contain" />}
                <span className="text-[10px] font-semibold uppercase text-green-600">
                  {detected === 'MTN_MOMO_CMR' ? t('MTN MoMo detected', 'MTN MoMo détecté') : t('Orange Money detected', 'Orange Money détecté')}
                </span>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-[#040028] dark:text-white block mb-1">{t('Label (optional)', 'Étiquette (optionnel)')}</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder={t('e.g. Personal Orange', 'ex. Orange personnel')}
              className="w-full rounded-[10px] border border-[#D9D9D9] dark:border-white/10 bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-[#174CD2] focus:ring-2 focus:ring-[#174CD2]/15 transition-all"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-[10px] text-sm font-semibold text-[#040028] dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/5 transition-all">{t('Cancel', 'Annuler')}</button>
            <button type="submit" disabled={loading} className="px-4 py-2.5 rounded-[10px] bg-[#174CD2] text-white text-sm font-semibold hover:bg-[#123a9e] transition-all disabled:opacity-50">
              {loading ? <FiLoader className="animate-spin" /> : t('Save', 'Enregistrer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: PAYMENT METHODS CARD ---
function PaymentMethodsCard() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);

  const { data: methods = [], isLoading } = useQuery<any[]>({
    queryKey: ['payment-methods'],
    gcTime: 0,
    queryFn: () => api.get<any[]>('/payments/methods').then(r => Array.isArray(r) ? r : (r as any)?.data || []),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/payments/methods/${id}`),
    onSuccess: () => { toast.success(t('Removed', 'Supprimé')); qc.invalidateQueries({ queryKey: ['payment-methods'] }); },
    onError: () => toast.error(t('Failed to remove', 'Échec de la suppression')),
  });

  const defaultMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/payments/methods/${id}/default`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payment-methods'] }),
    onError: () => toast.error(t('Failed to update', 'Échec de la mise à jour')),
  });

  const stripeReady = !!stripePromise;

  return (
    <>
      <NeuCard title={t('Payment methods', 'Méthodes de paiement')} description={t('Your saved payment options', 'Vos options de paiement enregistrées')}>
        {isLoading ? (
          <div className="space-y-3 py-2">
            {[0, 1].map(i => (
              <div key={i} className="flex items-center justify-between p-3 rounded-[10px] border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-6" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-20 rounded-[8px]" />
              </div>
            ))}
          </div>
        ) : methods.length === 0 ? (
          <p className="text-xs text-[#8E8E8E] mb-4">{t('No payment method on file', 'Aucune méthode de paiement enregistrée')}</p>
        ) : (
          <div className="space-y-3 mb-5">
            {methods.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-[10px] bg-[#F5F7FA] dark:bg-white/5">
                <div className="flex items-center gap-3">
                  {m.type === 'MOBILE_MONEY' ? (
                    m.mobileProvider === 'MTN_MOMO_CMR'
                      ? <Image src="/assets/MTNmoney.png" alt="MTN" width={48} height={20} className="object-contain" />
                      : <Image src="/assets/Orangemoney.png" alt="Orange" width={48} height={20} className="object-contain" />
                  ) : (
                    <FiCreditCard size={20} className="text-[#040028] dark:text-white" />
                  )}
                  {(m.msisdn || m.last4) && (
                    <div>
                      {m.type === 'MOBILE_MONEY' && <p className="text-xs text-[#8E8E8E]">{m.msisdn}</p>}
                      {m.type === 'CARD' && <p className="text-xs text-[#8E8E8E]">····{m.last4} · {m.expiryMonth}/{m.expiryYear}</p>}
                    </div>
                  )}
                  {m.isDefault && (
                    <span className="px-2.5 py-1 text-[10px] font-semibold uppercase rounded-full bg-[#174CD2] text-white">{t('Default', 'Par défaut')}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!m.isDefault && (
                    <button
                      onClick={() => defaultMutation.mutate(m.id)}
                      className="p-1.5 rounded-[8px] text-[#8E8E8E] hover:bg-[#174CD2]/10 hover:text-[#174CD2] transition-all"
                      title={t('Set as default', 'Définir par défaut')}
                    >
                      <FiStar size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => { if (confirm(`${t('Remove', 'Supprimer')} "${m.label}"?`)) deleteMutation.mutate(m.id); }}
                    className="p-1.5 rounded-[8px] text-[#8E8E8E] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-all"
                    title={t('Remove', 'Supprimer')}
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add buttons */}
        {methods.length < 5 && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowMobileModal(true)}
              className="flex items-center gap-2 rounded-[10px] border border-black/10 dark:border-white/10 hover:border-[#174CD2]/40 transition-all overflow-hidden"
              title={t('Add Orange Money', 'Ajouter Orange Money')}
            >
              <Image src="/assets/Orangemoney.png" alt="Orange Money" width={110} height={46} className="object-contain block" />
            </button>
            <button
              onClick={() => setShowMobileModal(true)}
              className="flex items-center gap-2 rounded-[10px] border border-black/10 dark:border-white/10 hover:border-[#174CD2]/40 transition-all overflow-hidden"
              title={t('Add MTN MoMo', 'Ajouter MTN MoMo')}
            >
              <Image src="/assets/MTNmoney.png" alt="MTN MoMo" width={110} height={46} className="object-contain block" />
            </button>
            <button
              onClick={() => stripeReady ? setShowCardForm(v => !v) : toast.info(t('Stripe not configured yet', 'Stripe n\'est pas encore configuré'))}
              className="flex items-center gap-2 px-4 py-3 rounded-[10px] bg-white dark:bg-[#0A0A2E] border border-black/10 dark:border-white/10 text-[#040028] dark:text-white font-semibold text-xs hover:border-[#174CD2]/40 transition-all"
            >
              <FiCreditCard size={16} /> {t('Add Visa/Card', 'Ajouter Visa/Carte')}
            </button>
          </div>
        )}

        {showCardForm && stripePromise && (
          <div className="mt-4 p-4 rounded-[14px] bg-[#F5F7FA] dark:bg-white/5">
            <p className="text-xs font-semibold text-[#8E8E8E] mb-3">{t('Card details', 'Détails de la carte')}</p>
            <Elements stripe={stripePromise}>
              <StripeCardForm onSuccess={() => setShowCardForm(false)} onCancel={() => setShowCardForm(false)} />
            </Elements>
          </div>
        )}
      </NeuCard>

      {showMobileModal && <MobileMoneyModal onClose={() => setShowMobileModal(false)} />}
    </>
  );
}

// --- SUB-COMPONENT: BILLING SETTINGS ---
function BillingSettings({ workspaceId }: { workspaceId: string }) {
  const { t } = useLanguage();
  const { data: workspace } = useQuery({
    queryKey: ['workspace-billing', workspaceId],
    gcTime: 0,
    queryFn: () => api.get<any>(`/workspaces/${workspaceId}`),
    staleTime: 30_000,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['social-accounts', workspaceId],
    gcTime: 0,
    queryFn: () => api.get<any[]>(`/social-accounts?workspaceId=${workspaceId}`).then(res => Array.isArray(res) ? res : (res as any)?.data || []),
    staleTime: 30_000,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['posts', workspaceId],
    gcTime: 0,
    queryFn: () => api.get<any[]>(`/posts?workspaceId=${workspaceId}`).then(res => Array.isArray(res) ? res : (res as any)?.data || []),
    staleTime: 30_000,
  });

  const { data: mediaUsageMB = 0 } = useQuery({
    queryKey: ['media-usage'],
    gcTime: 0,
    queryFn: async () => {
      const res = await api.get<number>('/media/usage');
      return typeof res === 'number' ? res : (res as any).data || 0;
    },
    staleTime: 30_000,
  });

  const planType: string = workspace?.owner?.planType ?? workspace?.planType ?? 'FREE';
  const limits = PLAN_LIMITS[planType] ?? PLAN_LIMITS.FREE;
  const isFree = planType === 'FREE';

  const scheduledPostCount = (posts as any[]).filter((p: any) => p.status === 'SCHEDULED').length;

  const USAGE = [
    { label: t('Scheduled posts', 'Publications programmées'),  used: scheduledPostCount,              limit: limits.posts,     unit: t('posts', 'publications')   },
    { label: t('Social accounts', 'Comptes sociaux'),  used: (accounts as any[]).length,      limit: limits.accounts,  unit: t('accounts', 'comptes')},
    { label: t('Media storage', 'Stockage média'),    used: mediaUsageMB,                    limit: limits.storageMB, unit: 'MB'      },
    { label: t('Team members', 'Membres de l\'équipe'),     used: workspace?.currentMemberCount ?? 1, limit: limits.members,   unit: t('members', 'membres') },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Current Plan Banner */}
      <NeuCard title={t('Subscription', 'Abonnement')} description={t('Your current plan & billing cycle', 'Votre plan actuel et cycle de facturation')}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <p className="text-2xl font-bold text-[#040028] dark:text-white">{PLAN_LABEL[planType] ?? planType}</p>
              <span className="px-2.5 py-1 text-[10px] font-semibold uppercase rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{t('Active', 'Actif')}</span>
            </div>
            <p className="text-xs text-[#8E8E8E]">
              {isFree ? t('No billing cycle · Upgrade anytime', 'Pas de cycle de facturation · Passez à niveau n\'importe quand') : t('Monthly billing · Cancel anytime', 'Facturation mensuelle · Annulez n\'importe quand')}
            </p>
          </div>
          {isFree && (
            <NeuButton onClick={() => window.location.href = '/tarifs'} icon={<FiZap />}>
              {t('Upgrade plan', 'Améliorer le plan')}
            </NeuButton>
          )}
        </div>
      </NeuCard>

      {/* Usage Meters */}
      <NeuCard title={t('Usage', 'Utilisation')} description={t('Current period consumption', 'Consommation de la période en cours')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {USAGE.map((u) => {
            const pct = limits.posts === 99999 ? 0 : Math.min(Math.round((u.used / u.limit) * 100), 100);
            const isNearLimit = pct >= 80;
            const isAtLimit = pct >= 100;
            return (
              <div key={u.label} className={cn("relative", isAtLimit && "opacity-90")}>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className={cn("text-[#040028] dark:text-white flex items-center gap-1.5", isAtLimit && "text-red-600 dark:text-red-400")}>
                    {isAtLimit && <FiLock size={11} />}
                    {u.label}
                  </span>
                  <span className={isAtLimit ? 'text-red-600 dark:text-red-400' : isNearLimit ? 'text-orange-500' : 'text-[#8E8E8E]'}>
                    {u.used}{limits.posts === 99999 ? '' : ` / ${u.limit}`} {u.unit}
                  </span>
                </div>
                <div className={cn("h-2.5 rounded-full overflow-hidden", isAtLimit ? "bg-red-100 dark:bg-red-900/30" : "bg-[#F5F7FA] dark:bg-white/10")}>
                  <div
                    className={cn("h-full rounded-full transition-all", isAtLimit ? "bg-red-500" : isNearLimit ? "bg-orange-400" : "bg-[#174CD2]")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {isAtLimit && (
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">{t('Limit reached · action blocked', 'Limite atteinte · action bloquée')}</span>
                    <button
                      onClick={() => window.location.href = '/tarifs'}
                      className="text-[10px] font-semibold uppercase tracking-wide text-[#174CD2] hover:underline"
                    >
                      {t('Upgrade →', 'Améliorer →')}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </NeuCard>

      {/* Payment Method */}
      <PaymentMethodsCard />

      {/* Invoice History */}
      <NeuCard title={t('Invoice history', 'Historique des factures')} description={t('Past transactions & receipts', 'Transactions passées et reçus')}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5">
                <th className="text-left py-2 pr-4 font-semibold text-[#040028] dark:text-white">{t('Date', 'Date')}</th>
                <th className="text-left py-2 pr-4 font-semibold text-[#040028] dark:text-white">{t('Description', 'Description')}</th>
                <th className="text-left py-2 pr-4 font-semibold text-[#040028] dark:text-white">{t('Amount', 'Montant')}</th>
                <th className="text-left py-2 font-semibold text-[#040028] dark:text-white">{t('Status', 'Statut')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="py-10 text-center">
                  <FiCreditCard size={28} className="mx-auto mb-2 text-[#D9D9D9] dark:text-zinc-700" />
                  <p className="text-xs font-semibold text-[#8E8E8E]">{t('No invoices yet', 'Aucune facture pour l\'instant')}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </NeuCard>
    </div>
  );
}
