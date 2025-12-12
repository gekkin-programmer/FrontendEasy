// src/components/easypost/Settings.tsx
'use client';
import React, { useState } from 'react';
import ConnectAccounts from './ConnectAccounts';
import { motion } from 'framer-motion';
import { 
  FiUser, FiShield, FiBell, FiMoon, FiUsers, FiCreditCard,
  FiTrash2, FiCamera, FiPlus, FiMoreHorizontal, FiMonitor,
  FiSmartphone, FiX, FiCheck, FiChevronRight, FiCommand, FiGlobe
} from 'react-icons/fi';
import { 
  FaTwitter, FaInstagram, FaLinkedin, FaFacebook, FaTiktok 
} from 'react-icons/fa';

type SettingsTab = 'profile' | 'account' | 'notifications' | 'appearance' | 'team' | 'billing';

interface SettingsProps {
  workspaceName?: string;
  workspacePlan?: string;
}

export default function Settings({ workspaceName = 'My Workspace', workspacePlan = 'pro' }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'General', icon: <FiUser size={16} /> },
    { id: 'account', label: 'Security', icon: <FiShield size={16} /> },
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
      {/* Header */}
      <div className="mb-8 pt-2">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage workspace preferences for <span className="font-medium text-gray-900">{workspaceName}</span>
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Navigation */}
        <aside className="lg:w-60 flex-shrink-0">
          <nav className="space-y-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-gray-900' : 'text-gray-400'}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Danger Zone */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Danger Zone</p>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">
              <FiTrash2 size={16} />
              Delete Workspace
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 pb-20">
            {/* We remove the single card wrapper to allow distinct sections like Vercel */}
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'account' && <AccountSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'appearance' && <AppearanceSettings theme={theme} setTheme={setTheme} />}
            {activeTab === 'team' && <TeamSettings />}
            {activeTab === 'billing' && <BillingSettings plan={workspacePlan} />}
            {activeTab === 'account' && <ConnectAccounts />}
        </main>
      </div>
    </motion.div>
  );
}

/* ============================================
   PROFILE SETTINGS (Industrial Style)
============================================ */
function ProfileSettings() {
  return (
    <div className="space-y-6">
      <SectionCard title="Public Profile" description="This information will be visible to your team members.">
        <div className="flex items-start gap-8">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 text-2xl font-medium mb-4 relative overflow-hidden group">
               {/* Simulating an image or initials */}
               <span className="z-10">JD</span>
               <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                  <FiCamera />
               </div>
            </div>
          </div>
          <div className="flex-1 space-y-4 max-w-lg">
             <div className="grid grid-cols-2 gap-4">
                <InputField label="First name" defaultValue="John" />
                <InputField label="Last name" defaultValue="Doe" />
             </div>
             <InputField label="Username" defaultValue="johndoe" prefix="buffer.com/" />
             <TextareaField 
                label="Bio" 
                defaultValue="Product designer based in NYC." 
                rows={3} 
             />
          </div>
        </div>
        <CardFooter />
      </SectionCard>
      
      <SectionCard title="Contact Info" description="Used for billing and account notifications.">
         <div className="max-w-lg space-y-4">
             <InputField label="Email Address" defaultValue="john@company.com" type="email" />
             <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                 <div className="text-sm">
                    <p className="font-medium text-gray-900">Email Verified</p>
                    <p className="text-gray-500">Your email has been verified.</p>
                 </div>
                 <FiCheck className="text-green-600" />
             </div>
         </div>
         <CardFooter />
      </SectionCard>
    </div>
  );
}

/* ============================================
   ACCOUNT SETTINGS
============================================ */
function AccountSettings() {
  return (
    <div className="space-y-6">
      <SectionCard title="Authentication" description="Manage how you access your account.">
         <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between py-1">
                <div>
                   <p className="text-sm font-medium text-gray-900">Password</p>
                   <p className="text-sm text-gray-500">Last updated 3 months ago</p>
                </div>
                <Button variant="secondary">Update</Button>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex items-center justify-between py-1">
                <div>
                   <p className="text-sm font-medium text-gray-900">Two-factor Authentication</p>
                   <p className="text-sm text-gray-500">Add an extra layer of security.</p>
                </div>
                <Toggle />
            </div>
         </div>
      </SectionCard>

      <SectionCard title="Connected Identities" description="Log in with these third-party services.">
          <div className="space-y-3 max-w-2xl">
             <ConnectedAccountRow icon={<FaTwitter className="text-gray-900" />} name="X (Twitter)" connected handle="@johndoe" />
             <ConnectedAccountRow icon={<FaInstagram className="text-gray-900" />} name="Instagram" connected={false} />
             <ConnectedAccountRow icon={<FiGlobe className="text-gray-900" />} name="Custom Domain" connected={false} />
          </div>
      </SectionCard>

      <SectionCard title="Active Sessions" description="Manage devices currently logged in.">
          <div className="space-y-0 divide-y divide-gray-100">
             <SessionRow device="MacBook Pro 16" loc="Tokyo, Japan" ip="192.168.1.1" current />
             <SessionRow device="iPhone 13" loc="Osaka, Japan" ip="10.0.0.4" />
          </div>
      </SectionCard>
    </div>
  );
}

