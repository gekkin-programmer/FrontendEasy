const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`;

export default function SectionBackground() {
  return (
    <>
      {/* Noise texture */}
      <div
        className="absolute inset-0 z-0 opacity-30 dark:opacity-[0.08] pointer-events-none mix-blend-multiply dark:mix-blend-screen"
        style={{ backgroundImage: NOISE_SVG }}
        aria-hidden="true"
      />

      {/* Grid — light mode (black lines) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.12] dark:hidden"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      {/* Grid — dark mode (white lines) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.10] hidden dark:block"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
        }}
        aria-hidden="true"
      />

    </>
  );
}
