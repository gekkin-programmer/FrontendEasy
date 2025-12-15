import React from 'react';
import { resourcesData } from '../data/resources';
import ResourceCard from './ResourceCard';

const ResourcesSection: React.FC = () => {
  return (
    <section className="bg-slate-50 dark:bg-gray-900 font-sans py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header (Unchanged) */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            World-class guides, data, and benchmarks for modern marketers
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-gray-400">
            Learn from best-in-class playbooks and bring EAsyPost into a scalable marketing workflow.
          </p>
        </div>

        {/* --- RESPONSIVE CONTENT AREA --- */}

        {/* Static Grid for Mobile & Tablet (visible below lg breakpoint) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:hidden">
          {resourcesData.map((resource, index) => (
            <ResourceCard key={index} resource={resource} />
          ))}
        </div>

        {/* Auto-Scrolling Carousel for Desktop (visible at lg breakpoint and up) */}
        <div className="hidden lg:block group"
            // The 'group' class on the parent allows us to pause the animation on hover
        >
          <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]">
            
            {/* The scrolling content. We render it twice for a seamless loop. */}
            <ul className="flex items-stretch animate-slow-scroll group-hover:[animation-play-state:paused]">
              {resourcesData.map((resource, index) => (
                // Each item needs a fixed width and should not shrink
                <li key={index} className="flex-shrink-0 w-96 px-4">
                  <ResourceCard resource={resource} />
                </li>
              ))}
            </ul>
            
            {/* The duplicated list for the seamless loop effect */}
            <ul className="flex items-stretch animate-slow-scroll group-hover:[animation-play-state:paused]" aria-hidden="true">
              {resourcesData.map((resource, index) => (
                <li key={index} className="flex-shrink-0 w-96 px-4">
                  <ResourceCard resource={resource} />
                </li>
              ))}
            </ul>

          </div>
        </div>
 
      </div>
    </section>
  );
};

export default ResourcesSection;