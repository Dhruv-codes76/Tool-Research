'use client';

import React, { useState } from 'react';

interface InstallCommand {
  os: string;
  command: string;
}

interface InstallSectionProps {
  toolName: string;
  installCommand: string; // Could be a JSON string or a regular string
}

export const InstallSection: React.FC<InstallSectionProps> = ({ toolName, installCommand }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  let commands: InstallCommand[] = [];
  try {
    commands = JSON.parse(installCommand);
    if (!Array.isArray(commands)) {
      commands = [{ os: 'Universal', command: installCommand }];
    }
  } catch (e) {
    commands = [{ os: 'Universal', command: installCommand }];
  }

  // Filter out any commands that are entirely empty or just whitespace
  commands = commands.filter(cmd => cmd.command && cmd.command.trim() !== '');

  if (commands.length === 0) return null;

  const activeCommand = commands[activeTab] || commands[0];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeCommand.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="rounded-xl bg-[#141621] border border-white/5 shadow-2xl overflow-hidden mt-8 max-w-full">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0f111a] gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          {/* Static decoration tabs to match the screenshot vibe */}
          <div className="hidden sm:flex items-center gap-3 ml-2">
             <span className="bg-[#00f0ff] text-black text-[12px] font-bold px-3 py-1 rounded">One-liner</span>
             <span className="text-gray-500 text-[12px] font-semibold px-2 py-1 cursor-not-allowed">npm</span>
             <span className="text-gray-500 text-[12px] font-semibold px-2 py-1 cursor-not-allowed">Hackable</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* OS Toggles */}
          {commands.length > 1 ? (
            <div className="flex items-center gap-1 bg-[#141621] p-1 rounded-lg border border-white/5">
              {commands.map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`px-4 py-1.5 rounded text-[12px] font-bold transition-all ${
                    activeTab === idx 
                      ? 'bg-[#ff2a5f] text-white shadow-md' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  {cmd.os}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-1.5 rounded text-[12px] font-bold bg-[#ff2a5f] text-white shadow-md">
              {commands[0].os}
            </div>
          )}
          
          {/* Beta Badge */}
          <span className="border border-white/10 text-gray-400 text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1">
            <span className="font-serif">β</span> BETA
          </span>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-6 font-mono text-[13px] md:text-[14px] relative group min-h-[120px] flex flex-col justify-center">
        <div className="text-gray-400 mb-3 select-none">
          # Works everywhere. Installs everything. You're welcome. 🚀
        </div>
        <div className="text-gray-200 whitespace-pre-wrap leading-relaxed pr-12">
          <span className="text-[#ff2a5f] select-none">$</span> {activeCommand.command}
        </div>
        
        <button 
          onClick={copyToClipboard}
          className="absolute top-1/2 -translate-y-1/2 right-6 text-gray-400 hover:text-white bg-[#1f2233] border border-white/10 p-2.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
          title="Copy install command"
        >
          <span className="material-symbols-outlined text-[18px]">
            {copied ? 'check' : 'content_copy'}
          </span>
        </button>
      </div>
    </section>
  );
};
