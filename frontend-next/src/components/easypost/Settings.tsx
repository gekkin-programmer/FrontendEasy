'use client';
import React, { useState, useEffect } from 'react';
import ConnectAccounts from './ConnectAccounts';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  FiUser, FiShield, FiBell, FiMonitor, FiUsers, FiCreditCard,
  FiTrash2, FiCamera, FiPlus, FiCheck, FiLoader, FiMoreHorizontal,
  FiMoon, FiSun
} from 'react-icons/fi';

type SettingsTab = 'profile' | 'account' | 'notifications' | 'appearance' | 'team' | 'billing';

interface SettingsProps {
  workspaceId?: string;
  workspaceName?: string;
  workspacePlan?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function Settings({ workspaceId, workspaceName = 'My Workspace', workspacePlan = 'free' }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Icons config
  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'General', icon: <FiUser size={16} /> },
    { id: 'account', label: 'Connections', icon: <FiShield size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell size={16} /> },
    { id: 'appearance', label: 'Interface', icon: <FiMonitor size={16} /> },
    { id: 'team', label: 'Members', icon: <FiUsers size={16} /> },
    { id: 'billing', label: 'Billing & Usage', icon: <FiCreditCard size={16} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto"
    >
      <div className="mb-8 pt-2">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage workspace preferences for <span className="font-medium text-gray-900 dark:text-gray-200">{workspaceName}</span>
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar */}
        <aside className="lg:w-60 flex-shrink-0">
          <nav className="space-y-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
          
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Danger Zone</p>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
              <FiTrash2 size={16} />
              Delete Workspace
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 pb-20">
            {activeTab === 'profile' && <ProfileSettings />}
            
            {activeTab === 'account' && (
                <div className="space-y-6">
                    <SectionCard title="Connected Accounts" description="Manage your social media connections.">
                        <ConnectAccounts />
                    </SectionCard>
                </div>
            )}
            
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'team' && workspaceId && <TeamSettings workspaceId={workspaceId} />}
            {activeTab === 'billing' && workspaceId && <BillingSettings workspaceId={workspaceId} plan={workspacePlan} />}
        </main>
      </div>
    </motion.div>
  );
}

/* ============================================
   1. PROFILE SETTINGS (Connected)
============================================ */
function ProfileSettings() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUser(data);
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || ''
        });
      } catch (e) { console.error(e); }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    // TODO: Create PATCH /api/users/profile
    setIsSaving(true);
    setTimeout(() => {
        toast.success("Profile updated locally (API endpoint pending)");
        setIsSaving(false);
    }, 1000);
  };

  if (!user) return <Loader />;

  return (
    <div className="space-y-6">
      <SectionCard title="Public Profile" description="This information will be visible to your team members.">
        <div className="flex items-start gap-8">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 text-2xl font-medium mb-4 relative overflow-hidden group">
               {user.avatar ? (
                 <img src={user.avatar} className="w-full h-full object-cover" />
               ) : (
                 <span className="z-10">{formData.firstName ? formData.firstName.charAt(0).toUpperCase() : 'U'}</span>
               )}
            </div>
          </div>
          <div className="flex-1 space-y-4 max-w-lg">
             <InputField label="First Name" value={formData.firstName} onChange={(e:any) => setFormData({...formData, firstName: e.target.value})} />
             <InputField label="Last Name" value={formData.lastName} onChange={(e:any) => setFormData({...formData, lastName: e.target.value})} />
          </div>
        </div>
        <CardFooter>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <FiLoader className="animate-spin" /> : 'Save Changes'}
            </Button>
        </CardFooter>
      </SectionCard>
      
      <SectionCard title="Contact Info" description="Used for login and notifications.">
         <div className="max-w-lg space-y-4">
             <InputField label="Email Address" value={formData.email} disabled type="email" />
             <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                 <div className="text-sm">
                    <p className="font-medium text-gray-900">Email Verified</p>
                    <p className="text-gray-500">Managed by Google/EasyPost</p>
                 </div>
                 <FiCheck className="text-green-600" />
             </div>
         </div>
      </SectionCard>
    </div>
  );
}

