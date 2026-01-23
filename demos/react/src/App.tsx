import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QuizProvider } from './context/QuizContext';
import MainLayout from './layouts/MainLayout';
import EditorPage from './pages/EditorPage';
import PlayerPage from './pages/PlayerPage';
import './App.css';

export default function App() {
  return (
    <QuizProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<EditorPage />} />
            <Route path="editor" element={<Navigate to="/" replace />} />
            <Route path="player" element={<PlayerPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QuizProvider>
  );
}
