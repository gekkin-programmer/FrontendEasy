'use client';

import React, { useState } from 'react';
import { 
  FiHome, FiGrid, FiUsers, FiBell, FiSearch, FiPlus, 
  FiMoreVertical, FiCheckCircle, FiClock, FiEdit3, FiTrendingUp 
} from 'react-icons/fi';
import { FaSlack, FaJira, FaFigma } from 'react-icons/fa';

// --- Mock Data ---
const members = [
  { id: 1, name: 'Sarah K.', role: 'Admin', img: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'Mike R.', role: 'Editor', img: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, name: 'Jessica', role: 'Viewer', img: 'https://i.pravatar.cc/150?u=3' },
];

const notifications = [
  { id: 1, text: 'Sarah commented on "Q3 Roadmap"', time: '2m ago', type: 'comment' },
  { id: 2, text: 'System: Monthly report ready', time: '1h ago', type: 'system' },
  { id: 3, text: 'New member joined: Alex D.', time: '3h ago', type: 'user' },
];

const posts = [
  { title: 'Introducing the new API', status: 'Scheduled', date: 'Tomorrow, 9AM', category: 'DevRel' },
  { title: '5 Tips for Productivity', status: 'Draft', date: 'Last edited 10m ago', category: 'Marketing' },
  { title: 'Welcome to the team', status: 'Published', date: 'Yesterday', category: 'HR' },
];

