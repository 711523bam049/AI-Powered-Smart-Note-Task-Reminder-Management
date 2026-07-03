import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout({ children, activeTab, setActiveTab }) {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex transition-all duration-300">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
