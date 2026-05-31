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
    <section className="glass-panel rounded-2xl border border-outline-variant/20 shadow-2xl overflow-hidden mt-8 max-w-full">
      {/* Top Bar / Header */}
      <div className="flex flex-row items-center justify-between px-4 py-2.5 border-b border-outline-variant/20 bg-surface-container-low/30 backdrop-blur-md">
        
        {/* Left Side: Window Controls + OS Tabs */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth">
          {/* OS Control Dots (Terminal Style) */}
          <div className="flex items-center gap-1.5 shrink-0 pr-1.5 border-r border-outline-variant/20 mr-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80 hover:bg-[#ff5f56] transition-colors cursor-pointer"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80 hover:bg-[#ffbd2e] transition-colors cursor-pointer"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80 hover:bg-[#27c93f] transition-colors cursor-pointer"></div>
          </div>
          
          {/* Dynamic OS Filter Tabs */}
          <div className="flex items-center gap-1.5">
            {commands.map((cmd, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`px-3 py-1 rounded-md text-[12px] font-bold transition-all duration-300 relative cursor-pointer select-none whitespace-nowrap ${
                    isActive 
                      ? 'bg-primary-container/20 text-primary border border-primary/20 shadow-[0_0_12px_rgba(195,192,255,0.15)]' 
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40 border border-transparent'
                  }`}
                >
                  {cmd.os}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Small Copy Button */}
        <div className="flex items-center shrink-0 pl-2">
          {/* Small Copy Button */}
          <button 
            onClick={copyToClipboard}
            className={`flex items-center justify-center p-1.5 rounded-md transition-all duration-300 relative group/btn cursor-pointer ${
              copied 
                ? 'bg-primary-container/20 text-primary shadow-[0_0_12px_rgba(195,192,255,0.15)]' 
                : 'bg-transparent text-on-surface-variant/80 hover:text-on-surface hover:bg-surface-container-highest/50'
            }`}
            title="Copy command"
          >
            <span className="material-symbols-outlined text-[15px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            
            {/* Tooltip */}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-on-surface text-[10px] font-sans font-bold px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-xl border border-outline-variant/30 z-20">
              {copied ? 'Copied!' : 'Copy Command'}
            </span>
          </button>
        </div>

      </div>

      {/* Terminal Body */}
      <div className="p-6 font-mono text-[13px] md:text-[14px] relative min-h-[100px] bg-surface-container-lowest/40 backdrop-blur-sm flex flex-col justify-center">
        {/* Ambient background glow inside the terminal body */}
        <div className="absolute top-0 right-0 w-[150px] h-[100px] bg-primary/5 blur-[50px] rounded-full pointer-events-none"></div>

        {/* Comment line */}
        <div className="text-on-surface-variant/50 mb-3 select-none flex items-center gap-1.5 text-xs font-sans italic">
          <span className="text-primary/40">#</span> Run this command in your terminal to install {toolName}
        </div>
        
        {/* Terminal Line with Command */}
        <div className="text-on-surface whitespace-pre-wrap leading-relaxed pr-4 select-all font-mono font-normal">
          <span className="text-primary font-bold mr-2 select-none">$</span>
          {activeCommand.command}
        </div>
      </div>
    </section>
  );
};

