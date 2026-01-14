import { useState, useEffect, useCallback } from 'react';
import { speak } from '../lib/speech';

type Screen = 'player' | 'mode' | 'game' | 'results';
type GameMode = 'recognize' | 'compare' | 'count';

const PLAYERS = ['Kaland', 'Valen', 'Mom', 'Dad', 'Guest'];

interface Problem {
  type: GameMode;
  question: string;
  answer: string;
  choices: string[];
  num1?: number;
  num2?: number;
}

function generateProblem(mode: GameMode): Problem {
  if (mode === 'recognize') {
    // Number recognition up to 50
    const num = Math.floor(Math.random() * 50) + 1;
    const choices = new Set<string>([num.toString()]);

    while (choices.size < 4) {
      const offset = Math.floor(Math.random() * 20) - 10;
      const wrong = num + offset;
      if (wrong > 0 && wrong <= 60) {
        choices.add(wrong.toString());
      }
    }

    return {
      type: 'recognize',
      question: num.toString(),
      answer: num.toString(),
      choices: Array.from(choices).sort(() => Math.random() - 0.5),
    };
  }

  if (mode === 'compare') {
    // Compare numbers (>, <, =) up to 10
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;

    let answer: string;
    if (num1 > num2) answer = '>';
    else if (num1 < num2) answer = '<';
    else answer = '=';

    return {
      type: 'compare',
      question: `${num1} ? ${num2}`,
      answer,
      choices: ['>', '<', '='],
      num1,
      num2,
    };
  }

  // Count mode - "What comes next?"
  const start = Math.floor(Math.random() * 45) + 1;
  const answer = (start + 1).toString();
  const choices = new Set<string>([answer]);

  while (choices.size < 4) {
    const wrong = start + Math.floor(Math.random() * 5) - 2;
    if (wrong > 0 && wrong !== start + 1) {
      choices.add(wrong.toString());
    }
  }

  return {
    type: 'count',
    question: start.toString(),
    answer,
    choices: Array.from(choices).sort(() => Math.random() - 0.5),
  };
}

const MODES: { id: GameMode; label: string; desc: string; emoji: string }[] = [
  { id: 'recognize', label: 'Say the Number', desc: 'Hear a number, tap it!', emoji: '🔢' },
  { id: 'compare', label: 'Compare Numbers', desc: 'Which is bigger?', emoji: '⚖️' },
  { id: 'count', label: 'What Comes Next?', desc: 'Count up by 1', emoji: '➡️' },
];

