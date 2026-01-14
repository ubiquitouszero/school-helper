import { useState } from 'react';
import type { AnsweredProblem } from './MathDrill';

interface ResultsProps {
  player: string;
  score: number;
  total: number;
  difficulty?: string;
  problems?: AnsweredProblem[];
  onPlayAgain: () => void;
  onHome: () => void;
}

function getTrophy(score: number, total: number): { type: string; emoji: string; color: string } | null {
  const percent = (score / total) * 100;

  if (percent >= 90) {
    return { type: 'Gold', emoji: '🥇', color: 'text-yellow-500' };
  } else if (percent >= 70) {
    return { type: 'Silver', emoji: '🥈', color: 'text-gray-400' };
  } else if (percent >= 50) {
    return { type: 'Bronze', emoji: '🥉', color: 'text-orange-600' };
  }
  return null;
}

export default function Results({ player, score, total, difficulty, problems, onPlayAgain, onHome }: ResultsProps) {
  const trophy = getTrophy(score, total);
  const percent = Math.round((score / total) * 100);
  const dateStr = new Date().toLocaleDateString();
  const [showWork, setShowWork] = useState(true);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate problems HTML for second page if showWork is enabled and we have problems
    let problemsHtml = '';
    if (showWork && problems && problems.length > 0) {
      const problemRows = problems.map((p, i) => `
        <tr style="${p.isCorrect ? '' : 'background: #fef2f2;'}">
          <td style="padding: 8px; border: 1px solid #ddd;">${i + 1}</td>
          <td style="padding: 8px; border: 1px solid #ddd; font-size: 1.2em;">
            ${p.num1} ${p.operation} ${p.num2} = ${p.answer}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; font-size: 1.2em;">
            ${p.userAnswer}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; font-size: 1.5em;">
            ${p.isCorrect ? '✓' : '✗'}
          </td>
        </tr>
      `).join('');

      problemsHtml = `
        <div class="page-break"></div>
        <div class="work-page">
          <h2 style="color: #3b82f6; margin-bottom: 20px;">Math Work - ${player}</h2>
          <p style="color: #64748b; margin-bottom: 10px;">${dateStr} | ${difficulty || 'Practice'} | Score: ${score}/${total}</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="padding: 10px; border: 1px solid #ddd; width: 50px;">#</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Problem</th>
                <th style="padding: 10px; border: 1px solid #ddd; width: 100px;">Answer</th>
                <th style="padding: 10px; border: 1px solid #ddd; width: 60px;">Result</th>
              </tr>
            </thead>
            <tbody>
              ${problemRows}
            </tbody>
          </table>
        </div>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Math Trophy - ${player}</title>
        <style>
          body {
            font-family: 'Comic Sans MS', 'Chalkboard', sans-serif;
            text-align: center;
            padding: 40px;
            background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
            min-height: 100vh;
          }
          .certificate {
            border: 8px solid #3b82f6;
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
          h1 { color: #3b82f6; font-size: 2.5em; margin-bottom: 10px; }
          .trophy { font-size: 120px; margin: 20px 0; }
          .name { font-size: 2em; color: #1e293b; margin: 20px 0; }
          .score { font-size: 3em; color: #3b82f6; font-weight: bold; }
          .game { color: #8b5cf6; font-size: 1.2em; margin: 10px 0; }
          .date { color: #64748b; margin-top: 20px; }
          .page-break { page-break-before: always; }
          .work-page {
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            text-align: left;
          }
          @media print {
            body { background: white; padding: 20px; }
            .certificate { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h1>🌟 Certificate of Achievement 🌟</h1>
          ${trophy ? `<div class="trophy">${trophy.emoji}</div>` : ''}
          <div class="name">${player}</div>
          <div class="game">Math Drills${difficulty ? ` (${difficulty})` : ''}</div>
          <div class="score">${score} / ${total}</div>
          ${trophy ? `<p><strong>${trophy.type} Trophy!</strong></p>` : ''}
          <div class="date">${dateStr}</div>
        </div>
        ${problemsHtml}
        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl font-fun font-bold text-rainbow-purple mb-4">
        Great job, {player}!
      </h2>

      {/* Score */}
      <div className="text-6xl font-bold font-fun text-kid-text mb-4">
        {score} / {total}
      </div>

      <div className="text-2xl text-rainbow-blue mb-8">
        {percent}% correct
      </div>

      {/* Trophy */}
      {trophy && (
        <div className="mb-8 animate-bounce">
          <div className="text-8xl mb-2">{trophy.emoji}</div>
          <div className={`text-2xl font-bold ${trophy.color}`}>
            {trophy.type} Trophy!
          </div>
        </div>
      )}

      {!trophy && (
        <div className="mb-8">
          <div className="text-4xl mb-2">💪</div>
          <div className="text-xl text-kid-text">
            Keep practicing! You'll get a trophy next time!
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-4 max-w-xs mx-auto">
        {/* Show Work Toggle - only show if we have problems */}
        {problems && problems.length > 0 && (
          <label className="flex items-center justify-center gap-3 p-3 bg-gray-100 rounded-kid cursor-pointer">
            <input
              type="checkbox"
              checked={showWork}
              onChange={(e) => setShowWork(e.target.checked)}
              className="w-6 h-6 accent-rainbow-purple"
            />
            <span className="text-lg font-fun text-kid-text">Show my work</span>
          </label>
        )}

        <button
          onClick={handlePrint}
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
          Print Trophy 🖨️
        </button>

        <button
          onClick={onPlayAgain}
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
  );
}
