import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { useQuiz } from '../context/QuizContext';
import { sampleDataList } from '@quizerjs/sample-data';
import './MainLayout.css';

export default function MainLayout() {
  const { selectedSampleId, setSelectedSampleId, isDark, toggleTheme } = useQuiz();

  return (
    <div className={`app-layout ${isDark ? 'dark' : ''}`}>
      <header className="app-header">
        <div className="header-brand">
          <h1 className="header-logo">QuizerJS Editor</h1>
          <nav className="header-nav">
            <NavLink
              to="/"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end
            >
              Editor
            </NavLink>
            <NavLink
              to="/player"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Player
            </NavLink>
          </nav>
        </div>

        <div className="header-actions">
          <div className="data-select-wrapper">
            <select
              className="data-select"
              value={selectedSampleId}
              onChange={e => setSelectedSampleId(e.target.value)}
            >
              {sampleDataList.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </div>
      </header>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