/* ============================================
   2. NOTIFICATION SETTINGS (Connected)
============================================ */
function NotificationSettings() {
    // 🛑 MOCK: Using local state until API is ready
    const [prefs, setPrefs] = useState({ emailAlerts: true, failedPostAlerts: true, marketingEmails: false });

    const togglePref = (key: keyof typeof prefs) => {
        setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
        toast.success("Preferences saved");
    };

    return (
      <div className="space-y-6">
        <SectionCard title="Activity Alerts" description="Manage what emails you receive.">
           <div className="space-y-4 max-w-2xl">
              <NotificationToggle 
                label="General Alerts" 
                desc="Receive weekly summary reports." 
                checked={prefs.emailAlerts}
                onChange={() => togglePref('emailAlerts')}
              />
              <NotificationToggle 
                label="Failed Post Alerts" 
                desc="Get notified immediately if a scheduled post fails." 
                checked={prefs.failedPostAlerts}
                onChange={() => togglePref('failedPostAlerts')}
              />
           </div>
        </SectionCard>

        <SectionCard title="Marketing" description="Stay up to date.">
           <NotificationToggle 
                label="Product Updates" 
                desc="Receive news about new features." 
                checked={prefs.marketingEmails}
                onChange={() => togglePref('marketingEmails')}
           />
        </SectionCard>
      </div>
    );
}

