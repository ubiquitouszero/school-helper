import { useState, useEffect, useCallback, useRef } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';
type Operation = '+' | '-' | '×';

export interface Problem {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
  choices: number[];
}

export interface AnsweredProblem extends Problem {
  userAnswer: number;
  isCorrect: boolean;
}

interface MathDrillProps {
  player: string;
  difficulty: Difficulty;
  onComplete: (score: number, total: number, problems: AnsweredProblem[]) => void;
  onBack: () => void;
}

function generateProblem(difficulty: Difficulty): Problem {
  let max: number;
  let operations: Operation[];

  switch (difficulty) {
    case 'easy':
      max = 10;
      operations = ['+'];
      break;
    case 'medium':
      max = 20;
      operations = ['+', '-'];
      break;
    case 'hard':
      max = 50;
      operations = ['+', '-', '×'];
      break;
  }

  const operation = operations[Math.floor(Math.random() * operations.length)];
  let num1: number, num2: number, answer: number;

  if (operation === '×') {
    num1 = Math.floor(Math.random() * 10) + 1;
    num2 = Math.floor(Math.random() * 10) + 1;
    answer = num1 * num2;
  } else if (operation === '-') {
    num1 = Math.floor(Math.random() * max) + 1;
    num2 = Math.floor(Math.random() * num1) + 1;
    answer = num1 - num2;
  } else {
    num1 = Math.floor(Math.random() * max) + 1;
    num2 = Math.floor(Math.random() * max) + 1;
    answer = num1 + num2;
  }

  // Generate wrong choices
  const choices = new Set<number>([answer]);
  while (choices.size < 4) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const wrong = answer + offset;
    if (wrong >= 0 && wrong !== answer) {
      choices.add(wrong);
    }
  }

  // Shuffle choices
  const shuffled = Array.from(choices).sort(() => Math.random() - 0.5);

  return { num1, num2, operation, answer, choices: shuffled };
}

export default function MathDrill({ player, difficulty, onComplete, onBack }: MathDrillProps) {
  const [problem, setProblem] = useState<Problem>(() => generateProblem(difficulty));
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const answeredProblems = useRef<AnsweredProblem[]>([]);

  const PROBLEMS_PER_ROUND = 10;

  const nextProblem = useCallback(() => {
    if (total >= PROBLEMS_PER_ROUND) {
      onComplete(score, total, answeredProblems.current);
      return;
    }
    setProblem(generateProblem(difficulty));
    setFeedback(null);
  }, [total, score, difficulty, onComplete]);

  useEffect(() => {
    if (feedback !== null) {
      const timer = setTimeout(nextProblem, feedback === 'correct' ? 800 : 1500);
      return () => clearTimeout(timer);
    }
  }, [feedback, nextProblem]);

  const handleAnswer = (choice: number) => {
    if (feedback !== null) return;

    const isCorrect = choice === problem.answer;

    // Track this problem
    answeredProblems.current.push({
      ...problem,
      userAnswer: choice,
      isCorrect,
    });

    setTotal((t) => t + 1);

    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      setFeedback('correct');
      // Play sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19teleXBmb3JtYXQgY2h1bmsgbWlzc2luZw==');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch {}
    } else {
      setStreak(0);
      setFeedback('wrong');
    }
  };

  const progress = (total / PROBLEMS_PER_ROUND) * 100;

  return (
    <div className="text-center">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="px-4 py-2 text-rainbow-purple font-bold hover:underline"
        >
          ← Back
        </button>
        <div className="text-lg font-fun">
          <span className="text-rainbow-purple">{player}</span>
          {streak >= 3 && <span className="ml-2 text-rainbow-orange">🔥 {streak}</span>}
        </div>
        <div className="text-xl font-bold text-rainbow-blue">
          {score} / {total}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
        <div
          className="bg-rainbow-blue h-4 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Problem */}
      <div
        className={`
          p-8 rounded-kid-lg mb-8 transition-all duration-200
          ${feedback === 'correct' ? 'bg-green-100' : ''}
          ${feedback === 'wrong' ? 'bg-red-100' : ''}
          ${feedback === null ? 'bg-white' : ''}
          shadow-lg
        `}
      >
        <div className="text-6xl font-bold font-fun text-kid-text mb-4">
          {problem.num1} {problem.operation} {problem.num2} = ?
        </div>

        {feedback === 'correct' && (
          <div className="text-4xl text-green-600 font-bold animate-bounce">
            ✓ Correct!
          </div>
        )}

        {feedback === 'wrong' && (
          <div className="text-2xl text-red-600 font-bold">
            The answer was {problem.answer}
          </div>
        )}
      </div>

      {/* Answer choices */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {problem.choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(choice)}
            disabled={feedback !== null}
            className={`
              min-h-tap-lg text-3xl font-bold font-fun
              rounded-kid-lg
              transition-all duration-200
              shadow-lg
              ${feedback !== null
                ? choice === problem.answer
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-400'
                : 'bg-rainbow-yellow text-kid-text hover:scale-105 hover:bg-rainbow-orange hover:text-white active:scale-95'
              }
            `}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}
