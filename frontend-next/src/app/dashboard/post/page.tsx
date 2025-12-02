'use client';
import React from 'react';

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Posts</h1>
        <button className="bg-[#3C48F6] text-white px-4 py-2 rounded-lg text-sm font-medium">New Post</button>
      </div>
      <div className="p-12 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-xl flex items-center justify-center text-gray-500">
        Post Management Coming Soon
      </div>
    </div>
  );
}