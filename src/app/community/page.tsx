'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MessageCircle, Book, Github, Twitter, Heart, Users } from 'lucide-react';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#111827] text-gray-900 dark:text-white font-sans selection:bg-[#314BEC] selection:text-white">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4">
        {/* Hero */}
        
        <section className="text-center max-w-4xl mx-auto mb-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3"
          >
            <Heart className="text-[#314BEC] w-8 h-8 fill-current" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6"
          >
            Join the <span className="text-[#314BEC]">EasyPost</span> Community
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Connect with thousands of creators, marketers, and developers. Share tips, get help, and shape the future of the platform.
          </motion.p>
        </section>

        {/* Resources Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ResourceCard 
            icon={<MessageCircle className="w-6 h-6 text-indigo-500" />}
            title="Discord Server"
            desc="Chat in real-time with the team and other users. Get instant support."
            link="https://discord.gg"
            cta="Join Server"
            delay={0.2}
          />
          <ResourceCard 
            icon={<Twitter className="w-6 h-6 text-blue-400" />}
            title="Twitter / X"
            desc="Follow for latest updates, tips, and behind-the-scenes content."
            link="https://twitter.com"
            cta="Follow Us"
            delay={0.3}
          />
          <ResourceCard 
            icon={<Book className="w-6 h-6 text-green-500" />}
            title="Documentation"
            desc="Detailed guides, API references, and tutorials to master EasyPost."
            link="#"
            cta="Read Docs"
            delay={0.4}
          />
          <ResourceCard 
            icon={<Github className="w-6 h-6 text-gray-900 dark:text-white" />}
            title="Open Roadmap"
            desc="Vote on features, report bugs, and see what we're building next."
            link="#"
            cta="View Roadmap"
            delay={0.5}
          />
          <ResourceCard 
            icon={<Users className="w-6 h-6 text-orange-500" />}
            title="Creator Fund"
            desc="We sponsor creators! Apply to get free access and promotion."
            link="#"
            cta="Apply Now"
            delay={0.6}
          />
        </div>

        {/* Contributors Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mt-24 text-center bg-gray-50 dark:bg-gray-900 rounded-3xl p-12 border border-gray-200 dark:border-gray-800"
        >
          <h2 className="text-2xl font-bold mb-4">Contribute to EasyPost</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Are you a developer? We are open source! Help us build the best social media tool.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
             {[...Array(8)].map((_, i) => (
               <div key={i} className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 border-2 border-white dark:border-gray-800" />
             ))}
             <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500">
               +40
             </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

function ResourceCard({ icon, title, desc, link, cta, delay }: any) {
  return (
    <motion.a 
      href={link}
      target="_blank"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-[#314BEC] hover:shadow-lg transition-all"
    >
      <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{desc}</p>
      <span className="text-sm font-bold text-[#314BEC] flex items-center gap-1">
        {cta} &rarr;
      </span>
    </motion.a>
  )
}