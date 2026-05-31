'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { createPlatform, deletePlatform, createToolType, deleteToolType, updatePlatform, updateToolType } from '@/app/actions/adminActions';
import { useRouter } from 'next/navigation';

type CategoryItem = {
  id: string;
  name: string;
  description: string | null;
  type: 'PLATFORM' | 'TOOL_TYPE';
  toolCount: number;
};

interface CategoriesClientProps {
  initialPlatforms: any[];
  initialToolTypes: any[];
}

export default function CategoriesClient({ initialPlatforms, initialToolTypes }: CategoriesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Unified items
  const allItems: CategoryItem[] = [
    ...initialPlatforms.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      type: 'PLATFORM' as const,
      toolCount: p._count?.tools || 0,
    })),
    ...initialToolTypes.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      type: 'TOOL_TYPE' as const,
      toolCount: t._count?.tools || 0,
    }))
  ].sort((a, b) => a.name.localeCompare(b.name));

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PLATFORM' | 'TOOL_TYPE'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);
  
  // Modal Form State
  const [formData, setFormData] = useState({
    type: 'TOOL_TYPE' as 'PLATFORM' | 'TOOL_TYPE',
    name: '',
    description: ''
  });

  // 3-Dot Menu State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      // Search text filter
      const matchesSearch = !search.trim() || 
        item.name.toLowerCase().includes(search.toLowerCase()) || 
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
      
      // Type filter
      const matchesType = filterType === 'ALL' || item.type === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [allItems, search, filterType]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ type: 'TOOL_TYPE', name: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item: CategoryItem) => {
    setOpenMenuId(null);
    setEditingItem(item);
    setFormData({ type: item.type, name: item.name, description: item.description || '' });
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    startTransition(async () => {
      try {
        if (editingItem) {
          // Edit mode
          if (editingItem.type === 'PLATFORM') {
            await updatePlatform(editingItem.id, formData.name.trim(), formData.description.trim() || undefined);
          } else {
            await updateToolType(editingItem.id, formData.name.trim(), formData.description.trim() || undefined);
          }
        } else {
          // Create mode
          if (formData.type === 'PLATFORM') {
            await createPlatform(formData.name.trim(), formData.description.trim() || undefined);
          } else {
            await createToolType(formData.name.trim(), formData.description.trim() || undefined);
          }
        }
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ type: 'TOOL_TYPE', name: '', description: '' });
        router.refresh();
      } catch (error) {
        console.error("Failed to save category", error);
        alert("Error saving category. The name might already exist.");
      }
    });
  };

  const handleDelete = async (item: CategoryItem) => {
    setOpenMenuId(null);
    if (item.toolCount > 0) {
      alert("Cannot delete this category because it is already associated with existing tools.");
      return;
    }
    
    if (!confirm(`Are you sure you want to delete the ${item.type === 'PLATFORM' ? 'OS Platform' : 'Tool Category'} "${item.name}"?`)) {
      return;
    }

    startTransition(async () => {
      try {
        if (item.type === 'PLATFORM') {
          await deletePlatform(item.id);
        } else {
          await deleteToolType(item.id);
        }
        router.refresh();
      } catch (error: any) {
        console.error("Failed to delete", error);
        alert(error.message || "Error deleting category.");
      }
    });
  };

  return (
    <div>
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xl">
          <div className="w-full relative flex-grow">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">
              search
            </span>
            <input 
              type="text" 
              placeholder="Search categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant/30 rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors shadow-sm"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2.5 shrink-0 bg-surface border border-outline-variant/30 rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors shadow-sm appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23707070%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto', paddingRight: '2.5rem' }}
          >
            <option value="ALL">All Types</option>
            <option value="PLATFORM">OS Platforms</option>
            <option value="TOOL_TYPE">Tool Categories</option>
          </select>
        </div>
        <button 
          onClick={openAddModal}
          className="shrink-0 flex items-center gap-2 bg-[#2d0096] text-white hover:bg-[#3600b3] px-5 py-2.5 rounded-lg text-sm font-label-sm font-bold transition-colors shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Category
        </button>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-surface rounded-xl p-5 border border-outline-variant/20 shadow-sm flex flex-col justify-between relative hover:border-outline-variant/40 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-[#f0f0ff] text-[#2d0096] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">
                      {item.type === 'PLATFORM' ? 'terminal' : 'sell'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-base text-on-surface leading-tight mb-0.5">{item.name}</h3>
                    <p className="text-[11px] text-on-surface-variant font-medium">
                      {item.type === 'PLATFORM' ? 'OS Based / Platform' : 'Tool Category'}
                    </p>
                  </div>
                </div>
                
                {/* 3-Dot Menu */}
                <div className="relative">
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                  
                  {openMenuId === item.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                      <div className="absolute right-0 top-full mt-1 w-40 bg-surface rounded-lg shadow-xl border border-outline-variant/20 py-1 z-50 overflow-hidden">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container flex items-center gap-2 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px] text-[#2d0096]">edit</span>
                          Edit Category
                        </button>
                        <button 
                          onClick={() => handleDelete(item)}
                          disabled={item.toolCount > 0 || isPending}
                          className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container/10 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                          title={item.toolCount > 0 ? `Cannot delete: ${item.toolCount} tool(s) use this category` : 'Delete category'}
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 mb-4">
                <span className="inline-flex items-center text-[10px] font-bold text-[#2d0096] bg-[#f0f0ff] px-2 py-0.5 rounded-md tracking-wide">
                  {item.toolCount} {item.toolCount === 1 ? 'TOOL' : 'TOOLS'}
                </span>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant line-clamp-2">
              {item.description || <span className="italic opacity-60">No description provided</span>}
            </p>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-12 text-on-surface-variant">
            No categories found matching "{search}".
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => !isPending && setIsModalOpen(false)}></div>
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden border border-outline-variant/20">
            <div className="p-6">
              <h2 className="text-xl font-headline-md text-on-surface mb-6">{editingItem ? 'Edit Category' : 'New Category'}</h2>
              
              <form onSubmit={handleSaveCategory} className="space-y-5">
                {/* Type toggle — hidden when editing since type can't change */}
                {!editingItem && (
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5">Type</label>
                    <div className="flex bg-surface-container rounded-lg p-1">
                      <button
                        type="button"
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.type === 'TOOL_TYPE' ? 'bg-surface shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
                        onClick={() => setFormData({...formData, type: 'TOOL_TYPE'})}
                      >
                        Tool Category
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.type === 'PLATFORM' ? 'bg-surface shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
                        onClick={() => setFormData({...formData, type: 'PLATFORM'})}
                      >
                        OS Based
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    placeholder={formData.type === 'PLATFORM' ? "e.g. Linux, Windows" : "e.g. Design, Development"}
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant/30 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Description</label>
                  <textarea
                    placeholder="Optional description..."
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant/30 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || !formData.name.trim()}
                    className="bg-[#2d0096] text-white hover:bg-[#3600b3] px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isPending ? 'Saving...' : editingItem ? 'Update Category' : 'Save Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