export default function NumbersApp() {
  const [screen, setScreen] = useState<Screen>('player');
  const [player, setPlayer] = useState('');
  const [mode, setMode] = useState<GameMode>('recognize');
  const [problem, setProblem] = useState<Problem>(() => generateProblem('recognize'));
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const PROBLEMS_PER_ROUND = 10;

  const speakNumber = useCallback((num: string) => {
    speak(num);
  }, []);

  const nextProblem = useCallback(() => {
    if (total >= PROBLEMS_PER_ROUND) {
      setScreen('results');
      return;
    }
    setProblem(generateProblem(mode));
    setFeedback(null);
  }, [total, mode]);

  useEffect(() => {
    if (feedback !== null) {
      const timer = setTimeout(nextProblem, feedback === 'correct' ? 800 : 1500);
      return () => clearTimeout(timer);
    }
  }, [feedback, nextProblem]);

  // Speak for recognize mode
  useEffect(() => {
    if (screen === 'game' && mode === 'recognize' && feedback === null) {
      const timer = setTimeout(() => speakNumber(problem.question), 500);
      return () => clearTimeout(timer);
    }
  }, [problem, screen, mode, feedback, speakNumber]);

  const handleAnswer = (choice: string) => {
    if (feedback !== null) return;

    setTotal(t => t + 1);

    if (choice === problem.answer) {
      setScore(s => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
  };

  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setProblem(generateProblem(selectedMode));
    setScore(0);
    setTotal(0);
    setFeedback(null);
    setScreen('game');
  };

  // Player select
  if (screen === 'player') {
    return (
      <div className="min-h-screen bg-kid-bg p-4">
        <div className="max-w-2xl mx-auto py-8 text-center">
          <h2 className="text-3xl font-fun font-bold text-rainbow-purple mb-6">
            Numbers! 🔢
          </h2>
          <p className="text-xl text-kid-text mb-8">Who's learning numbers today?</p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {PLAYERS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPlayer(p);
                  setScreen('mode');
                }}
                className="
                  min-w-[120px] min-h-tap-lg px-6 py-4
                  text-xl font-fun font-bold
                  bg-rainbow-purple text-white
                  rounded-kid-lg
                  transition-all duration-200
                  hover:scale-105 active:scale-95
                  shadow-lg hover:shadow-xl
                "
              >
                {p}
              </button>
            ))}
          </div>

          <a href="/" className="inline-block px-4 py-2 text-rainbow-purple font-bold hover:underline">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  // Mode select
  if (screen === 'mode') {
    return (
      <div className="min-h-screen bg-kid-bg p-4">
        <div className="max-w-2xl mx-auto py-8 text-center">
          <button
            onClick={() => setScreen('player')}
            className="absolute top-4 left-4 px-4 py-2 text-rainbow-purple font-bold hover:underline"
          >
            ← Back
          </button>

          <h2 className="text-3xl font-fun font-bold text-rainbow-purple mb-2">
            Hey {player}!
          </h2>
          <p className="text-xl text-kid-text mb-8">Pick a number game:</p>

          <div className="flex flex-col gap-4 max-w-md mx-auto">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => startGame(m.id)}
                className="
                  bg-rainbow-purple text-white
                  min-h-tap-lg px-6 py-4
                  rounded-kid-lg
                  transition-all duration-200
                  hover:scale-105 active:scale-95
                  shadow-lg hover:shadow-xl
                  text-left
                "
              >
                <div className="text-2xl font-fun font-bold">
                  {m.emoji} {m.label}
                </div>
                <div className="text-sm opacity-90">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Results
  if (screen === 'results') {
    const percent = Math.round((score / total) * 100);
    const trophy = percent >= 90 ? '🥇' : percent >= 70 ? '🥈' : percent >= 50 ? '🥉' : null;
    const trophyName = percent >= 90 ? 'Gold' : percent >= 70 ? 'Silver' : percent >= 50 ? 'Bronze' : null;
    const modeLabel = MODES.find(m => m.id === mode)?.label || 'Numbers';
    const dateStr = new Date().toLocaleDateString();

    const handlePrint = () => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Numbers Trophy - ${player}</title>
          <style>
            body {
              font-family: 'Comic Sans MS', 'Chalkboard', sans-serif;
              text-align: center;
              padding: 40px;
              background: linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%);
              min-height: 100vh;
            }
            .certificate {
              border: 8px solid #8b5cf6;
              border-radius: 20px;
              padding: 40px;
              max-width: 600px;
              margin: 0 auto;
              background: white;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            }
            h1 { color: #8b5cf6; font-size: 2.5em; margin-bottom: 10px; }
            .trophy { font-size: 120px; margin: 20px 0; }
            .name { font-size: 2em; color: #1e293b; margin: 20px 0; }
            .score { font-size: 3em; color: #8b5cf6; font-weight: bold; }
            .game { color: #f97316; font-size: 1.2em; margin: 10px 0; }
            .date { color: #64748b; margin-top: 20px; }
            @media print {
              body { background: white; }
              .certificate { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <h1>🌟 Certificate of Achievement 🌟</h1>
            ${trophy ? `<div class="trophy">${trophy}</div>` : ''}
            <div class="name">${player}</div>
            <div class="game">Numbers: ${modeLabel}</div>
            <div class="score">${score} / ${total}</div>
            ${trophyName ? `<p><strong>${trophyName} Trophy!</strong></p>` : ''}
            <div class="date">${dateStr}</div>
          </div>
          <script>window.onload = () => window.print();</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    };

    return (
      <div className="min-h-screen bg-kid-bg p-4">
        <div className="max-w-2xl mx-auto py-8 text-center">
          <h2 className="text-3xl font-fun font-bold text-rainbow-purple mb-4">
            Great job, {player}!
          </h2>

          <div className="text-6xl font-bold font-fun text-kid-text mb-4">
            {score} / {total}
          </div>

          {trophy && <div className="text-8xl mb-4 animate-bounce">{trophy}</div>}

          <div className="flex flex-col gap-4 max-w-xs mx-auto">
            <button
              onClick={handlePrint}
              className="
                min-h-tap-lg px-8 py-4
                text-xl font-fun font-bold
                bg-rainbow-blue text-white
                rounded-kid-lg
                transition-all duration-200
                hover:scale-105 active:scale-95
                shadow-lg hover:shadow-xl
              "
            >
              Print Trophy 🖨️
            </button>

            <button
              onClick={() => setScreen('mode')}
              className="
                min-h-tap-lg px-8 py-4
                text-xl font-fun font-bold
                bg-rainbow-purple text-white
                rounded-kid-lg
                transition-all duration-200
                hover:scale-105 active:scale-95
                shadow-lg hover:shadow-xl
              "
            >
              Play Again 🔄
            </button>

            <a
              href="/"
              className="
                min-h-tap-lg px-8 py-4
                text-xl font-fun font-bold
                bg-rainbow-yellow text-kid-text
                rounded-kid-lg
                text-center
                transition-all duration-200
                hover:scale-105 active:scale-95
                shadow-lg hover:shadow-xl
              "
            >
              Home 🏠
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  const progress = (total / PROBLEMS_PER_ROUND) * 100;

  return (
    <div className="min-h-screen bg-kid-bg p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setScreen('mode')}
            className="px-4 py-2 text-rainbow-purple font-bold hover:underline"
          >
            ← Back
          </button>
          <div className="text-lg font-fun text-rainbow-purple">{player}</div>
          <div className="text-xl font-bold text-rainbow-blue">{score} / {total}</div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
          <div
            className="bg-rainbow-purple h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Problem display */}
        <div
          className={`
            text-center p-8 rounded-kid-lg mb-8 transition-all
            ${feedback === 'correct' ? 'bg-green-100' : ''}
            ${feedback === 'wrong' ? 'bg-red-100' : ''}
            ${feedback === null ? 'bg-white' : ''}
            shadow-lg
          `}
        >
          {mode === 'recognize' && (
            <>
              <p className="text-2xl font-fun text-kid-text mb-4">
                Tap the number you hear:
              </p>
              <button
                onClick={() => speakNumber(problem.question)}
                className="text-6xl hover:scale-110 transition-transform"
              >
                🔊
              </button>
            </>
          )}

          {mode === 'compare' && (
            <>
              <p className="text-2xl font-fun text-kid-text mb-4">
                Which symbol goes in the middle?
              </p>
              <div className="text-6xl font-bold font-fun text-kid-text">
                {problem.num1} <span className="text-rainbow-purple">?</span> {problem.num2}
              </div>
            </>
          )}

          {mode === 'count' && (
            <>
              <p className="text-2xl font-fun text-kid-text mb-4">
                What number comes next?
              </p>
              <div className="text-6xl font-bold font-fun text-kid-text">
                {problem.question} → <span className="text-rainbow-purple">?</span>
              </div>
            </>
          )}

          {feedback === 'correct' && (
            <div className="text-4xl text-green-600 font-bold mt-4 animate-bounce">
              ✓ Correct!
            </div>
          )}

          {feedback === 'wrong' && (
            <div className="text-2xl text-red-600 font-bold mt-4">
              The answer was: {problem.answer}
            </div>
          )}
        </div>

        {/* Answer choices */}
        <div className={`grid ${mode === 'compare' ? 'grid-cols-3' : 'grid-cols-2'} gap-4 max-w-md mx-auto`}>
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
                  : 'bg-rainbow-yellow text-kid-text hover:scale-105 hover:bg-rainbow-purple hover:text-white active:scale-95'
                }
              `}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
