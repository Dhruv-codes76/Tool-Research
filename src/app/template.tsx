"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  // Ensure the page always starts at the top when navigating
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
