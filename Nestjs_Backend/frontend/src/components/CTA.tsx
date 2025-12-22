import React from 'react';

const CTA: React.FC = () => {
  return (
    <section style={{
      padding: '6rem 0',
      background: 'var(--primary-purple)',
      color: 'var(--white)',
      textAlign: 'center'
    }}>
      <div className="container">
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Ready to get started?
        </h2>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
          No credit card required. Cancel anytime.
        </p>
        <a href="#signup" className="btn btn-primary" style={{ fontSize: '1.1rem' }}>
          Start your free trial
        </a>
      </div>
    </section>
  );
};

export default CTA;