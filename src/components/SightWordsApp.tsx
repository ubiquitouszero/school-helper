import { useState, useEffect, useCallback } from 'react';
import { playWordAudio, speakWithCallback, testSpeechSupport } from '../lib/speech';

// MES Kindergarten Essential Sight Words from Valen's school
const SIGHT_WORDS = [
  'I', 'a', 'the', 'to', 'play', 'see', 'for', 'like', 'you', 'who',
  'what', 'go', 'so', 'look', 'come', 'said', 'be', 'he', 'she', 'me',
  'we', 'are', 'no', 'they', 'was', 'will', 'one', 'two', 'three', 'four',
  'that', 'this', 'do', 'my', 'too', 'am', 'can', 'at', 'all', 'good', 'say'
];

type Screen = 'player' | 'game' | 'results';

const PLAYERS = ['Kaland', 'Valen', 'Mom', 'Dad', 'Guest'];

interface WordProblem {
  targetWord: string;
  choices: string[];
}

function generateProblem(): WordProblem {
  const targetWord = SIGHT_WORDS[Math.floor(Math.random() * SIGHT_WORDS.length)];

  // Get 3 other random words
  const otherWords = SIGHT_WORDS.filter(w => w !== targetWord);
  const shuffled = otherWords.sort(() => Math.random() - 0.5);
  const choices = [targetWord, ...shuffled.slice(0, 3)].sort(() => Math.random() - 0.5);

  return { targetWord, choices };
}

