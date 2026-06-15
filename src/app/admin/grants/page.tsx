'use client';

import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Clock, Info, Send, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminGrants() {
  const [formData, setFormData] = useState({
    userId: '',
    email: '',
    planType: 'PROFESSIONAL',
    durationDays: '30',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId && !formData.email) {
      toast.error("Veuillez fournir un ID utilisateur ou un Email.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/admin/access-grants', {
        ...formData,
        durationDays: formData.durationDays === '0' ? null : parseInt(formData.durationDays)
      });
      toast.success("Premium access granted successfully");
      setFormData({ ...formData, userId: '', email: '', reason: '' });
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-12">
      <header>
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Access_Grants</h1>
        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Manual override of billing systems</p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white text-black border-4 border-white p-10 shadow-[16px_16px_0px_0px_#3C48F5] space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">User_ID (CUID/UUID)</label>
                          <input 
                              type="text" placeholder="Paste user identity here..."
                              value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})}
                              className="w-full bg-gray-50 border-4 border-black p-4 font-black uppercase text-sm focus:bg-blue-50 outline-none"
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Or User_Email</label>
                          <input 
                              type="email" placeholder="Enter user email..."
                              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                              className="w-full bg-gray-50 border-4 border-black p-4 font-black uppercase text-sm focus:bg-blue-50 outline-none"
                          />
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Target_Plan</label>
                          <select 
                             value={formData.planType} onChange={e => setFormData({...formData, planType: e.target.value})}
                             className="w-full bg-gray-50 border-4 border-black p-4 font-black uppercase text-sm outline-none cursor-pointer"
                          >
                              <option value="STARTER">Starter</option>
                              <option value="PROFESSIONAL">Professional</option>
                              <option value="BUSINESS">Business</option>
                              <option value="ENTERPRISE">Enterprise</option>
                          </select>
                      </div>
                      <div className="space-y-2">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Duration (Days)</label>
                          <select 
                             value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: e.target.value})}
                             className="w-full bg-gray-50 border-4 border-black p-4 font-black uppercase text-sm outline-none cursor-pointer"
                          >
                              <option value="7">7 Days (Trial)</option>
                              <option value="30">30 Days (Monthly)</option>
                              <option value="365">365 Days (Annual)</option>
                              <option value="0">Unlimited (Lifetime)</option>
                          </select>
                      </div>
                  </div>

                  <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Reason / Reference</label>
                      <textarea 
                         rows={3} placeholder="Creator Fund Approval, Beta Testing, etc."
                         value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}
                         className="w-full bg-gray-50 border-4 border-black p-4 font-bold text-sm outline-none resize-none"
                      />
                  </div>

                  <button 
                    type="submit" disabled={isSubmitting}
                    className="w-full bg-[#3C48F5] text-white py-6 font-black uppercase text-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <>Execute Grant <Send size={24} /></>}
                  </button>
              </form>
          </div>

          <div className="space-y-6">
              <InfoCard 
                icon={<Clock />} 
                title="Strict Logs" 
                desc="All manual grants are logged with admin ID for audit compliance." 
              />
              <InfoCard 
                icon={<ShieldCheck />} 
                title="Auto Expire" 
                desc="Systems will automatically revert plan to FREE upon expiration date." 
              />
          </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc }: any) {
    return (
        <div className="bg-zinc-900 border-2 border-zinc-800 p-6">
            <div className="text-[#3C48F5] mb-3">{icon}</div>
            <h4 className="font-black uppercase text-xs mb-2">{title}</h4>
            <p className="text-[10px] font-bold text-gray-500 leading-relaxed">{desc}</p>
        </div>
    )
}
