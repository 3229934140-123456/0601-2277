import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainMenu from '@/pages/MainMenu';
import LevelSelect from '@/pages/LevelSelect';
import GameScreen from '@/pages/GameScreen';
import ResultScreen from '@/pages/ResultScreen';
import Collection from '@/pages/Collection';
import Settings from '@/pages/Settings';
import { useGameStore } from '@/store/useGameStore';

export default function App() {
  const loadSave = useGameStore(s => s.loadSave);

  useEffect(() => {
    loadSave();
  }, [loadSave]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/levels" element={<LevelSelect />} />
        <Route path="/game/:levelId" element={<GameScreen />} />
        <Route path="/result/:levelId" element={<ResultScreen />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<MainMenu />} />
      </Routes>
    </Router>
  );
}