export default function SightWordsApp() {
  const [screen, setScreen] = useState<Screen>('player');
  const [player, setPlayer] = useState('');
  const [problem, setProblem] = useState<WordProblem | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [speechWorks, setSpeechWorks] = useState<boolean | null>(null);
  const [showWord, setShowWord] = useState(false);

  // Test speech support on mount
  useEffect(() => {
    testSpeechSupport().then(works => {
      setSpeechWorks(works);
    });
  }, []);

  // Initialize problem on client side only
  useEffect(() => {
    if (problem === null) {
      setProblem(generateProblem());
    }
  }, [problem]);

  const WORDS_PER_ROUND = 10;

  const speakWord = useCallback((word: string) => {
    setSpeaking(true);

    // Try pre-recorded audio first (works on all devices including Kindle)
    playWordAudio(
      word,
      () => setSpeaking(false),  // onEnd
      () => {
        // Audio file not found - fall back to speech synthesis
        if (speechWorks !== false) {
          speakWithCallback(
            word,
            () => setSpeaking(false),
            () => {
              // Both failed - show word visually
              setSpeaking(false);
              setShowWord(true);
              setTimeout(() => setShowWord(false), 2000);
            }
          );
        } else {
          // No audio, no speech - show word visually
          setSpeaking(false);
          setShowWord(true);
          setTimeout(() => setShowWord(false), 2000);
        }
      }
    );
  }, [speechWorks]);

  const nextProblem = useCallback(() => {
    if (total >= WORDS_PER_ROUND) {
      setScreen('results');
      return;
    }
    setProblem(generateProblem());
    setFeedback(null);
    setShowWord(false);
  }, [total]);

  useEffect(() => {
    if (feedback !== null) {
      const timer = setTimeout(nextProblem, feedback === 'correct' ? 800 : 1500);
      return () => clearTimeout(timer);
    }
  }, [feedback, nextProblem]);

  // Speak the word when problem changes
  useEffect(() => {
    if (screen === 'game' && feedback === null && problem) {
      const timer = setTimeout(() => speakWord(problem.targetWord), 500);
      return () => clearTimeout(timer);
    }
  }, [problem, screen, feedback, speakWord]);

  const handleAnswer = (word: string) => {
    if (feedback !== null || !problem) return;

    setTotal(t => t + 1);

    if (word === problem.targetWord) {
      setScore(s => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
  };

  const handlePlayAgain = () => {
    setScore(0);
    setTotal(0);
    setProblem(generateProblem());
    setFeedback(null);
    setScreen('game');
  };

  // Player select screen
  if (screen === 'player') {
    return (
      <div className="min-h-screen bg-kid-bg p-4">
        <div className="max-w-2xl mx-auto py-8 text-center">
          <h2 className="text-3xl font-fun font-bold text-rainbow-orange mb-6">
            Sight Words!
          </h2>
          <p className="text-xl text-kid-text mb-8">Who's practicing today?</p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {PLAYERS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPlayer(p);
                  setScreen('game');
                }}
                className="
                  min-w-[120px] min-h-tap-lg px-6 py-4
                  text-xl font-fun font-bold
                  bg-rainbow-orange text-white
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

          <a
            href="/"
            className="inline-block px-4 py-2 text-rainbow-purple font-bold hover:underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  // Results screen
  if (screen === 'results') {
    const percent = Math.round((score / total) * 100);
    const trophy = percent >= 90 ? '🥇' : percent >= 70 ? '🥈' : percent >= 50 ? '🥉' : null;
    const trophyName = percent >= 90 ? 'Gold' : percent >= 70 ? 'Silver' : percent >= 50 ? 'Bronze' : null;
    const dateStr = new Date().toLocaleDateString();

    const handlePrint = () => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sight Words Trophy - ${player}</title>
          <style>
            body {
              font-family: 'Comic Sans MS', 'Chalkboard', sans-serif;
              text-align: center;
              padding: 40px;
              background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%);
              min-height: 100vh;
            }
            .certificate {
              border: 8px solid #f97316;
              border-radius: 20px;
              padding: 40px;
              max-width: 600px;
              margin: 0 auto;
              background: white;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            }
            h1 { color: #f97316; font-size: 2.5em; margin-bottom: 10px; }
            .trophy { font-size: 120px; margin: 20px 0; }
            .name { font-size: 2em; color: #1e293b; margin: 20px 0; }
            .score { font-size: 3em; color: #f97316; font-weight: bold; }
            .game { color: #8b5cf6; font-size: 1.2em; margin: 10px 0; }
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
            <div class="game">Sight Words</div>
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
          <h2 className="text-3xl font-fun font-bold text-rainbow-orange mb-4">
            Great reading, {player}!
          </h2>

          <div className="text-6xl font-bold font-fun text-kid-text mb-4">
            {score} / {total}
          </div>

          {trophy && (
            <div className="text-8xl mb-4 animate-bounce">{trophy}</div>
          )}

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
              onClick={handlePlayAgain}
              className="
                min-h-tap-lg px-8 py-4
                text-xl font-fun font-bold
                bg-rainbow-orange text-white
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
                transition-all duration-200
                hover:scale-105 active:scale-95
                shadow-lg hover:shadow-xl
                text-center
              "
            >
              Home 🏠
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Game screen - wait for problem to be generated
  if (!problem) {
    return (
      <div className="min-h-screen bg-kid-bg p-4 flex items-center justify-center">
        <div className="text-2xl font-fun text-rainbow-orange">Loading...</div>
      </div>
    );
  }

  const progress = (total / WORDS_PER_ROUND) * 100;

  return (
    <div className="min-h-screen bg-kid-bg p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <a href="/" className="px-4 py-2 text-rainbow-purple font-bold hover:underline">
            ← Back
          </a>
          <div className="text-lg font-fun text-rainbow-orange">{player}</div>
          <div className="text-xl font-bold text-rainbow-blue">{score} / {total}</div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
          <div
            className="bg-rainbow-orange h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Word prompt */}
        <div className="text-center mb-8">
          <p className="text-2xl font-fun text-kid-text mb-4">
            {speechWorks === false ? 'Tap to see the word:' : 'Tap the word you hear:'}
          </p>

          <button
            onClick={() => speakWord(problem.targetWord)}
            disabled={speaking}
            className={`
              text-6xl p-4 rounded-kid-lg
              transition-all duration-200
              ${speaking ? 'animate-pulse' : 'hover:scale-110'}
            `}
          >
            {speechWorks === false ? '👀' : '🔊'}
          </button>

          {/* Show word visually when speech doesn't work */}
          {showWord && (
            <div className="mt-4 text-5xl font-bold font-fun text-rainbow-purple animate-pulse">
              {problem.targetWord}
            </div>
          )}

          {feedback === 'wrong' && (
            <div className="mt-4 text-2xl text-red-600 font-bold">
              The word was: <span className="text-4xl">{problem.targetWord}</span>
            </div>
          )}
        </div>

        {/* Answer choices */}
        <div
          className={`
            grid grid-cols-2 gap-4 max-w-md mx-auto p-4 rounded-kid-lg
            ${feedback === 'correct' ? 'bg-green-100' : ''}
            ${feedback === 'wrong' ? 'bg-red-100' : ''}
          `}
        >
          {problem.choices.map((word, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(word)}
              disabled={feedback !== null}
              className={`
                min-h-tap-lg text-3xl font-bold font-fun
                rounded-kid-lg
                transition-all duration-200
                shadow-lg
                ${feedback !== null
                  ? word === problem.targetWord
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                  : 'bg-white text-kid-text border-4 border-rainbow-orange hover:bg-rainbow-orange hover:text-white active:scale-95'
                }
              `}
            >
              {word}
            </button>
          ))}
        </div>

        {feedback === 'correct' && (
          <div className="text-center mt-4 text-4xl text-green-600 font-bold animate-bounce">
            ✓ Correct!
          </div>
        )}
      </div>
    </div>
  );
}