/* ============================================
   BILLING SETTINGS (Vercel Style)
============================================ */
function BillingSettings({ plan = 'pro' }: { plan?: string }) {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 border border-gray-200 rounded-lg bg-white p-6 relative overflow-hidden">
             <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Current Plan</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-bold text-gray-900 capitalize">{plan} Plan</span>
                        <span className="text-sm text-gray-500">($29/mo)</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Renews automatically on <span className="text-gray-900 font-medium">Jan 15, 2025</span></p>
                 </div>
                 <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">Active</span>
             </div>
             <div className="flex gap-3">
                 <Button variant="primary">Upgrade Plan</Button>
                 <Button variant="secondary">Cancel Subscription</Button>
             </div>
          </div>

          <div className="border border-gray-200 rounded-lg bg-white p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Payment Method</h3>
              <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-8 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                     <span className="font-bold text-xs text-gray-600">VISA</span>
                  </div>
                  <div>
                      <p className="text-sm font-medium text-gray-900">•••• 4242</p>
                      <p className="text-xs text-gray-500">Exp 12/25</p>
                  </div>
              </div>
              <Button variant="secondary" className="w-full">Update Details</Button>
          </div>
      </div>

      <SectionCard title="Usage & Limits" description="Your usage for the current billing cycle.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
             <UsageMetric label="Posts Scheduled" used={425} limit={1000} />
             <UsageMetric label="AI Words Generated" used={8900} limit={10000} warning />
             <UsageMetric label="Team Members" used={4} limit={5} />
             <UsageMetric label="Storage Used" used={1.2} limit={5} unit="GB" />
          </div>
      </SectionCard>

      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
             <h3 className="text-sm font-medium text-gray-900">Invoices</h3>
             <Button variant="secondary" size="sm">Download All</Button>
         </div>
         <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-100">
                <tr>
                    <th className="px-6 py-3 font-medium">Invoice ID</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium text-right">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {[
                    {id: 'INV-001', date: 'Dec 1, 2024', amt: '$29.00'},
                    {id: 'INV-002', date: 'Nov 1, 2024', amt: '$29.00'},
                    {id: 'INV-003', date: 'Oct 1, 2024', amt: '$29.00'},
                ].map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{inv.id}</td>
                        <td className="px-6 py-4 text-gray-500">{inv.date}</td>
                        <td className="px-6 py-4 text-gray-500">{inv.amt}</td>
                        <td className="px-6 py-4 text-right"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Paid</span></td>
                    </tr>
                ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}

/* ============================================
   NOTIFICATION SETTINGS
============================================ */
function NotificationSettings() {
  return (
    <div className="space-y-6">
      <SectionCard title="Activity Alerts" description="Receive emails when important activity occurs.">
         <div className="space-y-4 max-w-2xl">
            <NotificationToggle label="Successful posts" desc="Notify me when a post is published successfully." />
            <NotificationToggle label="Failed posts" desc="Notify me immediately if a post fails to publish." defaultChecked />
            <NotificationToggle label="Team comments" desc="When a team member mentions you." defaultChecked />
         </div>
         <CardFooter />
      </SectionCard>

      <SectionCard title="Marketing Updates" description="Receive updates about new features.">
         <div className="space-y-4 max-w-2xl">
            <NotificationToggle label="Product updates" desc="Monthly newsletter about new features." />
            <NotificationToggle label="Tips & Tutorials" desc="Learn how to get the most out of the platform." />
         </div>
         <CardFooter />
      </SectionCard>
    </div>
  );
}

