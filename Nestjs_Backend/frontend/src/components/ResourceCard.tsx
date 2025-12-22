import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { Resource, categoryStyles } from '../data/resources';

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  // Get the specific style for this card's category from our data file
  const tagStyle = categoryStyles[resource.category] || 'bg-gray-100 text-gray-800';

  return (
    <a
      href={resource.link}
      target="_blank"
      rel="noopener noreferrer"
      // The 'group' class is key. It allows us to style child elements on hover of the parent.
      className="group flex flex-col bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
    >
      {/* Card Image */}
      <div className="relative">
        <img
          src={resource.imageUrl}
          alt={resource.title}
          className="w-full h-48 object-cover"
        />
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Category Tag */}
        <p
          className={`text-xs font-bold uppercase tracking-wider ${tagStyle} px-2 py-1 rounded-md self-start`}
        >
          {resource.category}
        </p>
        
        {/* Title */}
        <h3 className="mt-3 text-xl font-bold text-slate-900">
          {resource.title}
        </h3>
        
        {/* Description */}
        <p className="mt-2 text-base text-slate-600 flex-grow">
          {resource.description}
        </p>

        {/* Read More Link */}
        <div className="mt-4 flex items-center font-semibold text-blue-600">
          Read more
          <FaArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </a>
  );
};

export default ResourceCard;