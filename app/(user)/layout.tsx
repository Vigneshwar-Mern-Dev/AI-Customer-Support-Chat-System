"use client";

import { useState } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <div className={`
        fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <ChatSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden flex items-center px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 text-center font-semibold text-sm">SupportAI</div>
        </div>
        
        {children}
      </main>
    </div>
  );
}
