import { useState } from 'react';

interface PlayerSelectProps {
  onSelect: (player: string) => void;
}

const PLAYERS = ['Kaland', 'Valen', 'Mom', 'Dad', 'Guest'];

export default function PlayerSelect({ onSelect }: PlayerSelectProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="text-center">
      <h2 className="text-3xl font-fun font-bold text-rainbow-purple mb-6">
        Who's playing?
      </h2>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {PLAYERS.map((player) => (
          <button
            key={player}
            onClick={() => setSelected(player)}
            className={`
              min-w-[120px] min-h-tap-lg px-6 py-4
              text-xl font-fun font-bold
              rounded-kid-lg
              transition-all duration-200
              shadow-lg hover:shadow-xl
              ${selected === player
                ? 'bg-rainbow-purple text-white scale-105'
                : 'bg-white text-rainbow-purple border-4 border-rainbow-purple hover:bg-rainbow-yellow hover:border-rainbow-yellow hover:text-kid-text'
              }
            `}
          >
            {player}
          </button>
        ))}
      </div>

      {selected && (
        <button
          onClick={() => onSelect(selected)}
          className="
            min-h-tap-lg px-12 py-4
            text-2xl font-fun font-bold
            bg-rainbow-blue text-white
            rounded-kid-lg
            transition-all duration-200
            hover:scale-105 active:scale-95
            shadow-lg hover:shadow-xl
            animate-bounce-small
          "
        >
          Let's Go, {selected}! 🚀
        </button>
      )}
    </div>
  );
}
