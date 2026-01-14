import { useState } from 'react';
import PlayerSelect from './PlayerSelect';
import DifficultySelect from './DifficultySelect';
import MathDrill, { type AnsweredProblem } from './MathDrill';
import Results from './Results';

type Screen = 'player' | 'difficulty' | 'drill' | 'results';
type Difficulty = 'easy' | 'medium' | 'hard';

export default function MathApp() {
  const [screen, setScreen] = useState<Screen>('player');
  const [player, setPlayer] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [results, setResults] = useState<{ score: number; total: number; problems: AnsweredProblem[] }>({
    score: 0,
    total: 0,
    problems: [],
  });

  const handlePlayerSelect = (name: string) => {
    setPlayer(name);
    setScreen('difficulty');
  };

  const handleDifficultySelect = (diff: Difficulty) => {
    setDifficulty(diff);
    setScreen('drill');
  };

  const handleComplete = (score: number, total: number, problems: AnsweredProblem[]) => {
    setResults({ score, total, problems });
    setScreen('results');
  };

  const handlePlayAgain = () => {
    setScreen('difficulty');
  };

  const handleHome = () => {
    setScreen('player');
    setPlayer('');
  };

  return (
    <div className="min-h-screen bg-kid-bg p-4">
      <div className="max-w-2xl mx-auto py-8">
        {screen === 'player' && (
          <PlayerSelect onSelect={handlePlayerSelect} />
        )}

        {screen === 'difficulty' && (
          <DifficultySelect
            player={player}
            onSelect={handleDifficultySelect}
            onBack={() => setScreen('player')}
          />
        )}

        {screen === 'drill' && (
          <MathDrill
            player={player}
            difficulty={difficulty}
            onComplete={handleComplete}
            onBack={() => setScreen('difficulty')}
          />
        )}

        {screen === 'results' && (
          <Results
            player={player}
            score={results.score}
            total={results.total}
            difficulty={difficulty}
            problems={results.problems}
            onPlayAgain={handlePlayAgain}
            onHome={handleHome}
          />
        )}
      </div>
    </div>
  );
}
