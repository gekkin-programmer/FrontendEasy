// src/components/easypost/Settings.tsx
'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUser, FiShield, FiBell, FiMoon, FiUsers, FiCreditCard,
  FiTrash2, FiCamera, FiPlus, FiMoreHorizontal, FiMonitor,
  FiSmartphone, FiX, FiCheck, FiChevronRight
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
    { id: 'profile', label: 'Profile', icon: <FiUser size={18} /> },
    { id: 'account', label: 'Account', icon: <FiShield size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <FiMoon size={18} /> },
    { id: 'team', label: 'Team', icon: <FiUsers size={18} /> },
    { id: 'billing', label: 'Billing', icon: <FiCreditCard size={18} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account settings and preferences for {workspaceName}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:w-56 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Danger Zone */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
              <FiTrash2 size={18} />
              Delete Workspace
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'account' && <AccountSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'appearance' && <AppearanceSettings theme={theme} setTheme={setTheme} />}
            {activeTab === 'team' && <TeamSettings />}
            {activeTab === 'billing' && <BillingSettings plan={workspacePlan} />}
          </div>
        </main>
      </div>
    </motion.div>
  );
}

/* ============================================
   PROFILE SETTINGS
============================================ */
function ProfileSettings() {
  return (
    <div className="divide-y divide-gray-100">
      <SectionHeader
        title="Profile"
        description="This information will be visible to your team members"
      />

      {/* Avatar */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              JD
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors group-hover:scale-110">
              <FiCamera size={14} className="text-gray-600" />
            </button>
          </div>
          <div>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Upload new photo
            </button>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG or GIF. 1MB max.
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="px-6 py-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField label="First name" defaultValue="John" />
          <InputField label="Last name" defaultValue="Doe" />
        </div>
        <InputField label="Email" type="email" defaultValue="john@company.com" />
        <InputField label="Username" defaultValue="johndoe" prefix="@" />
        <TextareaField
          label="Bio"
          defaultValue="Social media manager & content strategist. Helping brands grow online."
          rows={3}
          hint="Brief description for your profile."
        />
      </div>

      <SettingsFooter />
    </div>
  );
}

/* ============================================
   ACCOUNT SETTINGS
============================================ */
function AccountSettings() {
  const connectedAccounts = [
    { platform: 'Twitter / X', handle: '@johndoe', icon: <FaTwitter />, connected: true, color: 'text-gray-900' },
    { platform: 'Instagram', handle: '@johndoe', icon: <FaInstagram />, connected: true, color: 'text-pink-600' },
    { platform: 'LinkedIn', icon: <FaLinkedin />, connected: false, color: 'text-blue-700' },
    { platform: 'Facebook', icon: <FaFacebook />, connected: false, color: 'text-blue-600' },
    { platform: 'TikTok', icon: <FaTiktok />, connected: false, color: 'text-gray-900' },
  ];

  return (
    <div className="divide-y divide-gray-100">
      <SectionHeader
        title="Account"
        description="Manage your account security and connected platforms"
      />

      {/* Password */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Password</h3>
            <p className="text-sm text-gray-500 mt-0.5">Last changed 3 months ago</p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            Change password
          </button>
        </div>
      </div>

      {/* 2FA */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Two-factor authentication</h3>
            <p className="text-sm text-gray-500 mt-0.5">Add an extra layer of security</p>
          </div>
          <Toggle defaultChecked={false} />
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="px-6 py-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Connected platforms</h3>
        <div className="space-y-3">
          {connectedAccounts.map((account) => (
            <div key={account.platform} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <span className={`text-xl ${account.color}`}>{account.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{account.platform}</p>
                  {account.handle && (
                    <p className="text-xs text-gray-500">{account.handle}</p>
                  )}
                </div>
              </div>
              {account.connected ? (
                <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                  Disconnect
                </button>
              ) : (
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Active sessions</h3>
          <button className="text-sm text-red-600 hover:text-red-700 font-medium">
            Sign out all
          </button>
        </div>
        <div className="space-y-3">
          <SessionItem device="MacBook Pro" location="New York, US" icon={<FiMonitor />} current />
          <SessionItem device="iPhone 15 Pro" location="New York, US" icon={<FiSmartphone />} />
        </div>
      </div>
    </div>
  );
}

/* ============================================
   NOTIFICATION SETTINGS
============================================ */
function NotificationSettings() {
  return (
    <div className="divide-y divide-gray-100">
      <SectionHeader
        title="Notifications"
        description="Choose what you want to be notified about"
      />

      {/* Email Notifications */}
      <div className="px-6 py-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Email notifications</h3>
        <div className="space-y-4">
          <NotificationRow
            title="Post published"
            description="When your scheduled post goes live"
            defaultChecked
          />
          <NotificationRow
            title="Post failed"
            description="When a post fails to publish"
            defaultChecked
          />
          <NotificationRow
            title="Weekly report"
            description="Analytics summary every Monday"
            defaultChecked
          />
          <NotificationRow
            title="Team activity"
            description="When team members make changes"
            defaultChecked={false}
          />
        </div>
      </div>

      {/* Push Notifications */}
      <div className="px-6 py-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Push notifications</h3>
        <div className="space-y-4">
          <NotificationRow
            title="Comments & mentions"
            description="When someone comments on your posts"
            defaultChecked
          />
          <NotificationRow
            title="New followers"
            description="When you gain new followers"
            defaultChecked={false}
          />
          <NotificationRow
            title="Direct messages"
            description="When you receive a DM"
            defaultChecked
          />
          <NotificationRow
            title="AI suggestions"
            description="When AI finds optimization opportunities"
            defaultChecked
          />
        </div>
      </div>

      <SettingsFooter />
    </div>
  );
}

/* ============================================
   APPEARANCE SETTINGS
============================================ */
function AppearanceSettings({
  theme,
  setTheme,
}: {
  theme: 'light' | 'dark' | 'system';
  setTheme: (t: 'light' | 'dark' | 'system') => void;
}) {
  return (
    <div className="divide-y divide-gray-100">
      <SectionHeader
        title="Appearance"
        description="Customize how the app looks and feels"
      />

      {/* Theme Selection */}
      <div className="px-6 py-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          <ThemeOption
            label="Light"
            active={theme === 'light'}
            onClick={() => setTheme('light')}
            preview={
              <div className="w-full h-16 bg-white rounded-lg border border-gray-200 p-2">
                <div className="w-full h-2 bg-gray-200 rounded mb-1.5" />
                <div className="w-3/4 h-2 bg-gray-100 rounded" />
              </div>
            }
          />
          <ThemeOption
            label="Dark"
            active={theme === 'dark'}
            onClick={() => setTheme('dark')}
            preview={
              <div className="w-full h-16 bg-gray-900 rounded-lg border border-gray-700 p-2">
                <div className="w-full h-2 bg-gray-700 rounded mb-1.5" />
                <div className="w-3/4 h-2 bg-gray-800 rounded" />
              </div>
            }
          />
          <ThemeOption
            label="System"
            active={theme === 'system'}
            onClick={() => setTheme('system')}
            preview={
              <div className="w-full h-16 rounded-lg border border-gray-200 overflow-hidden flex">
                <div className="w-1/2 bg-white p-1.5">
                  <div className="w-full h-1.5 bg-gray-200 rounded mb-1" />
                  <div className="w-3/4 h-1.5 bg-gray-100 rounded" />
                </div>
                <div className="w-1/2 bg-gray-900 p-1.5">
                  <div className="w-full h-1.5 bg-gray-700 rounded mb-1" />
                  <div className="w-3/4 h-1.5 bg-gray-800 rounded" />
                </div>
              </div>
            }
          />
        </div>
      </div>

      {/* Accent Color */}
      <div className="px-6 py-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Accent color</h3>
        <div className="flex gap-3">
          {[
            'bg-blue-600',
            'bg-purple-600',
            'bg-pink-600',
            'bg-green-600',
            'bg-orange-500',
            'bg-gray-900',
          ].map((color, i) => (
            <button
              key={color}
              className={`w-10 h-10 rounded-xl ${color} ${i === 0 ? 'ring-2 ring-offset-2 ring-blue-600' : ''} hover:scale-110 transition-transform shadow-lg`}
            />
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="px-6 py-5">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Language
        </label>
        <select className="w-full md:w-64 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
          <option>English (US)</option>
          <option>English (UK)</option>
          <option>French</option>
          <option>German</option>
          <option>Spanish</option>
          <option>Japanese</option>
        </select>
      </div>

      {/* Compact Mode */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Compact mode</h3>
            <p className="text-sm text-gray-500 mt-0.5">Use smaller spacing throughout</p>
          </div>
          <Toggle />
        </div>
      </div>

      <SettingsFooter />
    </div>
  );
}

/* ============================================
   TEAM SETTINGS
============================================ */
function TeamSettings() {
  const members = [
    { name: 'John Doe', email: 'john@company.com', role: 'Owner', initials: 'JD', color: 'from-blue-500 to-purple-600' },
    { name: 'Sarah Chen', email: 'sarah@company.com', role: 'Admin', initials: 'SC', color: 'from-pink-500 to-rose-500' },
    { name: 'Mike Wilson', email: 'mike@company.com', role: 'Editor', initials: 'MW', color: 'from-amber-500 to-orange-500' },
    { name: 'Emily Park', email: 'emily@company.com', role: 'Viewer', initials: 'EP', color: 'from-emerald-500 to-teal-500' },
  ];

  const roleColors: Record<string, string> = {
    Owner: 'bg-purple-100 text-purple-700',
    Admin: 'bg-blue-100 text-blue-700',
    Editor: 'bg-amber-100 text-amber-700',
    Viewer: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="divide-y divide-gray-100">
      <div className="px-6 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Team</h2>
          <p className="text-sm text-gray-500 mt-1">Manage team members and their roles</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20">
          <FiPlus size={16} />
          Invite member
        </button>
      </div>

      {/* Members Table */}
      <div className="px-6 py-2">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <th className="py-3 pr-4">Member</th>
              <th className="py-3 pr-4 hidden md:table-cell">Role</th>
              <th className="py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((member) => (
              <tr key={member.email} className="group">
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                      {member.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 pr-4 hidden md:table-cell">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${roleColors[member.role]}`}>
                    {member.role}
                  </span>
                </td>
                <td className="py-4 text-right">
                  {member.role !== 'Owner' && (
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <FiMoreHorizontal size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending Invites */}
      <div className="px-6 py-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Pending invites</h3>
        <div className="flex items-center justify-between py-3 px-4 bg-amber-50 border border-amber-100 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <FiUser className="text-amber-600" size={14} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">alex@company.com</p>
              <p className="text-xs text-gray-500">Invited 2 days ago · Editor role</p>
            </div>
          </div>
          <button className="text-sm text-red-600 hover:text-red-700 font-medium">
            Revoke
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   BILLING SETTINGS
============================================ */
function BillingSettings({ plan = 'pro' }: { plan?: string }) {
  const planDetails: Record<string, { name: string; price: string; color: string }> = {
    free: { name: 'Free', price: '$0', color: 'from-gray-500 to-gray-600' },
    starter: { name: 'Starter', price: '$15', color: 'from-blue-500 to-blue-600' },
    pro: { name: 'Pro', price: '$29', color: 'from-purple-500 to-indigo-600' },
    agency: { name: 'Agency', price: '$79', color: 'from-orange-500 to-pink-600' },
  };

  const currentPlan = planDetails[plan] || planDetails.free;

  return (
    <div className="divide-y divide-gray-100">
      <SectionHeader
        title="Billing"
        description="Manage your subscription and payment methods"
      />

      {/* Current Plan */}
      <div className="px-6 py-6">
        <div className={`relative overflow-hidden p-6 bg-gradient-to-br ${currentPlan.color} rounded-2xl text-white shadow-xl`}>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Current plan</p>
                <p className="text-3xl font-bold mt-1">{currentPlan.name}</p>
                <p className="text-sm text-white/80 mt-2">
                  {currentPlan.price}/month · Renews on Jan 15, 2025
                </p>
              </div>
              <button className="px-5 py-2.5 text-sm font-semibold bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm">
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="px-6 py-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Usage this month</h3>
        <div className="space-y-4">
          <UsageBar label="Scheduled posts" used={47} total={100} />
          <UsageBar label="Team members" used={4} total={5} />
          <UsageBar label="Connected accounts" used={3} total={10} />
          <UsageBar label="AI credits" used={156} total={500} />
        </div>
      </div>

      {/* Payment Method */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Payment method</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Add new
          </button>
        </div>
        <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors group">
          <div className="w-14 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">
            VISA
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">•••• •••• •••• 4242</p>
            <p className="text-xs text-gray-500">Expires 12/26</p>
          </div>
          <button className="text-sm text-gray-500 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
            Edit
          </button>
          <FiChevronRight className="text-gray-400" />
        </div>
      </div>

      {/* Billing History */}
      <div className="px-6 py-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Billing history</h3>
        <div className="space-y-2">
          {[
            { date: 'Dec 15, 2024', amount: '$29.00', status: 'Paid' },
            { date: 'Nov 15, 2024', amount: '$29.00', status: 'Paid' },
            { date: 'Oct 15, 2024', amount: '$29.00', status: 'Paid' },
          ].map((invoice, i) => (
            <div key={i} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-900">{invoice.date}</span>
                <span className="text-sm text-gray-500">{invoice.amount}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  {invoice.status}
                </span>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================
   SHARED COMPONENTS
============================================ */
function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-6 py-5">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
}

function InputField({
  label,
  type = 'text',
  defaultValue,
  prefix,
}: {
  label: string;
  type?: string;
  defaultValue?: string;
  prefix?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            {prefix}
          </span>
        )}
        <input
          type={type}
          defaultValue={defaultValue}
          className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all ${prefix ? 'pl-8' : ''}`}
        />
      </div>
    </div>
  );
}

function TextareaField({
  label,
  defaultValue,
  rows = 3,
  hint,
}: {
  label: string;
  defaultValue?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <textarea
        rows={rows}
        defaultValue={defaultValue}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all resize-none"
      />
      {hint && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [enabled, setEnabled] = useState(defaultChecked);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md ${
          enabled ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}

function NotificationRow({
  title,
  description,
  defaultChecked = false,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <Toggle defaultChecked={defaultChecked} />
    </div>
  );
}

function SessionItem({
  device,
  location,
  icon,
  current = false,
}: {
  device: string;
  location: string;
  icon: React.ReactNode;
  current?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-500">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
            {device}
            {current && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Current
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500">{location}</p>
        </div>
      </div>
      {!current && (
        <button className="text-sm text-red-600 hover:text-red-700 font-medium">
          Revoke
        </button>
      )}
    </div>
  );
}

function ThemeOption({
  label,
  active,
  onClick,
  preview,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  preview: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
        active
          ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-600/10'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      {preview}
      <p className={`text-sm font-semibold mt-3 ${active ? 'text-blue-600' : 'text-gray-600'}`}>
        {label}
      </p>
    </button>
  );
}

function UsageBar({ label, used, total }: { label: string; used: number; total: number }) {
  const percentage = Math.min((used / total) * 100, 100);
  const isWarning = percentage > 80;

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-600">{label}</span>
        <span className={`font-semibold ${isWarning ? 'text-amber-600' : 'text-gray-900'}`}>
          {used} / {total}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${isWarning ? 'bg-amber-500' : 'bg-blue-600'}`}
        />
      </div>
    </div>
  );
}

function SettingsFooter() {
  return (
    <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
      <button className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
        Cancel
      </button>
      <button className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-lg shadow-blue-600/20">
        Save changes
      </button>
    </div>
  );
}