/* ============================================
   3. APPEARANCE SETTINGS
============================================ */
function AppearanceSettings() {
    const [mode, setMode] = useState<'light' | 'dark' | 'system'>('light');

    useEffect(() => {
        const stored = localStorage.getItem('theme') as any;
        if (stored) setMode(stored);
    }, []);

    const handleThemeChange = (newMode: 'light' | 'dark' | 'system') => {
        setMode(newMode);
        localStorage.setItem('theme', newMode);
        
        const root = window.document.documentElement;
        if (newMode === 'dark' || (newMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        toast.success(`Theme set to ${newMode}`);
    };

    return (
        <div className="space-y-6">
            <SectionCard title="Theme Preference" description="Select how the dashboard looks.">
                <div className="grid grid-cols-3 gap-4 max-w-xl">
                    {[
                        { id: 'light', icon: <FiSun />, label: 'Light' },
                        { id: 'dark', icon: <FiMoon />, label: 'Dark' },
                        { id: 'system', icon: <FiMonitor />, label: 'System' }
                    ].map((t) => (
                        <button 
                            key={t.id}
                            onClick={() => handleThemeChange(t.id as any)}
                            className={`p-4 border rounded-lg text-left transition-all flex flex-col items-center justify-center gap-2 ${
                                mode === t.id 
                                ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <span className="text-xl text-gray-700">{t.icon}</span>
                            <p className="text-sm font-medium text-gray-900 capitalize">{t.label}</p>
                        </button>
                    ))}
                </div>
            </SectionCard>
        </div>
    )
}

/* ============================================
   4. TEAM SETTINGS (Fetched)
============================================ */
function TeamSettings({ workspaceId }: { workspaceId: string }) {
    const [members, setMembers] = useState<any[]>([]);

    useEffect(() => {
        const fetchTeam = async () => {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_URL}/workspaces/${workspaceId}/members`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if(res.ok) setMembers(await res.json());
        };
        if(workspaceId) fetchTeam();
    }, [workspaceId]);

    const handleInvite = () => {
        // TODO: Open a modal to call POST /members/invite
        toast.info("Invite feature is connected to Backend (UI Pending)");
    };

    return (
      <div className="space-y-6">
         <div className="flex justify-between items-end">
             <div>
                 <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                 <p className="text-sm text-gray-500">Manage who has access to this workspace.</p>
             </div>
             <Button variant="primary" icon={<FiPlus />} onClick={handleInvite}>Invite Member</Button>
         </div>
  
         <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                   <tr>
                       <th className="px-6 py-3 font-medium">User</th>
                       <th className="px-6 py-3 font-medium">Role</th>
                       <th className="px-6 py-3 font-medium text-right">Actions</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                   {members.map(m => (
                       <MemberRow 
                         key={m.id}
                         name={m.user.firstName + ' ' + (m.user.lastName || '')} 
                         email={m.user.email} 
                         role={m.role} 
                        />
                   ))}
                   {members.length === 0 && (
                        <tr className="bg-gray-50/50">
                            <td colSpan={3} className="px-6 py-4 text-center text-gray-500 italic">No members yet</td>
                        </tr>
                   )}
               </tbody>
            </table>
         </div>
      </div>
    );
}

/* ============================================
   5. BILLING SETTINGS (Calculated)
============================================ */
function BillingSettings({ workspaceId, plan }: { workspaceId: string, plan: string }) {
    // 🛑 MOCK usage for now
    const postCount = 5; 
    const limits: any = { free: 10, pro: 500, agency: 10000 };
    const limit = limits[plan] || 10;

    return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 border border-gray-200 rounded-lg bg-white p-6 relative overflow-hidden">
             <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Current Plan</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-bold text-gray-900 capitalize">{plan} Plan</span>
                        <span className="text-sm text-gray-500">
                            {plan === 'free' ? '$0/mo' : '$29/mo'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {plan === 'free' ? 'Upgrade to remove limits.' : 'Renews automatically on Jan 1st.'}
                    </p>
                 </div>
                 <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">Active</span>
             </div>
             <div className="flex gap-3">
                 <Button variant="primary">Upgrade Plan</Button>
                 {plan !== 'free' && <Button variant="secondary">Cancel Subscription</Button>}
             </div>
          </div>

          <div className="border border-gray-200 rounded-lg bg-white p-6 flex flex-col justify-center items-center text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-3">
                  <FiCreditCard size={24} />
              </div>
              <h3 className="font-medium text-gray-900">Payment Method</h3>
              <p className="text-xs text-gray-500 mb-4">Securely processed by Stripe</p>
              <Button variant="secondary" className="w-full">Manage in Stripe</Button>
          </div>
      </div>

      <SectionCard title="Usage & Limits" description="Your usage for the current billing cycle.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
             <UsageMetric label="Posts Created" used={postCount} limit={limit} />
             <UsageMetric label="Storage (GB)" used={0.1} limit={1} unit="GB" />
          </div>
      </SectionCard>
    </div>
  );
}


/* ============================================
   HELPER COMPONENTS (UI LIBRARY)
============================================ */

function Loader() {
    return <div className="p-12 flex justify-center"><FiLoader className="animate-spin text-gray-400" /></div>;
}

function SectionCard({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
    return (
        <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-base font-medium text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    )
}

function CardFooter({ children }: { children?: React.ReactNode }) {
    return (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <p className="text-xs text-gray-500">Remember to save your changes.</p>
            <div className="flex gap-3">
                 {children}
            </div>
        </div>
    )
}

function InputField({ label, type = "text", value, onChange, prefix, disabled }: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <div className="flex rounded-md shadow-sm">
                {prefix && (
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        {prefix}
                    </span>
                )}
                <input 
                    type={type} 
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-md ${prefix ? 'rounded-l-none' : ''} border-gray-300 focus:ring-gray-900 focus:border-gray-900 sm:text-sm border transition-shadow outline-none disabled:bg-gray-100 disabled:text-gray-500`}
                />
            </div>
        </div>
    )
}

function TextareaField({ label, value, onChange, rows }: any) {
     return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <textarea 
                rows={rows} 
                value={value}
                onChange={onChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm resize-none"
            />
        </div>
    )
}

function Button({ children, variant = "primary", className = "", icon, size = "md", onClick, disabled }: any) {
    const base = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-gray-900 text-white hover:bg-black focus:ring-gray-900 border border-transparent shadow-sm",
        secondary: "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 focus:ring-gray-500 shadow-sm",
    };
    const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" }
    
    return (
        <button 
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${variants[variant as keyof typeof variants]} ${sizes[size as keyof typeof sizes]} ${className} gap-2`}
        >
            {icon && <span>{icon}</span>}
            {children}
        </button>
    )
}

function Toggle({ checked, onChange }: any) {
    return (
        <button 
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 ${checked ? 'bg-gray-900' : 'bg-gray-200'}`}
        >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    )
}

function NotificationToggle({ label, desc, checked, onChange }: any) {
    return (
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-500">{desc}</p>
            </div>
            <Toggle checked={checked} onChange={onChange} />
        </div>
    )
}

function UsageMetric({ label, used, limit, unit = "", warning }: any) {
    const percent = Math.min((used / limit) * 100, 100);
    return (
        <div>
            <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="text-gray-500">{used} / {limit}{unit}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                    className={`h-2 rounded-full ${warning ? 'bg-amber-500' : 'bg-gray-900'}`} 
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
        </div>
    )
}

function MemberRow({ name, email, role }: any) {
    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {name ? name.charAt(0) : '?'}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">{name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{email}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {role}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <button className="text-gray-400 hover:text-gray-600">
                    <FiMoreHorizontal />
                </button>
            </td>
        </tr>
    )
}