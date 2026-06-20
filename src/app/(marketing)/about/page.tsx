'use client';

import React, { useState, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { FaLinkedinIn, FaTwitter, FaGithub } from 'react-icons/fa';
import { ArrowRight, ChevronDown, Upload, Send, X } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';


const inputClass =
  'w-full bg-white dark:bg-black border-2 border-black dark:border-white/20 px-4 py-3 font-bold text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#174CD2] dark:focus:border-[#174CD2] transition-colors uppercase';

export default function AboutPage() {
  const { t } = useLanguage();
  const [formOpen, setFormOpen] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: '', email: '', profession: '', message: '' });

  const team = [
    {
      name: 'Christian Mbouyemen',
      role: t('CEO — Best-Corp', 'PDG — Best-Corp'),
      bio: t(
        'Serial entrepreneur and business strategist driving Best-Corp\'s vision across Central Africa. Christian turns bold market opportunities into structured, scalable ventures — EazyPost being his latest bet on the African creator economy.',
        "Entrepreneur en série et stratège d'affaires, Christian pilote la vision de Best-Corp en Afrique Centrale. Il transforme les opportunités de marché en entreprises structurées et scalables — EazyPost étant son dernier pari sur l'économie créative africaine."
      ),
      image: 'https://i.pravatar.cc/300?img=11',
      accent: 'bg-[#174CD2]',
      socials: { linkedin: '#', twitter: '#', github: '#' },
    },
    {
      name: 'Pene Nkouam Bryan',
      role: t('Lead Engineer & Co-Founder', 'Ingénieur Principal & Co-Fondateur'),
      bio: t(
        'Full-stack architect and the technical backbone of EazyPost. Bryan designs and ships the systems that power scheduling, AI generation, and multi-platform publishing — obsessed with building things that actually work at scale.',
        "Architecte full-stack et pilier technique d'EazyPost. Bryan conçoit et livre les systèmes qui alimentent la planification, la génération IA et la publication multi-plateforme — obsédé par la construction de choses qui fonctionnent vraiment à l'échelle."
      ),
      image: 'https://i.pravatar.cc/300?img=32',
      accent: 'bg-[#174CD2]',
      socials: { linkedin: '#', twitter: '#', github: '#' },
    },
    {
      name: 'Yvan Ouatadem Loic',
      role: t('Full-Stack Developer', 'Développeur Full-Stack'),
      bio: t(
        'Frontend-leaning full-stack developer who crafts the interfaces creators interact with every day. Loic bridges design and engineering — if it looks good and works fast, he probably built it.',
        "Développeur full-stack orienté frontend qui conçoit les interfaces que les créateurs utilisent chaque jour. Loic fait le pont entre design et ingénierie — si ça rend bien et va vite, c'est probablement lui qui l'a construit."
      ),
      image: 'https://i.pravatar.cc/300?img=47',
      accent: 'bg-pink-400',
      socials: { linkedin: '#', twitter: '#', github: '#' },
    },
    {
      name: 'Team Member',
      role: t('ML Engineer', 'Ingénieur ML'),
      bio: t(
        'Training models to predict the perfect moment your audience is listening.',
        "Entraîner des modèles pour prédire le moment parfait où votre audience est à l'écoute."
      ),
      image: 'https://i.pravatar.cc/300?img=68',
      accent: 'bg-green-400',
      socials: { linkedin: '#', twitter: '#', github: '#' },
    },
  ];

  const values = [
    {
      icon: 'https://cdn.lordicon.com/msoeawqm.json',
      title: t('Built for Africa', "Fait pour l'Afrique"),
      desc: t(
        'We understand the African creator ecosystem and build tools that work for it — no compromises.',
        "Nous comprenons l'écosystème des créateurs africains et construisons des outils adaptés — sans compromis."
      ),
    },
    {
      icon: 'https://cdn.lordicon.com/hbslfpbm.json',
      title: t('Move Fast', 'Aller Vite'),
      desc: t(
        'We ship, iterate, and improve. Speed is a feature, not an afterthought.',
        "Nous livrons, itérons et améliorons. La vitesse est une fonctionnalité, pas une réflexion après coup."
      ),
    },
    {
      icon: 'https://cdn.lordicon.com/jgnijqkj.json',
      title: t('Creator-First', 'Créateur Avant Tout'),
      desc: t(
        'Every decision starts with one question: does this help creators grow?',
        'Chaque décision commence par une question : est-ce que cela aide les créateurs à grandir ?'
      ),
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans">
      <Navbar />

      {/* Hero */}
      <section className="border-b-4 border-black dark:border-white/10 bg-white dark:bg-black py-20 md:py-32 px-4 text-center relative overflow-hidden">
        <div className="absolute top-6 left-6 w-10 h-10 bg-[#174CD2] border-4 border-black dark:border-white/20 rotate-12 hidden md:block" />
        <div className="absolute bottom-6 right-10 w-16 h-16 bg-[#174CD2] border-4 border-black dark:border-white/20 -rotate-6 hidden md:block" />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-block bg-black dark:bg-white text-white dark:text-black px-4 py-1 text-xs font-black uppercase tracking-widest mb-6">
            {t('THE TEAM BEHIND EASYPOST', "L'ÉQUIPE DERRIÈRE EASYPOST")}
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-black dark:text-white uppercase leading-[0.9] tracking-tighter mb-6">
            {t('MEET THE', 'RENCONTREZ LES')}<br />
            <span className="bg-black dark:bg-white text-white dark:text-black px-3 mt-2 inline-block">
              {t('BUILDERS', 'BÂTISSEURS')}
            </span>
          </h1>
          <p className="text-gray-600 dark:text-zinc-400 text-lg md:text-xl font-bold max-w-xl mx-auto">
            {t(
              "We're a small, passionate team on a mission to make social media management accessible for every African creator and business.",
              "Nous sommes une petite équipe passionnée avec la mission de rendre la gestion des réseaux sociaux accessible à chaque créateur et entreprise africains."
            )}
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16 md:py-24 px-4 border-b-4 border-black dark:border-white/10 bg-white dark:bg-black">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white mb-12 text-center">
            {t('WHO WE ARE', 'QUI NOUS SOMMES')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <div
                key={i}
                className="border-4 border-black dark:border-white/20 bg-white dark:bg-black shadow-[6px_6px_0px_0px_#000] dark:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-none transition-all flex flex-col"
              >
                <div className="relative h-48 w-full border-b-4 border-black dark:border-white/20 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-300"
                    sizes="300px"
                  />
                  <div className={`absolute bottom-0 left-0 right-0 h-1 ${member.accent}`} />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="font-black text-base uppercase text-black dark:text-white leading-tight">{member.name}</p>
                  <p className="text-xs font-bold uppercase text-[#174CD2] mt-1 mb-3 tracking-wider">{member.role}</p>
                  <p className="text-sm text-gray-600 dark:text-zinc-400 font-medium leading-snug flex-1">{member.bio}</p>
                  <div className="flex gap-3 mt-4 pt-4 border-t-2 border-black dark:border-white/10">
                    <a href={member.socials.linkedin} className="text-black dark:text-white hover:text-[#174CD2] transition-colors">
                      <FaLinkedinIn size={16} />
                    </a>
                    <a href={member.socials.twitter} className="text-black dark:text-white hover:text-[#174CD2] transition-colors">
                      <FaTwitter size={16} />
                    </a>
                    <a href={member.socials.github} className="text-black dark:text-white hover:text-[#174CD2] transition-colors">
                      <FaGithub size={16} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 px-4 border-b-4 border-black dark:border-white/10 bg-zinc-50 dark:bg-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white mb-4 text-center">
            {t('WHAT WE STAND FOR', 'NOS VALEURS')}
          </h2>
          <p className="text-center text-gray-500 dark:text-zinc-500 font-medium mb-16 max-w-xl mx-auto">
            {t(
              'Three principles that guide every line of code we write.',
              "Trois principes qui guident chaque ligne de code que nous écrivons."
            )}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {values.map((v, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="mb-5 transition-transform group-hover:-translate-y-1 duration-300">
                  <lord-icon
                    src={v.icon}
                    trigger="hover"
                    colors="primary:#174CD2,secondary:#111111"
                    style={{ width: '72px', height: '72px' }}
                  />
                </div>
                <div className="w-8 h-1 bg-[#174CD2] mb-4" />
                <h3 className="font-black text-xl uppercase text-black dark:text-white mb-3 tracking-tight">{v.title}</h3>
                <p className="text-sm text-gray-500 dark:text-zinc-500 font-medium leading-relaxed max-w-xs">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4 text-center bg-white dark:bg-black border-t-4 border-black dark:border-white/10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black uppercase text-black dark:text-white leading-tight mb-6">
            {t('WANT TO JOIN', 'ENVIE DE REJOINDRE')}<br />
            <span className="text-[#174CD2]">{t('THE CREW?', "L'ÉQUIPE ?")}</span>
          </h2>
          <p className="text-gray-600 dark:text-white/60 font-bold mb-8 text-lg">
            {t(
              "We're always looking for talented people who care about creators.",
              "Nous cherchons toujours des personnes talentueuses qui se soucient des créateurs."
            )}
          </p>

          <button
            onClick={() => setFormOpen((v) => !v)}
            className="inline-flex items-center gap-2 bg-[#174CD2] text-white font-black uppercase px-8 py-4 border-4 border-black dark:border-white/30 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.15)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.15)] transition-all text-lg"
          >
            {t('GET IN TOUCH', 'NOUS CONTACTER')}
            <motion.span animate={{ rotate: formOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={20} />
            </motion.span>
          </button>

          {/* Application Form */}
          <AnimatePresence>
            {formOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="bg-white dark:bg-black border-4 border-black dark:border-white/20 shadow-[8px_8px_0px_0px_#000] dark:shadow-none text-left p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black dark:border-white/10">
                    <div>
                      <h3 className="font-black text-xl uppercase text-black dark:text-white tracking-tight">
                        {t('Apply to Join', 'Postuler')}
                      </h3>
                      <p className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mt-1">
                        {t('Tell us about yourself', 'Parlez-nous de vous')}
                      </p>
                    </div>
                    <button onClick={() => setFormOpen(false)} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="py-12 text-center"
                    >
                      <div className="w-16 h-16 bg-[#174CD2] border-4 border-black dark:border-white/20 flex items-center justify-center mx-auto mb-4">
                        <Send size={28} className="text-white" />
                      </div>
                      <h4 className="font-black text-2xl uppercase text-black dark:text-white mb-2">
                        {t('Application Sent!', 'Candidature Envoyée !')}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-zinc-500 font-medium">
                        {t(
                          "We'll review your application and get back to you soon.",
                          'Nous examinerons votre candidature et vous recontacterons bientôt.'
                        )}
                      </p>
                      <button
                        onClick={() => { setSubmitted(false); setFormOpen(false); setForm({ name: '', email: '', profession: '', message: '' }); setCvFile(null); }}
                        className="mt-6 text-xs font-black uppercase text-[#174CD2] hover:underline"
                      >
                        {t('Close', 'Fermer')}
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-2">
                            {t('Full Name *', 'Nom Complet *')}
                          </label>
                          <input
                            required
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder={t('Your name', 'Votre nom')}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-2">
                            {t('Email *', 'Email *')}
                          </label>
                          <input
                            required
                            type="email"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            placeholder="you@example.com"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-2">
                          {t('Profession / Role *', 'Profession / Rôle *')}
                        </label>
                        <select
                          required
                          value={form.profession}
                          onChange={e => setForm(f => ({ ...f, profession: e.target.value }))}
                          className={inputClass}
                        >
                          <option value="">{t('Select a role', 'Sélectionner un rôle')}</option>
                          <option value="engineering">{t('Software Engineer', 'Ingénieur Logiciel')}</option>
                          <option value="design">{t('Product Designer', 'Designer Produit')}</option>
                          <option value="ml">{t('ML / Data Scientist', 'ML / Data Scientist')}</option>
                          <option value="marketing">{t('Marketing', 'Marketing')}</option>
                          <option value="other">{t('Other', 'Autre')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-2">
                          {t('Why EasyPost?', 'Pourquoi EasyPost ?')}
                        </label>
                        <textarea
                          rows={3}
                          value={form.message}
                          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                          placeholder={t(
                            "Tell us why you want to join and what you'd bring to the team...",
                            "Dites-nous pourquoi vous voulez rejoindre l'équipe et ce que vous apporteriez..."
                          )}
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-2">
                          {t('CV / Resume', 'CV / Curriculum Vitae')}
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={e => setCvFile(e.target.files?.[0] || null)}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-black dark:border-white/20 hover:border-[#174CD2] dark:hover:border-[#174CD2] bg-white dark:bg-black px-4 py-4 flex items-center justify-center gap-3 transition-colors group"
                        >
                          <Upload size={18} className="text-gray-400 group-hover:text-[#174CD2] transition-colors" />
                          <span className="text-xs font-black uppercase text-gray-500 dark:text-zinc-500 group-hover:text-[#174CD2] transition-colors">
                            {cvFile ? cvFile.name : t('Upload PDF or DOC', 'Téléverser PDF ou DOC')}
                          </span>
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-[#174CD2] text-white font-black uppercase px-6 py-4 border-4 border-black dark:border-white/20 shadow-[4px_4px_0px_0px_#000] dark:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] dark:hover:shadow-none transition-all mt-2"
                      >
                        {t('SEND APPLICATION', 'ENVOYER LA CANDIDATURE')} <ArrowRight size={18} />
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </div>
  );
}
