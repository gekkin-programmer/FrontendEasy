// FIXED: Added useState and motion imports
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// FIXED: Kept FaArrowRight for the button at the bottom
import { FaArrowRight } from 'react-icons/fa';

// NOTE: useLanguage is not used in this corrected version to simplify things.
// You can add it back later if you translate the resource content.
// import { useLanguage } from '../context/LanguageContext';

// This is the correct data structure for your ResourceCard
const resourcesData = [
  {
    id: 1,
    title: 'Social Media Marketing',
    description: 'Master the art of social selling with our comprehensive marketing guides.',
    bgGradient: 'from-blue-500 to-cyan-500',
    image:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'Marketing Resources',
    description: 'Access our library of templates, guides, and best practices.',
    bgGradient: 'from-purple-500 to-pink-500',
    image:
      'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    title: 'Best Time to Post',
    description: 'Optimize your posting schedule with data-driven insights.',
    bgGradient: 'from-green-500 to-emerald-500',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    title: 'Marketing 101',
    description: 'New to marketing? Start with our beginner-friendly guide.',
    bgGradient: 'from-yellow-500 to-orange-500',
    image:
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 5,
    title: 'Social Media Glossary',
    description: 'Demystify marketing jargon with our comprehensive glossary.',
    bgGradient: 'from-red-500 to-rose-500',
    image:
      'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 6,
    title: 'Free Marketing Tools',
    description: 'Powerful tools to boost your marketing efforts, completely free.',
    bgGradient: 'from-indigo-500 to-purple-500',
    image:
      'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=80',
  },
];

// Type definitions remain the same, which is good.
type Resource = {
  id: number;
  title: string;
  description: string;
  bgGradient: string;
  image: string;
};

interface ResourceCardProps {
  resource: Resource;
  index: number;
}

const ResourceCard = ({ resource, index }: ResourceCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Background */}
      <div className="relative h-64 overflow-hidden">
        <motion.img
          src={resource.image}
          alt={resource.title}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.6 }}
        />
        {/* Gradient Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${resource.bgGradient} opacity-60 group-hover:opacity-75 transition-opacity duration-500`}
        ></div>

        {/* Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-800"
        >
          New
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative bg-white p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
          {resource.title}
        </h3>
        <p className="text-gray-600 mb-4 leading-relaxed">{resource.description}</p>

        {/* FIXED: This button was inside a motion component, which is fine, but the SVG logic was slightly complex. Simplified for clarity. */}
        <a href="#" className="flex items-center text-blue-600 font-semibold group/button">
          <span>Learn More</span>
          <FaArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover/button:translate-x-1" />
        </a>
      </div>

      {/* Glow effect on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(1200px 200px at 50% 110%, rgba(147, 51, 234, .08), transparent 60%)',
        }}
      />
      {/* FIXED: Removed the invalid closing </a> and <span> tags that were here */}
    </motion.div>
  );
};

const ResourcesSection: React.FC = () => {
  // FIXED: Removed the incorrect 'resources' array and 'useLanguage' hook from here.
  // We will use the 'resourcesData' array defined at the top of the file.

  return (
    // FIXED: Added bg-gray-50 and py-24 from the old <section> tag to keep styling consistent
    <section className="bg-gray-50 py-24 px-4 font-sans">
      <div className="relative max-w-7xl mx-auto">
        {/* FIXED: Removed the duplicate header. Kept this more modern, animated one. */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full mb-6"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span className="text-sm font-semibold text-gray-700">Resource Center</span>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Everything You Need
            </span>
            <br />
            <span className="text-gray-900">to Succeed</span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Unlock the full potential of your marketing strategy with our comprehensive
            <span className="font-semibold text-gray-800"> resource library</span>, curated by industry
            experts.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* FIXED: Mapped over the correct 'resourcesData' array */}
          {resourcesData.map((resource, index) => (
            <ResourceCard key={resource.id} resource={resource} index={index} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-xl bg-[#2C4B42] px-8 py-4 text-base font-semibold text-white transition-colors duration-300 hover:bg-[#21352f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
          >
            {/* FIXED: Removed t() function and used plain text */}
            Explore all resources
            <FaArrowRight />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
