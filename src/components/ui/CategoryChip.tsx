'use client';

import React from 'react';

interface CategoryChipProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({ label, isActive = false, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`
        ${isActive 
          ? 'bg-primary-container text-on-primary-container hover:bg-primary-container/90' 
          : 'bg-surface-container-high text-on-surface border border-outline-variant/30 hover:border-outline-variant'
        } 
        font-label-sm text-label-sm px-6 py-3 rounded-full hover-lift
      `}
    >
      {label}
    </button>
  );
};
