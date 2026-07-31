"use client";

import { useState } from "react";
import { ToolTypeModal } from "./ToolTypeModal";

/** "Add Tool" CTA on the Manage Tools page. Opens the ToolTypeModal to select
 *  between Open Source and Proprietary forms. */
export function AddToolButton() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="bg-primary-container text-on-primary-container hover:bg-primary transition-colors flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-label-sm text-sm"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        Add Tool
      </button>

      <ToolTypeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
