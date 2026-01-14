type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultySelectProps {
  player: string;
  onSelect: (difficulty: Difficulty) => void;
  onBack: () => void;
}

const DIFFICULTIES: { id: Difficulty; label: string; desc: string; color: string }[] = [
  { id: 'easy', label: 'Easy', desc: 'Numbers up to 10, just adding', color: 'bg-rainbow-blue' },
  { id: 'medium', label: 'Medium', desc: 'Numbers up to 20, adding & subtracting', color: 'bg-rainbow-purple' },
  { id: 'hard', label: 'Hard', desc: 'Bigger numbers, times tables too!', color: 'bg-rainbow-orange' },
];

export default function DifficultySelect({ player, onSelect, onBack }: DifficultySelectProps) {
  return (
    <div className="text-center">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 px-4 py-2 text-rainbow-purple font-bold hover:underline"
      >
        ← Back
      </button>

      <h2 className="text-3xl font-fun font-bold text-rainbow-purple mb-2">
        Hey {player}!
      </h2>
      <p className="text-xl text-kid-text mb-8">Pick your challenge level:</p>

      <div className="flex flex-col gap-4 max-w-md mx-auto">
        {DIFFICULTIES.map((diff) => (
          <button
            key={diff.id}
            onClick={() => onSelect(diff.id)}
            className={`
              ${diff.color} text-white
              min-h-tap-lg px-6 py-4
              rounded-kid-lg
              transition-all duration-200
              hover:scale-105 active:scale-95
              shadow-lg hover:shadow-xl
              text-left
            `}
          >
            <div className="text-2xl font-fun font-bold">{diff.label}</div>
            <div className="text-sm opacity-90">{diff.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
