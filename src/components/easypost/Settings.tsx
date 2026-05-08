'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/src/lib/api';
import ConnectAccounts from './ConnectAccounts';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useLanguage } from '@/src/context/LanguageContext';

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
    <div className="font-sans text-black dark:text-white transition-colors">
      {/* Page Header */}
      <div className="mb-8 pb-6 border-b-2 border-black dark:border-white flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase text-gray-400 dark:text-zinc-500 tracking-widest mb-1">{t('Settings', 'Paramètres')}</p>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">{activeLabel}</h1>
        </div>
        {workspaceName && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
            <span className="text-[10px] font-black uppercase text-black dark:text-white truncate max-w-[140px]">{workspaceName}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-56 flex-shrink-0 space-y-6">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-2 px-1">{t('Account', 'Compte')}</p>
            <nav className="space-y-1">
              {ACCOUNT_TABS.map(tab => <TabBtn key={tab.id} tab={tab} activeTab={activeTab} setActiveTab={setActiveTab} />)}
            </nav>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-2 px-1">{t('Workspace', 'Espace de travail')}</p>
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
            <NeuCard title={t('Brand Settings', 'Paramètres de marque')} description={t('CONFIGURE YOUR WORKSPACE IDENTITY', 'CONFIGUREZ L\'IDENTITÉ DE VOTRE ESPACE')}>
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-black uppercase mb-2 text-black dark:text-white">{t('Workspace Logo', 'Logo de l\'espace')}</label>
                        <div className="flex items-start gap-6">
                            <div className="relative w-24 h-24 border-2 border-black dark:border-white bg-gray-100 dark:bg-zinc-800 shrink-0 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                                {formData.logo ? (
                                    <img src={formData.logo} alt={t('Logo', 'Logo')} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-zinc-600"><FiImage size={24} /></div>
                                )}
                                {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white"><FiLoader className="animate-spin" /></div>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                                <NeuButton variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}><FiUploadCloud /> {t('Upload Logo', 'Télécharger le logo')}</NeuButton>
                                <p className="text-xs font-mono text-gray-500 dark:text-zinc-400 max-w-[200px]">{t('Max 2MB. Recommended 500x500.', 'Max 2 Mo. Recommandé 500x500.')}</p>
                            </div>
                        </div>
                    </div>
                    <NeuInput label={t('Workspace Name', 'Nom de l\'espace')} value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} placeholder={t('e.g. Digital Agency', 'ex. Agence digitale')} />
                    <div>
                        <label className="block text-xs font-black uppercase mb-1 text-black dark:text-white">{t('Description', 'Description')}</label>
                        <textarea value={formData.description} onChange={(e:any) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border-2 border-black dark:border-white font-mono text-sm focus:outline-none focus:bg-yellow-50 dark:focus:bg-zinc-700 focus:shadow-[4px_4px_0px_0px_#000] dark:focus:shadow-[4px_4px_0px_0px_#fff] transition-all min-h-[100px] resize-none placeholder:text-gray-400 dark:placeholder:text-zinc-600 text-black dark:text-white" placeholder={t('e.g. We help local businesses grow.', 'ex. Nous aidons les entreprises locales à croître.')} />
                    </div>
                    <div className="relative">
                        <NeuInput label={t('Website URL', 'URL du site web')} value={formData.website} onChange={(e:any) => setFormData({...formData, website: e.target.value})} placeholder="https://easy.cm" />
                        <div className="absolute top-7 right-3 text-gray-400 dark:text-zinc-600 pointer-events-none"><FiGlobe /></div>
                    </div>
                    <div className="flex justify-end pt-4 border-t-2 border-dashed border-gray-200 dark:border-zinc-700">
                        <NeuButton onClick={handleUpdate} disabled={loading || uploading} icon={<FiSave />}>{loading ? t('Saving...', 'Sauvegarde...') : t('Save Changes', 'Enregistrer')}</NeuButton>
                    </div>
                </div>
            </NeuCard>
            <NeuCard title={t('Danger Zone', 'Zone dangereuse')} description={t('IRREVERSIBLE ACTIONS', 'ACTIONS IRRÉVERSIBLES')} className="border-red-500 dark:border-red-600">
                <div className="flex justify-between items-center">
                    <div><h4 className="font-black text-black dark:text-white uppercase">{t('ARCHIVE WORKSPACE', 'ARCHIVER L\'ESPACE')}</h4><p className="text-xs text-gray-500 dark:text-zinc-400 font-mono">{t('THIS WILL HIDE THE WORKSPACE FROM YOUR LIST.', 'CELA MASQUERA L\'ESPACE DE VOTRE LISTE.')}</p></div>
                    <NeuButton variant="secondary" onClick={handleDelete} disabled={loading} icon={<FiTrash2 />}>{t('Delete', 'Supprimer')}</NeuButton>
                </div>
            </NeuCard>
        </div>
    );
}

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
      <NeuCard title={t('Public Profile', 'Profil public')}>
        <div className="flex flex-col md:flex-row items-start gap-8">
          <Skeleton className="w-28 h-28 border-2 border-black dark:border-white flex-shrink-0" />
          <div className="flex-1 space-y-4 w-full max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 border-2 border-black dark:border-white" />
              <Skeleton className="h-10 border-2 border-black dark:border-white" />
            </div>
            <Skeleton className="h-10 border-2 border-black dark:border-white" />
            <Skeleton className="h-10 w-1/2 border-2 border-black dark:border-white ml-auto" />
          </div>
        </div>
      </NeuCard>
      <NeuCard title={t('Account Security', 'Sécurité du compte')}>
        <div className="max-w-lg space-y-4">
          <Skeleton className="h-10 border-2 border-black dark:border-white" />
          <Skeleton className="h-12 border-2 border-black dark:border-white" />
        </div>
      </NeuCard>
    </div>
  );

  return (
    <div className="space-y-8">
      <NeuCard title={t('Public Profile', 'Profil public')} description={t('VISIBLE TO TEAM MEMBERS', 'VISIBLE PAR LES MEMBRES DE L\'ÉQUIPE')}>
        <div className="flex flex-col md:flex-row items-start gap-8 transition-colors">
          <div className="flex-shrink-0 flex flex-col items-center gap-3">
            <div className="relative w-28 h-28 border-2 border-black dark:border-white bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-black dark:text-white text-4xl font-black shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] overflow-hidden group transition-all">
               {formData.avatar ? <img src={formData.avatar} className="w-full h-full object-cover" /> : (formData.firstName ? <span>{formData.firstName.charAt(0).toUpperCase()}</span> : <FiUser size={40} strokeWidth={1.5} />)}
               {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white"><FiLoader className="animate-spin text-2xl" /></div>}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
            <NeuButton variant="secondary" onClick={() => fileInputRef.current?.click()} className="text-[10px] py-1 px-2 h-auto" disabled={uploading}>{t('Change Photo', 'Changer la photo')}</NeuButton>
          </div>
          <div className="flex-1 space-y-4 w-full max-w-lg">
             <div className="grid grid-cols-2 gap-4">
                 <NeuInput label={t('First Name', 'Prénom')} value={formData.firstName} onChange={(e:any) => setFormData({...formData, firstName: e.target.value})} />
                 <NeuInput label={t('Last Name', 'Nom')} value={formData.lastName} onChange={(e:any) => setFormData({...formData, lastName: e.target.value})} />
             </div>
             <NeuInput label={t('Phone Number', 'Numéro de téléphone')} value={formData.phone} onChange={(e:any) => setFormData({...formData, phone: e.target.value})} placeholder="+237..." />
          </div>
        </div>
        <div className="mt-8 flex justify-end pt-4 border-t-2 border-dashed border-gray-200 dark:border-zinc-700">
            <NeuButton onClick={handleSave} disabled={loading || uploading} className="px-8" icon={<FiSave />}>{loading ? t('Saving...', 'Sauvegarde...') : t('Save Changes', 'Enregistrer')}</NeuButton>
        </div>
      </NeuCard>
      <NeuCard title={t('Account Security', 'Sécurité du compte')} description={t('USED FOR LOGIN & ALERTS', 'UTILISÉ POUR LA CONNEXION ET LES ALERTES')}>
         <div className="max-w-lg space-y-4">
             <NeuInput label={t('Email Address', 'Adresse e-mail')} value={formData.email} disabled type="email" />
             <div className="flex items-center justify-between p-3 border-2 border-black dark:border-white bg-gray-50 dark:bg-zinc-800 transition-colors">
                 <div className="text-sm text-black dark:text-white uppercase"><p className="font-bold">{t('Email Verified', 'E-mail vérifié')}</p><p className="text-xs font-mono opacity-70">{t('MANAGED BY PROVIDER', 'GÉRÉ PAR LE FOURNISSEUR')}</p></div>
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
      <NeuCard title={t('Email Notifications', 'Notifications par e-mail')} description={t('MESSAGES SENT TO YOUR REGISTERED EMAIL', 'MESSAGES ENVOYÉS À VOTRE E-MAIL ENREGISTRÉ')}>
        <div className="space-y-0">
          <NotifRow label={t('Post Published', 'Publication publiée')} desc={t('When a scheduled post goes live', 'Quand une publication programmée est mise en ligne')} value={prefs.emailPostPublished} onToggle={() => toggle('emailPostPublished')} />
          <NotifRow label={t('Post Failed', 'Publication échouée')} desc={t('When a post fails to publish', 'Quand une publication échoue')} value={prefs.emailPostFailed} onToggle={() => toggle('emailPostFailed')} />
          <NotifRow label={t('Weekly Report', 'Rapport hebdomadaire')} desc={t('Summary of performance every Monday', 'Résumé des performances chaque lundi')} value={prefs.emailWeeklyReport} onToggle={() => toggle('emailWeeklyReport')} />
          <NotifRow label={t('Team Invite', 'Invitation d\'équipe')} desc={t('When someone joins your workspace', 'Quand quelqu\'un rejoint votre espace')} value={prefs.emailTeamInvite} onToggle={() => toggle('emailTeamInvite')} />
        </div>
      </NeuCard>
      <NeuCard title={t('Push Notifications', 'Notifications push')} description={t('IN-APP ALERTS', 'ALERTES DANS L\'APPLICATION')}>
        <div className="space-y-0">
          <NotifRow label={t('New Comment', 'Nouveau commentaire')} desc={t('When someone replies to your post', 'Quand quelqu\'un répond à votre publication')} value={prefs.pushNewComment} onToggle={() => toggle('pushNewComment')} />
          <NotifRow label={t('Schedule Reminder', 'Rappel de planification')} desc={t('15 min before a scheduled post', '15 min avant une publication planifiée')} value={prefs.pushScheduleReminder} onToggle={() => toggle('pushScheduleReminder')} />
          <NotifRow label={t('Platform Alert', 'Alerte plateforme')} desc={t('OAuth expiry or platform errors', 'Expiration OAuth ou erreurs de plateforme')} value={prefs.pushPlatformAlert} onToggle={() => toggle('pushPlatformAlert')} />
        </div>
      </NeuCard>
      <div className="flex justify-end">
        <NeuButton onClick={handleSave} disabled={saving} icon={<FiSave />}>
          {saving ? t('Saving...', 'Sauvegarde...') : t('Save Preferences', 'Enregistrer les préférences')}
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
    OWNER: 'bg-[#3C48F5] text-white',
    ADMIN: 'bg-black dark:bg-white text-white dark:text-black',
    EDITOR: 'bg-yellow-400 text-black',
    VIEWER: 'bg-gray-100 dark:bg-zinc-700 text-black dark:text-white',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <NeuCard title={t('Workspace Members', 'Membres de l\'espace')} description={`${members.length} ${t('MEMBER', 'MEMBRE')}${members.length !== 1 ? t('S', 'S') : ''} ${t('IN THIS WORKSPACE', 'DANS CET ESPACE')}`}>
        {loading ? (
          <div className="space-y-3">
            {[0,1,2].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 border-2 border-black dark:border-white">
                <Skeleton className="w-10 h-10 border-2 border-black dark:border-white flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2 w-48" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-zinc-700">
            <FiUsers size={32} className="mx-auto mb-3 text-gray-300 dark:text-zinc-700" />
            <p className="text-xs font-black uppercase text-gray-400">{t('No Members Yet', 'Aucun membre pour l\'instant')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((m: any) => {
              const initials = (m.user?.firstName?.[0] || '') + (m.user?.lastName?.[0] || '') || m.user?.email?.[0]?.toUpperCase() || '?';
              const activity = ACTIVITY_LABELS[m.role] || t('Active', 'Actif');
              return (
                <div key={m.id} className="flex items-center gap-4 p-4 border-2 border-black dark:border-white bg-white dark:bg-zinc-800 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                  <div className="w-10 h-10 border-2 border-black dark:border-white bg-white dark:bg-zinc-700 flex items-center justify-center font-black uppercase text-sm text-black dark:text-white flex-shrink-0">
                    {m.user?.avatar
                      ? <img src={m.user.avatar} className="w-full h-full object-cover" alt="" />
                      : initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black uppercase text-black dark:text-white truncate">
                      {m.user?.firstName || ''} {m.user?.lastName || ''}{(!m.user?.firstName && !m.user?.lastName) ? (m.user?.email || t('Unknown', 'Inconnu')) : ''}
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
                          if (!confirm(`${t('Remove', 'Retirer')} ${m.user?.email}?`)) return;
                          await api.delete(`/workspace-members/${m.id}`);
                          setMembers(prev => prev.filter(x => x.id !== m.id));
                          toast.success(t('Member removed', 'Membre retiré'));
                        }}
                        className="p-1.5 border-2 border-black dark:border-white text-black dark:text-white hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
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
      <div className="p-3 border-2 border-black dark:border-white bg-white dark:bg-zinc-800">
        <CardElement
          options={{
            style: {
              base: {
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '14px',
                color: '#000',
                '::placeholder': { color: '#9ca3af' },
              },
            },
          }}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 border-2 border-black dark:border-white text-xs font-black uppercase hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all text-black dark:text-white">
          {t('Cancel', 'Annuler')}
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase shadow-[4px_4px_0px_0px_#3C48F5] hover:bg-zinc-800 dark:hover:bg-gray-200 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50">
          {loading ? <FiLoader className="animate-spin" /> : t('Save Card', 'Enregistrer la carte')}
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
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_#000] dark:shadow-[12px_12px_0px_0px_#fff] w-full max-w-sm">
        <div className="bg-black dark:bg-white text-white dark:text-black px-6 py-4 flex items-center justify-between border-b-4 border-black dark:border-white">
          <span className="font-black uppercase tracking-wider text-sm">{t('Add Mobile Money', 'Ajouter Mobile Money')}</span>
          <button onClick={onClose}><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 block mb-1">{t('Phone Number (with country code)', 'Numéro de téléphone (avec indicatif)')}</label>
            <input
              type="tel"
              value={msisdn}
              onChange={e => setMsisdn(e.target.value.replace(/\s/g, ''))}
              placeholder={t('e.g. 237699123456', 'ex. 237699123456')}
              className="w-full border-2 border-black dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white px-3 py-2 font-mono text-sm focus:outline-none focus:ring-0"
              required
            />
            {detected && (
              <div className="flex items-center gap-2 mt-2">
                {detected === 'MTN_MOMO_CMR'
                  ? <Image src="/assets/MTNmoney.png" alt="MTN" width={48} height={20} className="object-contain" />
                  : <Image src="/assets/Orangemoney.png" alt="Orange" width={48} height={20} className="object-contain" />}
                <span className="text-[10px] font-black uppercase text-green-600">
                  {detected === 'MTN_MOMO_CMR' ? t('MTN MoMo detected', 'MTN MoMo détecté') : t('Orange Money detected', 'Orange Money détecté')}
                </span>
              </div>
            )}
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 block mb-1">{t('Label (optional)', 'Étiquette (optionnel)')}</label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder={t('e.g. Personal Orange', 'ex. Orange personnel')}
              className="w-full border-2 border-black dark:border-white bg-white dark:bg-zinc-800 text-black dark:text-white px-3 py-2 font-mono text-sm focus:outline-none focus:ring-0"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border-2 border-black dark:border-white text-xs font-black uppercase text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all">{t('Cancel', 'Annuler')}</button>
            <button type="submit" disabled={loading} className="px-4 py-2 border-2 border-black bg-black text-white text-xs font-black uppercase shadow-[4px_4px_0px_0px_#3C48F5] hover:bg-zinc-800 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50">
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
      <NeuCard title={t('Payment Methods', 'Méthodes de paiement')} description={t('YOUR SAVED PAYMENT OPTIONS', 'VOS OPTIONS DE PAIEMENT ENREGISTRÉES')}>
        {isLoading ? (
          <div className="space-y-3 py-2">
            {[0, 1].map(i => (
              <div key={i} className="flex items-center justify-between p-3 border-2 border-black dark:border-white">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-6" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-20 border-2 border-black dark:border-white" />
              </div>
            ))}
          </div>
        ) : methods.length === 0 ? (
          <p className="text-xs font-mono text-gray-400 dark:text-zinc-500 uppercase mb-4">{t('No payment method on file', 'Aucune méthode de paiement enregistrée')}</p>
        ) : (
          <div className="space-y-3 mb-5">
            {methods.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between p-3 border-2 border-black dark:border-white bg-gray-50 dark:bg-zinc-800">
                <div className="flex items-center gap-3">
                  {m.type === 'MOBILE_MONEY' ? (
                    m.mobileProvider === 'MTN_MOMO_CMR'
                      ? <Image src="/assets/MTNmoney.png" alt="MTN" width={48} height={20} className="object-contain" />
                      : <Image src="/assets/Orangemoney.png" alt="Orange" width={48} height={20} className="object-contain" />
                  ) : (
                    <FiCreditCard size={20} className="text-black dark:text-white" />
                  )}
                  {(m.msisdn || m.last4) && (
                    <div>
                      {m.type === 'MOBILE_MONEY' && <p className="text-[10px] font-mono text-gray-500 dark:text-zinc-400">{m.msisdn}</p>}
                      {m.type === 'CARD' && <p className="text-[10px] font-mono text-gray-500 dark:text-zinc-400">····{m.last4} · {m.expiryMonth}/{m.expiryYear}</p>}
                    </div>
                  )}
                  {m.isDefault && (
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase border-2 border-black dark:border-white bg-[#3C48F5] text-white">{t('DEFAULT', 'PAR DÉFAUT')}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!m.isDefault && (
                    <button
                      onClick={() => defaultMutation.mutate(m.id)}
                      className="p-1.5 border-2 border-black dark:border-white text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:bg-[#3C48F5] hover:text-white hover:border-[#3C48F5] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                      title={t('Set as default', 'Définir par défaut')}
                    >
                      <FiStar size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => { if (confirm(`${t('Remove', 'Supprimer')} "${m.label}"?`)) deleteMutation.mutate(m.id); }}
                    className="p-1.5 border-2 border-black dark:border-white text-black dark:text-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
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
              className="flex items-center gap-2 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all overflow-hidden"
              title={t('Add Orange Money', 'Ajouter Orange Money')}
            >
              <Image src="/assets/Orangemoney.png" alt="Orange Money" width={110} height={46} className="object-contain block" />
            </button>
            <button
              onClick={() => setShowMobileModal(true)}
              className="flex items-center gap-2 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all overflow-hidden"
              title={t('Add MTN MoMo', 'Ajouter MTN MoMo')}
            >
              <Image src="/assets/MTNmoney.png" alt="MTN MoMo" width={110} height={46} className="object-contain block" />
            </button>
            <button
              onClick={() => stripeReady ? setShowCardForm(v => !v) : toast.info(t('Stripe not configured yet', 'Stripe n\'est pas encore configuré'))}
              className="flex items-center gap-2 px-4 py-3 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white font-black text-xs uppercase shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] hover:bg-[#3C48F5] hover:text-white hover:border-[#3C48F5] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <FiCreditCard size={16} /> {t('Add Visa/Card', 'Ajouter Visa/Carte')}
            </button>
          </div>
        )}

        {showCardForm && stripePromise && (
          <div className="mt-4 p-4 border-2 border-black dark:border-white bg-gray-50 dark:bg-zinc-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 mb-3">{t('Card Details', 'Détails de la carte')}</p>
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
    { label: t('Scheduled Posts', 'Publications programmées'),  used: scheduledPostCount,              limit: limits.posts,     unit: t('posts', 'publications')   },
    { label: t('Social Accounts', 'Comptes sociaux'),  used: (accounts as any[]).length,      limit: limits.accounts,  unit: t('accounts', 'comptes')},
    { label: t('Media Storage', 'Stockage média'),    used: mediaUsageMB,                    limit: limits.storageMB, unit: 'MB'      },
    { label: t('Team Members', 'Membres de l\'équipe'),     used: workspace?.currentMemberCount ?? 1, limit: limits.members,   unit: t('members', 'membres') },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Current Plan Banner */}
      <NeuCard title={t('Subscription', 'Abonnement')} description={t('YOUR CURRENT PLAN & BILLING CYCLE', 'VOTRE PLAN ACTUEL ET CYCLE DE FACTURATION')}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <p className="text-2xl font-black uppercase text-black dark:text-white">{PLAN_LABEL[planType] ?? planType}</p>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white">{t('Active', 'Actif')}</span>
            </div>
            <p className="text-xs font-mono text-gray-500 dark:text-zinc-400">
              {isFree ? t('No billing cycle · Upgrade anytime', 'Pas de cycle de facturation · Passez à niveau n\'importe quand') : t('Monthly billing · Cancel anytime', 'Facturation mensuelle · Annulez n\'importe quand')}
            </p>
          </div>
          {isFree && (
            <NeuButton onClick={() => window.location.href = '/pricing'} icon={<FiZap />}>
              {t('Upgrade Plan', 'Améliorer le plan')}
            </NeuButton>
          )}
        </div>
      </NeuCard>

      {/* Usage Meters */}
      <NeuCard title={t('Usage', 'Utilisation')} description={t('CURRENT PERIOD CONSUMPTION', 'CONSOMMATION DE LA PÉRIODE EN COURS')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {USAGE.map((u) => {
            const pct = limits.posts === 99999 ? 0 : Math.min(Math.round((u.used / u.limit) * 100), 100);
            const isNearLimit = pct >= 80;
            const isAtLimit = pct >= 100;
            return (
              <div key={u.label} className={cn("relative", isAtLimit && "opacity-90")}>
                <div className="flex justify-between text-xs font-black uppercase mb-2">
                  <span className={cn("text-black dark:text-white flex items-center gap-1.5", isAtLimit && "text-red-600 dark:text-red-400")}>
                    {isAtLimit && <FiLock size={11} />}
                    {u.label}
                  </span>
                  <span className={isAtLimit ? 'text-red-600 dark:text-red-400' : isNearLimit ? 'text-orange-500' : 'text-gray-500 dark:text-zinc-400'}>
                    {u.used}{limits.posts === 99999 ? '' : ` / ${u.limit}`} {u.unit}
                  </span>
                </div>
                <div className={cn("h-3 border-2 overflow-hidden", isAtLimit ? "border-red-500" : "border-black dark:border-white bg-gray-100 dark:bg-zinc-800")}>
                  <div
                    className={cn("h-full transition-all", isAtLimit ? "bg-red-500" : isNearLimit ? "bg-orange-400" : "bg-[#3C48F5]")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {isAtLimit && (
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">{t('LIMIT REACHED · ACTION BLOCKED', 'LIMITE ATTEINTE · ACTION BLOQUÉE')}</span>
                    <button
                      onClick={() => window.location.href = '/pricing'}
                      className="text-[9px] font-black uppercase tracking-widest text-[#3C48F5] hover:underline"
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
      <NeuCard title={t('Invoice History', 'Historique des factures')} description={t('PAST TRANSACTIONS & RECEIPTS', 'TRANSACTIONS PASSÉES ET REÇUS')}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b-2 border-black dark:border-white">
                <th className="text-left py-2 pr-4 font-black uppercase text-black dark:text-white">{t('Date', 'Date')}</th>
                <th className="text-left py-2 pr-4 font-black uppercase text-black dark:text-white">{t('Description', 'Description')}</th>
                <th className="text-left py-2 pr-4 font-black uppercase text-black dark:text-white">{t('Amount', 'Montant')}</th>
                <th className="text-left py-2 font-black uppercase text-black dark:text-white">{t('Status', 'Statut')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="py-10 text-center">
                  <FiCreditCard size={28} className="mx-auto mb-2 text-gray-200 dark:text-zinc-700" />
                  <p className="text-[10px] font-black uppercase text-gray-300 dark:text-zinc-600">{t('No Invoices Yet', 'Aucune facture pour l\'instant')}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </NeuCard>
    </div>
  );
}