/* ============================================
   TEAM SETTINGS
============================================ */
function TeamSettings() {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-end">
           <div>
               <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
               <p className="text-sm text-gray-500">Manage who has access to this workspace.</p>
           </div>
           <Button variant="primary" icon={<FiPlus />}>Invite Member</Button>
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
                 <MemberRow name="John Doe" email="john@example.com" role="Owner" />
                 <MemberRow name="Sarah Chen" email="sarah@example.com" role="Admin" />
                 <MemberRow name="Mike Ross" email="mike@example.com" role="Editor" />
             </tbody>
          </table>
       </div>
    </div>
  );
}

/* ============================================
   APPEARANCE SETTINGS
============================================ */
function AppearanceSettings({ theme, setTheme }: any) {
    return (
        <div className="space-y-6">
            <SectionCard title="Theme Preference" description="Select how the dashboard looks.">
                <div className="grid grid-cols-3 gap-4 max-w-xl">
                    {['light', 'dark', 'system'].map((t) => (
                        <button 
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`p-4 border rounded-lg text-left transition-all ${
                                theme === t 
                                ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className={`w-full h-20 mb-3 rounded border ${t === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}></div>
                            <p className="text-sm font-medium text-gray-900 capitalize">{t}</p>
                        </button>
                    ))}
                </div>
            </SectionCard>
             <SectionCard title="Interface Density" description="Adjust the information density.">
                <div className="flex items-center justify-between max-w-xl p-3 border border-gray-200 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">Compact Mode</span>
                    <Toggle />
                </div>
            </SectionCard>
        </div>
    )
}


/* ============================================
   HELPER COMPONENTS (THE "UI LIBRARY")
============================================ */

function SectionCard({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
    return (
        <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
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
            <p className="text-xs text-gray-500">Please save your changes before leaving.</p>
            <div className="flex gap-3">
                 {children || <Button variant="primary">Save Changes</Button>}
            </div>
        </div>
    )
}

function InputField({ label, type = "text", defaultValue, prefix }: any) {
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
                    defaultValue={defaultValue} 
                    className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-md ${prefix ? 'rounded-l-none' : ''} border-gray-300 focus:ring-gray-900 focus:border-gray-900 sm:text-sm border transition-shadow outline-none`}
                />
            </div>
        </div>
    )
}

function TextareaField({ label, defaultValue, rows }: any) {
     return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <textarea 
                rows={rows} 
                defaultValue={defaultValue} 
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm resize-none"
            />
        </div>
    )
}

function Button({ children, variant = "primary", className = "", icon, size = "md" }: any) {
    const base = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-gray-900 text-white hover:bg-black focus:ring-gray-900 border border-transparent shadow-sm",
        secondary: "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 focus:ring-gray-500 shadow-sm",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-transparent shadow-sm"
    };
    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm"
    }
    
    return (
        <button className={`${base} ${variants[variant as keyof typeof variants]} ${sizes[size as keyof typeof sizes]} ${className} gap-2`}>
            {icon && <span>{icon}</span>}
            {children}
        </button>
    )
}

function Toggle({ defaultChecked = false }) {
    const [enabled, setEnabled] = useState(defaultChecked);
    return (
        <button 
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 ${enabled ? 'bg-gray-900' : 'bg-gray-200'}`}
        >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    )
}

function UsageMetric({ label, used, limit, unit = "", warning }: any) {
    const percent = (used / limit) * 100;
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

function ConnectedAccountRow({ icon, name, connected, handle }: any) {
    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded border border-gray-200 text-lg">
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900">{name}</p>
                    {handle && <p className="text-xs text-gray-500">{handle}</p>}
                </div>
            </div>
            <Button variant="secondary" size="sm">{connected ? 'Disconnect' : 'Connect'}</Button>
        </div>
    )
}

function SessionRow({ device, loc, ip, current }: any) {
    return (
        <div className="flex items-center justify-between py-4 px-6 hover:bg-gray-50">
            <div className="flex items-center gap-3">
                <FiMonitor className="text-gray-400 text-xl" />
                <div>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {device}
                        {current && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200 uppercase tracking-wide font-bold">Current</span>}
                    </p>
                    <p className="text-xs text-gray-500">{loc} • {ip}</p>
                </div>
            </div>
            {!current && <button className="text-sm text-gray-500 hover:text-red-600 transition-colors">Revoke</button>}
        </div>
    )
}

function NotificationToggle({ label, desc, defaultChecked }: any) {
    return (
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-500">{desc}</p>
            </div>
            <Toggle defaultChecked={defaultChecked} />
        </div>
    )
}

function MemberRow({ name, email, role }: any) {
    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">{name}</p>
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