import React from 'react';
import CategoriesClient from './CategoriesClient';
import { getCategories } from '@/app/actions/adminActions';

export const metadata = {
  title: 'Admin - Manage Categories',
};

export default async function CategoriesPage() {
  const { platforms, toolTypes } = await getCategories();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display-lg text-3xl font-bold tracking-tight text-on-surface">Categories</h1>
        <p className="font-body-base text-on-surface-variant mt-2">
          Manage OS platforms and tool categories.
        </p>
      </div>
      
      <CategoriesClient initialPlatforms={platforms} initialToolTypes={toolTypes} />
    </div>
  );
}
