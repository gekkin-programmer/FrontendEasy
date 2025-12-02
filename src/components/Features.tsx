import React from 'react';

const features = [
  {
    title: 'Publishing',
    description: 'Schedule posts across Instagram, Facebook, Twitter, LinkedIn, and Pinterest.',
    icon: '📅' // Replace with SVG/icon
  },
  {
    title: 'Analytics',
    description: 'Track performance and get insights to optimize your content strategy.',
    icon: '📊'
  },
  {
    title: 'Engagement',
    description: 'Reply to comments and messages from one inbox.',
    icon: '💬'
  }
];

const Features: React.FC = () => {
  return (
    <section style={{ padding: '6rem 0', backgroundColor: 'var(--bg-light)' }}>
      <div className="container">
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Everything you need to grow
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '4rem' }}>
          Simple tools for powerful results
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {features.map((feature, index) => (
            <div key={index} style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'var(--white)',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-light)' }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;