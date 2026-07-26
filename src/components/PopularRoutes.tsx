import React from 'react';
import { ChevronRight } from 'lucide-react';

interface PopularRoutesProps {
  onSelectRoute: (destination: string) => void;
}

export const PopularRoutes: React.FC<PopularRoutesProps> = ({ onSelectRoute }) => {
  const routes = [
    { destination: 'Gurgaon', subtext: 'Today, Multiple rides' },
    { destination: 'Noida', subtext: 'Today, Multiple rides' },
    { destination: 'Rohtak', subtext: 'Tomorrow, 3 rides' },
    { destination: 'Jaipur', subtext: 'Tomorrow, 5 rides' },
    { destination: 'Chandigarh', subtext: 'Today, 4 rides' },
  ];

  return (
    <section className="px-4 sm:px-6 py-8 sm:py-12 bg-[var(--color-primary)] text-white">
      <div className="max-w-[1120px] mx-auto flex flex-col gap-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
          Top community trips from New Delhi
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((route, i) => (
            <button
              key={i}
              onClick={() => onSelectRoute(route.destination)}
              className="bg-white text-[var(--color-on-surface)] p-4 sm:p-5 rounded-xl flex items-center justify-between hover:shadow-lg transition-all transform hover:-translate-y-0.5 group text-left cursor-pointer"
            >
              <div className="flex flex-col gap-1">
                <span className="text-base sm:text-lg font-bold group-hover:text-[var(--color-primary)] transition-colors">
                  {route.destination}
                </span>
                <span className="text-xs sm:text-sm font-medium text-[var(--color-on-surface-variant)]">
                  {route.subtext}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-outline)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
