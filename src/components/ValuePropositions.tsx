import React from 'react';
import { UserPlus, Leaf, ShieldCheck } from 'lucide-react';

export const ValuePropositions: React.FC = () => {
  const values = [
    {
      icon: <UserPlus className="w-6 h-6" />,
      title: 'Build connections',
      description:
        'Turn strangers into friends. Share your commute with people heading your way and build a community on the road.',
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      title: 'Travel together, greener',
      description:
        'Fewer empty seats mean fewer emissions. Join a community committed to making travel more sustainable and affordable.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: 'A trusted community',
      description:
        "Every member is verified. Read reviews, check profiles, and travel with peace of mind knowing you're in good hands.",
    },
  ];

  return (
    <section id="how-it-works" className="px-4 sm:px-6 py-8 sm:py-12 bg-[var(--color-background)]">
      <div className="max-w-[1120px] mx-auto flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <div
              key={i}
              className="bg-white p-6 sm:p-7 rounded-2xl shadow-xs border border-[var(--color-border)] flex flex-col gap-4 hover:shadow-md transition-all duration-300 group"
            >
              <div className="h-12 w-12 rounded-full bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] flex items-center justify-center transition-transform group-hover:scale-110">
                {v.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--color-on-surface)] mb-2">{v.title}</h3>
                <p className="text-sm sm:text-base text-[var(--color-on-surface-variant)] leading-relaxed">
                  {v.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