export default function BrandDashboard() {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans text-gray-800">
      
      {/* 1. Slim Sidebar (Navigation) */}
      <aside className="w-20 bg-white border-r border-gray-100 flex flex-col items-center py-8 sticky top-0 h-screen z-20">
        {/* Brand Logo */}
        <div className="w-10 h-10 bg-[#3C48F6] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30 mb-10">
          H
        </div>

        {/* Nav Icons */}
        <nav className="flex-1 space-y-6 w-full flex flex-col items-center">
          <NavIcon icon={FiHome} active />
          <NavIcon icon={FiGrid} />
          <NavIcon icon={FiUsers} />
          <div className="relative">
            <NavIcon icon={FiBell} />
            <span className="absolute top-0 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
        </nav>

        {/* User Profile */}
        <img src="https://i.pravatar.cc/150?u=8" className="w-10 h-10 rounded-full border-2 border-gray-100" alt="User" />
      </aside>

      {/* 2. Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        
        {/* Header: Workspace & Actions */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <span>Workspaces</span> / <span className="text-gray-800 font-medium">Acme Corp</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Pill */}
            <div className="hidden md:flex items-center bg-white px-4 py-2.5 rounded-full border border-gray-200 shadow-sm focus-within:border-[#3C48F6] transition-colors">
              <FiSearch className="text-gray-400 mr-2" />
              <input type="text" placeholder="Search projects..." className="bg-transparent outline-none text-sm w-48" />
            </div>
            
            {/* Primary Action Button */}
            <button className="bg-[#3C48F6] hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5">
              <FiPlus className="w-4 h-4" /> Create Post
            </button>
          </div>
        </header>

        {/* Top Grid: Analytics & Members */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* Analytics (Span 8) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                 <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Reach</h3>
                 <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-4xl font-bold text-gray-900">128.4K</span>
                 </div>
              </div>
              {/* Interactive Tabs */}
              <div className="flex bg-gray-50 p-1 rounded-lg">
                <button className="px-3 py-1 text-xs font-medium rounded-md bg-white text-gray-900 shadow-sm">7 Days</button>
                <button className="px-3 py-1 text-xs font-medium rounded-md text-gray-500 hover:text-gray-900">30 Days</button>
              </div>
            </div>

            {/* Styled Bar Chart using Brand Color */}
            <div className="mt-8 h-32 flex items-end gap-2 justify-between">
              {[35, 55, 40, 70, 50, 90, 65, 85, 60, 75, 95, 60, 80, 50].map((h, i) => (
                <div key={i} className="w-full bg-[#3C48F6]/10 rounded-t-sm relative group cursor-pointer" style={{ height: `${h}%` }}>
                  <div className="absolute bottom-0 w-full bg-[#3C48F6] rounded-t-sm transition-all duration-300 h-0 group-hover:h-full opacity-80"></div>
                  <div className="w-full h-full bg-[#3C48F6] rounded-t-sm opacity-20"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Members & Quick Actions (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Members Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex-1">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-gray-900">Team Members</h3>
                 <button className="text-[#3C48F6] text-xs font-bold hover:underline">Invite</button>
               </div>
               <div className="space-y-4">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center gap-3">
                       <img src={m.img} alt={m.name} className="w-9 h-9 rounded-full" />
                       <div className="flex-1">
                         <p className="text-sm font-medium text-gray-900">{m.name}</p>
                         <p className="text-xs text-gray-400">{m.role}</p>
                       </div>
                       <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Content & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Posts Manager (Span 2) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-lg">Content Pipeline</h3>
              <div className="flex gap-4 text-sm">
                 {['Posts', 'Projects', 'Files'].map(tab => (
                   <button 
                    key={tab}
                    className={`pb-1 font-medium transition-colors ${activeTab === tab.toLowerCase() ? 'text-[#3C48F6] border-b-2 border-[#3C48F6]' : 'text-gray-400'}`}
                   >
                     {tab}
                   </button>
                 ))}
              </div>
            </div>
            
            {/* Post List */}
            <div className="divide-y divide-gray-50">
              {posts.map((post, i) => (
                <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                   <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        post.status === 'Published' ? 'bg-green-100 text-green-600' : 
                        post.status === 'Scheduled' ? 'bg-blue-100 text-blue-600' : 
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {post.status === 'Published' ? <FiCheckCircle /> : post.status === 'Scheduled' ? <FiClock /> : <FiEdit3 />}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{post.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{post.date}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            {post.category}
                          </span>
                        </div>
                      </div>
                   </div>
                   <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-[#3C48F6] transition-all">
                     <FiMoreVertical />
                   </button>
                </div>
              ))}
            </div>
            <div className="p-3 text-center">
              <button className="text-sm font-medium text-gray-500 hover:text-[#3C48F6] transition-colors">View All Content</button>
            </div>
          </div>

          {/* Notifications & Connected Apps (Span 1) */}
          <div className="space-y-6">
             {/* Notifications Widget */}
             <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  Activity Feed 
                  <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full">3 New</span>
                </h3>
                <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:h-full before:w-0.5 before:bg-gray-100">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="relative pl-6">
                       <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#3C48F6]"></div>
                       <p className="text-sm text-gray-800 leading-tight">{notif.text}</p>
                       <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
             </div>

             {/* Connected Apps (Workspace) */}
             <div className="bg-[#3C48F6] rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-bold mb-1">Integrations</h3>
                  <p className="text-blue-100 text-xs mb-4">3 apps connected</p>
                  <div className="flex -space-x-2 mb-4">
                     <div className="w-8 h-8 rounded-full bg-white text-gray-900 flex items-center justify-center border-2 border-[#3C48F6]"><FaSlack size={14}/></div>
                     <div className="w-8 h-8 rounded-full bg-white text-gray-900 flex items-center justify-center border-2 border-[#3C48F6]"><FaJira size={14}/></div>
                     <div className="w-8 h-8 rounded-full bg-white text-gray-900 flex items-center justify-center border-2 border-[#3C48F6]"><FaFigma size={14}/></div>
                  </div>
                  <button className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 rounded-lg transition">Manage</button>
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
             </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// Subcomponent for Nav
function NavIcon({ icon: Icon, active = false }: { icon: any; active?: boolean }) {
  return (
    <button className={`p-3 rounded-xl transition-all duration-200 group relative flex items-center justify-center
      ${active ? 'bg-[#3C48F6]/10 text-[#3C48F6]' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}>
      <Icon className="w-6 h-6" />
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-1 h-8 bg-[#3C48F6] rounded-r-full"></div>
      )}
    </button>
  );
}