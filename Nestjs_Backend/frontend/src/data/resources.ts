// This object maps a category to specific Tailwind CSS classes for its tag.
// This makes it easy to add new categories with different colors.
export const categoryStyles: { [key: string]: string } = {
  'Social Media Marketing': 'bg-purple-100 text-purple-800',
  'Marketing Resources': 'bg-sky-100 text-sky-800',
  'Best Time To Post': 'bg-emerald-100 text-emerald-800',
  // Add more categories and their styles here
};

export interface Resource {
  category: keyof typeof categoryStyles;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

export const resourcesData: Resource[] = [
  {
    category: 'Social Media Marketing',
    title: 'The 2024 State of Social Media: A Buffer Report',
    description: 'We surveyed 1,900+ marketers to find out what’s working, what’s not, and what’s next in social media.',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=60',
    link: '#',
  },
  {
    category: 'Marketing Resources',
    title: 'The Complete Guide to Social Media for Small Business',
    description: 'Your A-Z guide to getting started with social media for your small business. No-fluff, all action.',
    imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop&q=60',
    link: '#',
  },
  {
    category: 'Best Time To Post',
    title: 'We Analyzed 10 Million Posts to Find The Best Time To Post on Social',
    description: 'Our data science team analyzed more than 10 million posts to find out the best times to post on social media.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60',
    link: '#',
  },
];