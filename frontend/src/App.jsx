import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Dashboard from './pages/Dashboard';
import LiveRecognition from './pages/LiveRecognition';
import RegisterFace from './pages/RegisterFace';
import RegisteredUsers from './pages/RegisteredUsers';
import RecognitionHistory from './pages/RecognitionHistory';
import Settings from './pages/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabTitles = {
    dashboard: 'Dashboard',
    live: 'Live Face Recognition',
    register: 'Register New Face',
    users: 'Registered Users Directory',
    history: 'Recognition History Logs',
    settings: 'System Configuration',
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'live':
        return <LiveRecognition />;
      case 'register':
        return <RegisterFace setActiveTab={setActiveTab} />;
      case 'users':
        return <RegisteredUsers />;
      case 'history':
        return <RecognitionHistory />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden select-none">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar activeTitle={tabTitles[activeTab] || 'FaceVision AI'} />

        <main className="flex-1 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}
