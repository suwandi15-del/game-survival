import React, { useState, useEffect } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { AdventureMap } from './components/AdventureMap';
import { LearningStage } from './components/LearningStage';
import { GameCanvas } from './components/games/GameCanvas';
import { VictoryScreen } from './components/VictoryScreen';
import { GAME_POSTS } from './data/gameData';
import { GameProgress, PostId } from './types';
import { soundManager } from './sound';

const STORAGE_KEY = 'power_survival_smk_save_v1';

const defaultProgress: GameProgress = {
  unlockedPosts: 1,
  completedQuestions: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  scores: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  coins: 0,
  totalScore: 0,
  totalAttempts: 0,
  wrongAttempts: 0,
  startTime: Date.now(),
  completedTime: null,
};

type AppScreen = 'TITLE' | 'MAP' | 'LEARNING' | 'GAME' | 'VICTORY';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('TITLE');
  const [selectedPostId, setSelectedPostId] = useState<PostId>(1);
  const [isMuted, setIsMuted] = useState(soundManager.isMuted());

  // Load progress from localStorage
  const [progress, setProgress] = useState<GameProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultProgress,
          ...parsed,
          completedQuestions: { ...defaultProgress.completedQuestions, ...(parsed.completedQuestions || {}) },
          scores: { ...defaultProgress.scores, ...(parsed.scores || {}) },
        };
      }
    } catch {
      // ignore
    }
    return defaultProgress;
  });

  // Save progress on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  const toggleMute = () => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
  };

  const handleStartFromTitle = () => {
    setScreen('MAP');
  };

  const handleSelectPost = (postId: PostId) => {
    // STRICT RULE: Pos N can only be selected if Pos (N-1) is 5/5!
    const isUnlocked = postId === 1 || (progress.completedQuestions[(postId - 1) as PostId] || 0) >= 5;
    if (!isUnlocked) {
      soundManager.playWrong();
      return;
    }
    setSelectedPostId(postId);
    setScreen('LEARNING');
  };

  const handleProceedToGame = () => {
    setScreen('GAME');
  };

  const handleQuestionAnsweredCorrectly = (points: number, coins: number) => {
    setProgress((prev) => {
      const curDone = prev.completedQuestions[selectedPostId] || 0;
      const nextDone = Math.min(5, curDone + 1);

      return {
        ...prev,
        coins: prev.coins + coins,
        totalScore: prev.totalScore + points,
        totalAttempts: prev.totalAttempts + 1,
        completedQuestions: {
          ...prev.completedQuestions,
          [selectedPostId]: nextDone,
        },
        scores: {
          ...prev.scores,
          [selectedPostId]: (prev.scores[selectedPostId] || 0) + points,
        },
      };
    });
  };

  const handlePostCompleted = () => {
    setProgress((prev) => {
      const curDone = prev.completedQuestions[selectedPostId] || 0;
      const nextUnlocked = curDone >= 5
        ? Math.max(prev.unlockedPosts, (selectedPostId < 6 ? selectedPostId + 1 : 6))
        : prev.unlockedPosts;
      const allDone = selectedPostId === 6 && curDone >= 5;

      return {
        ...prev,
        unlockedPosts: nextUnlocked,
        completedTime: allDone ? Date.now() : prev.completedTime,
      };
    });

    if (selectedPostId === 6) {
      setScreen('VICTORY');
    } else {
      setScreen('MAP');
    }
  };

  const handleResetProgress = () => {
    const fresh: GameProgress = {
      ...defaultProgress,
      startTime: Date.now(),
    };
    setProgress(fresh);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setScreen('MAP');
  };

  const activePost = GAME_POSTS.find((p) => p.id === selectedPostId) || GAME_POSTS[0];

  return (
    <div className="w-full min-h-screen">
      {screen === 'TITLE' && (
        <TitleScreen
          onStart={handleStartFromTitle}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      )}

      {screen === 'MAP' && (
        <AdventureMap
          progress={progress}
          onSelectPost={handleSelectPost}
          onOpenTutorial={() => setScreen('TITLE')}
          onResetProgress={handleResetProgress}
          onOpenVictory={() => setScreen('VICTORY')}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      )}

      {screen === 'LEARNING' && (
        <LearningStage
          post={activePost}
          onBackToMap={() => setScreen('MAP')}
          onProceedToGame={handleProceedToGame}
        />
      )}

      {screen === 'GAME' && (
        <GameCanvas
          post={activePost}
          initialQuestionIndex={progress.completedQuestions[selectedPostId] || 0}
          onQuestionAnsweredCorrectly={handleQuestionAnsweredCorrectly}
          onPostCompleted={handlePostCompleted}
          onExitToMap={() => setScreen('MAP')}
          currentScore={progress.totalScore}
          currentCoins={progress.coins}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      )}

      {screen === 'VICTORY' && (
        <VictoryScreen
          progress={progress}
          onPlayAgain={() => {
            setSelectedPostId(1);
            setScreen('LEARNING');
          }}
          onViewMap={() => setScreen('MAP')}
          onResetGame={handleResetProgress}
        />
      )}
    </div>
  );
}
