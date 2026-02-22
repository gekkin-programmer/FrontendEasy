export interface Resource {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  date: string;
  readTime: string;
  link: string;
}

export const categoryStyles: Record<string, string> = {
  'Guide': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  'Case Study': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
  'Trend': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  'Update': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
};

export const resources: Resource[] = [
  {
    id: '1',
    category: 'Guide',
    title: 'The Ultimate Guide to Social Media Scheduling in 2026',
    description: 'Learn how to automate your workflow and save 10 hours a week with these proven strategies.',
    image: '/assets/3.jpg', // Ensure you have these images or use placeholders
    date: 'Jan 4, 2026',
    readTime: '5 min read',
    link: '#'
  },
  {
    id: '2',
    category: 'Trend',
    title: 'Why "Nouchi" Content is Taking Over West African TikTok',
    description: 'An analysis of how local slang is driving engagement rates through the roof for brands.',
    image: '/assets/PBD.jpg',
    date: 'Jan 2, 2026',
    readTime: '3 min read',
    link: '#'
  },
  {
    id: '3',
    category: 'Case Study',
    title: 'How TechFlow Increased Sales by 200% with Mobile Money Links',
    description: 'See exactly how they implemented EazyPost payment links to drive conversions directly from Facebook.',
    image: '/assets/Sarah.jpg',
    date: 'Dec 28, 2025',
    readTime: '7 min read',
    link: '#'
  }
];