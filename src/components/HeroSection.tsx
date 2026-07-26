import React from 'react';

export const HeroSection: React.FC = () => {
  const heroImgUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ8BSgdkN9DElaEyO5mmssowVXkk9UT85cbiVQ6GVIkIKVjL0zY31o9NqbBkx22NxLhtYqsy2BCiQbrSOyBa325M4crWlhl0Rc9tX8jFQRsJRi8fNW5eGNkFkqycjFJIot8lI7tKna0dk36BZ7RDVSh6Zk8j_bvWQBhmsl4EoMn5IrczhZEPx_vitmjsF6467LctG70xNZyRRTkSz4kQ9ux2NXzjYhM8skFb6wUt_0WPj_1v74DCiA5u3h5-CTDPChyLALwSVQvAo';

  return (
    <section className="px-4 sm:px-6 pt-4 pb-2 max-w-[1120px] mx-auto">
      <div className="relative w-full h-[480px] rounded-2xl overflow-hidden shadow-md group">
        <img
          src={heroImgUrl}
          alt="Two friends smiling and laughing in the back seat of a car during a sunny road trip"
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>

        {/* Story Text Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 flex flex-col gap-3">
          <div className="text-[#ffdea2] text-5xl font-serif leading-none opacity-80 h-8">"</div>
          <h1 className="text-[28px] sm:text-[36px] md:text-[42px] font-extrabold text-white leading-tight tracking-tight">
            Share the journey, not just the ride.
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl font-normal leading-relaxed">
            "I found my weekend hiking crew just by sharing my commute. Tezzo changed how I travel."
          </p>
          <p className="text-xs sm:text-sm font-semibold text-white/75 mt-1 tracking-wide">
            — Priya, Tezzo member
          </p>
        </div>
      </div>
    </section>
  );
};
