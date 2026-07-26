import React from 'react';

export const Footer: React.FC = () => {
  const logoUrl =
    'https://lh3.googleusercontent.com/aida/AP1WRLsHr6JcZPgbzSlUhEaO44gdrIXq2Qdkl2Y73tCpcjtuuKNFYrRSRmzqlQipzf-tnLuYVOx4NGaZsCD8sRGh6jbPKOh3miHNQRMKiybtQQRiwZL4vMrBTco-9j9pWTPVBHAj_3ckWl6qxKNEP2C9Ev4aMSyV7lsLBiJ5WvaT6btJW8xC77PhJOE1K-hRFrXm73bA1YLcwMaEvyOBkU5QdyIAr8rhALKMbSi-Ruhcwp4nUFNvgfZiAZxqNw';

  return (
    <footer className="bg-[var(--color-surface-container-low)] border-t border-[var(--color-outline-variant)] w-full px-4 sm:px-6 py-8 sm:py-12 mt-auto">
      <div className="max-w-[1120px] mx-auto flex flex-col gap-6 text-[var(--color-primary)]">
        <img
          src={logoUrl}
          alt="Tezzo Logo"
          className="h-6 w-auto object-contain self-start grayscale opacity-70"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-2">
          <a
            href="#about"
            className="text-xs sm:text-sm font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors"
          >
            About us
          </a>
          <a
            href="#trust"
            className="text-xs sm:text-sm font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors"
          >
            Trust & Safety
          </a>
          <a
            href="#help"
            className="text-xs sm:text-sm font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors"
          >
            Help Centre
          </a>
          <a
            href="#terms"
            className="text-xs sm:text-sm font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors"
          >
            Terms & Conditions
          </a>
        </div>

        <p className="text-xs font-medium text-[var(--color-outline)] mt-4 border-t border-[var(--color-surface-container)] pt-4">
          © 2024 Tezzo Carpool. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
