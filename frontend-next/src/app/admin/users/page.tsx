'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Search, Shield, ShieldCheck, CreditCard, 
  Crown, Filter, ChevronRight, Loader2, RefreshCw
} from 'lucide-react';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import { api } from '@/src/lib/api';
import { toast } from 'sonner';
import SpinningLoader from '@/src/components/SpinningLoader';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  planType: string;
  accountType: string;
  status: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get<User[]>('/users');
      setUsers(res);
    } catch (e) {
      toast.error("Failed to fetch users. Admin access required.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePlanUpdate = async (userId: string, planType: string) => {
    setUpdatingId(userId);
    try {
      await api.patch(`/users/${userId}/plan`, { planType });
      toast.success(`User updated to ${planType}`);
      // Refresh local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, planType } : u));
    } catch (e) {
      toast.error("Permission denied");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && users.length === 0) return <SpinningLoader fullScreen={true} />;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#3C48F5] selection:text-white">
      <Navbar />
      
      <main className="pt-28 pb-20 px-4 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b-4 border-white pb-8">
            <div>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[#3C48F5] border-2 border-black shadow-[4px_4px_0px_0px_#fff]">
                        <ShieldCheck size={24} />
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Control_Center</h1>
                </motion.div>
                <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">User Access & Permission Management</p>
            </div>

            <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#3C48F5] transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="SEARCH_BY_EMAIL_OR_NAME..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-zinc-900 border-4 border-white font-black uppercase text-sm focus:outline-none focus:bg-white focus:text-black transition-all"
                />
            </div>
        </div>

        {/* STATS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <StatCard label="Total_Users" value={users.length} color="bg-white text-black" />
            <StatCard label="Premium_Active" value={users.filter(u => u.planType !== 'FREE').length} color="bg-[#3C48F5] text-white" />
            <StatCard label="Creators" value={users.filter(u => u.accountType === 'CREATOR').length} color="bg-zinc-800 text-white" />
            <button onClick={fetchUsers} className="bg-zinc-900 border-4 border-white hover:bg-[#3C48F5] transition-all flex flex-col items-center justify-center p-4 shadow-[8px_8px_0px_0px_#000]">
                <RefreshCw size={32} className={loading ? 'animate-spin' : ''} />
                <span className="font-black text-[10px] uppercase mt-2">Sync_Database</span>
            </button>
        </div>

        {/* USER LIST */}
        <div className="bg-zinc-900 border-4 border-white overflow-hidden shadow-[16px_16px_0px_0px_#3C48F5]">
            <div className="grid grid-cols-12 bg-white text-black p-4 font-black uppercase text-xs tracking-widest border-b-4 border-black">
                <div className="col-span-5 md:col-span-4">Identity</div>
                <div className="hidden md:block col-span-3">Join_Date</div>
                <div className="col-span-4 md:col-span-3 text-center">Current_Plan</div>
                <div className="col-span-3 md:col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y-2 divide-zinc-800 max-h-[600px] overflow-y-auto scrollbar-hide">
                {filteredUsers.length === 0 ? (
                    <div className="p-20 text-center text-gray-500 font-black uppercase tracking-widest">No matching records found</div>
                ) : filteredUsers.map((user) => (
                    <div key={user.id} className="grid grid-cols-12 p-4 items-center hover:bg-zinc-800 transition-colors">
                        <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-black font-black">
                                {user.firstName?.charAt(0) || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="font-black uppercase truncate text-sm">{user.firstName} {user.lastName}</p>
                                <p className="text-[10px] font-mono text-gray-500 truncate">{user.email}</p>
                            </div>
                        </div>
                        <div className="hidden md:block col-span-3 font-mono text-xs text-gray-400 uppercase">
                            {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        <div className="col-span-4 md:col-span-3 flex justify-center">
                            <span className={`px-3 py-1 border-2 font-black text-[10px] uppercase ${
                                user.planType === 'FREE' ? 'border-zinc-700 text-gray-500' : 'border-[#3C48F5] text-[#3C48F5] bg-blue-500/10'
                            }`}>
                                {user.planType}
                            </span>
                        </div>
                        <div className="col-span-3 md:col-span-2 flex justify-end gap-2">
                            <PlanSelector 
                                currentPlan={user.planType} 
                                onSelect={(plan) => handlePlanUpdate(user.id, plan)} 
                                isLoading={updatingId === user.id}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ label, value, color }: any) {
    return (
        <div className={`${color} border-4 border-white p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col`}>
            <span className="text-[10px] font-black uppercase tracking-wider opacity-70 mb-1">{label}</span>
            <span className="text-4xl font-black">{value}</span>
        </div>
    )
}

function PlanSelector({ currentPlan, onSelect, isLoading }: { currentPlan: string, onSelect: (p: string) => void, isLoading: boolean }) {
    const plans = ['FREE', 'STARTER', 'PROFESSIONAL', 'BUSINESS'];
    
    if (isLoading) return <Loader2 size={20} className="animate-spin text-[#3C48F5]" />;

    return (
        <select 
            value={currentPlan}
            onChange={(e) => onSelect(e.target.value)}
            className="bg-black border-2 border-white text-[10px] font-black p-1 uppercase focus:outline-none focus:bg-white focus:text-black transition-all cursor-pointer"
        >
            {plans.map(p => (
                <option key={p} value={p}>{p}</option>
            ))}
        </select>
    )
}