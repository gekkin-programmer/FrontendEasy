'use client';
import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatDistanceToNow } from 'date-fns';
import { Send, CheckCircle, MessageSquare } from 'lucide-react';

export default function CollaborationPanel({ postId }: { postId: Id<"posts"> }) {
  const comments = useQuery(api.collaboration.getComments, { postId });
  const addComment = useMutation(api.collaboration.addComment);
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addComment({ postId, content: text });
    setText("");
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border-l border-gray-200 w-80">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <MessageSquare size={14} className="text-blue-600"/> Internal Feedback
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments?.map(c => (
            <div key={c._id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-bold text-gray-900">{c.userName}</span>
                    <span className="text-[10px] text-gray-400">{formatDistanceToNow(c.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-700">{c.content}</p>
            </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-200">
        <div className="relative">
            <input 
                className="w-full pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
                placeholder="Type @name to mention..."
                value={text}
                onChange={e => setText(e.target.value)}
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600">
                <Send size={14} />
            </button>
        </div>
      </form>
    </div>
  );
}