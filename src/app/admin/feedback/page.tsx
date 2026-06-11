'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, User, Calendar, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import SpinningLoader from '@/components/SpinningLoader';

interface Feedback {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  author: { firstName: string, email: string };
  _count: { upvotes: number };
  createdAt: string;
}

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await api.get<Feedback[]>('/admin/feedback');
        setFeedback(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  if (loading) return <SpinningLoader fullScreen={true} />;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Feedback_Hub</h1>
        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Community voice and roadmap signals</p>
      </header>

      <div className="grid gap-6">
          {feedback.length === 0 ? (
              <div className="p-20 border-4 border-dashed border-zinc-800 text-center text-gray-500 font-black uppercase">
                  No feedback received yet
              </div>
          ) : feedback.map((item) => (
              <div key={item.id} className="bg-zinc-900 border-4 border-white p-6 shadow-[8px_8px_0px_0px_#3C48F5] flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 text-[8px] font-black uppercase border-2 ${
                              item.category === 'BUG' ? 'border-red-500 text-red-500' : 'border-[#3C48F5] text-[#3C48F5]'
                          }`}>
                              {item.category}
                          </span>
                          <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest">{item.status}</span>
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight">{item.title}</h3>
                      <p className="text-sm text-gray-400 font-bold leading-relaxed">{item.description}</p>
                      
                      <div className="flex items-center gap-6 pt-4 border-t border-zinc-800">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500">
                              <User size={14} /> {item.author.firstName} ({item.author.email})
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500">
                              <Calendar size={14} /> {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                      </div>
                  </div>

                  <div className="md:w-32 flex flex-col items-center justify-center border-l-2 border-zinc-800 pl-8">
                      <div className="text-center">
                          <p className="text-3xl font-black">{item._count.upvotes}</p>
                          <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Upvotes</p>
                      </div>
                      <button className="mt-4 p-2 bg-white text-black border-2 border-black shadow-[4px_4px_0px_0px_#3C48F5] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                          <ExternalLink size={16} />
                      </button>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}
