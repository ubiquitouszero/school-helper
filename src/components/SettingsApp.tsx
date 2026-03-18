import { useState, useEffect } from 'react';
import {
  getAvailableVoices,
  getSavedVoiceName,
  saveVoiceName,
  speak,
  getSightWordsVoice,
  saveSightWordsVoice,
  previewSightWordsVoice,
  SIGHT_WORDS_VOICES,
  type VoiceOption,
  type SightWordsVoice
} from '../lib/speech';
import { FONT_OPTIONS, getSavedFont, saveFont } from '../lib/fonts';

export default function SettingsApp() {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [sightWordsVoice, setSightWordsVoice] = useState<SightWordsVoice>('dad');
  const [selectedFont, setSelectedFont] = useState('system');

  // Load sight words voice preference and font
  useEffect(() => {
    setSightWordsVoice(getSightWordsVoice());
    setSelectedFont(getSavedFont());
  }, []);

  // Load voices (they may not be available immediately)
  useEffect(() => {
    const loadVoices = () => {
      const available = getAvailableVoices();
      if (available.length > 0) {
        setVoices(available);
        setSelectedVoice(getSavedVoiceName() || available[0]?.voice.name || null);
        setLoaded(true);
      }
    };

    loadVoices();

    // Chrome loads voices async
    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const handleVoiceSelect = (voiceName: string) => {
    setSelectedVoice(voiceName);
    saveVoiceName(voiceName);

    // Preview the voice
    setTimeout(() => {
      speak('Hello! I will read words for you!');
    }, 100);
  };

  const previewVoice = (voiceName: string) => {
    // Temporarily use this voice for preview
    const voice = voices.find(v => v.voice.name === voiceName);
    if (voice && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('Hello! One, two, three.');
      utterance.voice = voice.voice;
      utterance.rate = 0.75;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-kid-bg p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <a
            href="/"
            className="px-4 py-2 text-rainbow-purple font-bold hover:underline"
          >
            ← Back
          </a>
          <h1 className="text-3xl font-fun font-bold text-rainbow-purple">
            ⚙️ Settings
          </h1>
          <div className="w-20"></div>
        </div>

        {/* Sight Words Voice Selection */}
        <div className="bg-white rounded-kid-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-fun font-bold text-kid-text mb-4">
            📖 Sight Words Voice
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Who should read the sight words?
          </p>

          <div className="grid gap-3">
            {SIGHT_WORDS_VOICES.map((voice) => (
              <button
                key={voice.id}
                onClick={() => {
                  setSightWordsVoice(voice.id);
                  saveSightWordsVoice(voice.id);
                  previewSightWordsVoice(voice.id);
                }}
                className={`
                  flex items-center justify-between
                  p-4 rounded-kid
                  transition-all duration-200
                  ${sightWordsVoice === voice.id
                    ? 'bg-rainbow-orange text-white shadow-lg'
                    : 'bg-gray-100 text-kid-text hover:bg-rainbow-yellow'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {sightWordsVoice === voice.id ? '✓' : '🔊'}
                  </span>
                  <div className="text-left">
                    <span className="font-fun font-bold text-lg block">
                      {voice.name}
                    </span>
                    <span className={`text-sm ${sightWordsVoice === voice.id ? 'text-white/80' : 'text-gray-500'}`}>
                      {voice.description}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    previewSightWordsVoice(voice.id);
                  }}
                  className={`
                    px-4 py-2 rounded-kid
                    font-bold text-sm
                    transition-all
                    ${sightWordsVoice === voice.id
                      ? 'bg-white/20 hover:bg-white/30'
                      : 'bg-rainbow-blue text-white hover:bg-rainbow-purple'
                    }
                  `}
                >
                  Test 🔊
                </button>
              </button>
            ))}
          </div>
        </div>

        {/* Voice Selection */}
        <div className="bg-white rounded-kid-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-fun font-bold text-kid-text mb-4">
            🔊 Pick a Voice
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Choose who reads words and numbers to you!
          </p>

          {!loaded ? (
            <div className="text-center py-8">
              <div className="text-4xl animate-bounce mb-4">🔄</div>
              <p className="text-lg text-gray-500">Loading voices...</p>
            </div>
          ) : voices.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">😕</div>
              <p className="text-lg text-gray-500">
                No voices found. Try using Chrome or Edge browser.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {voices.map((voice) => (
                <button
                  key={voice.voice.name}
                  onClick={() => handleVoiceSelect(voice.voice.name)}
                  className={`
                    flex items-center justify-between
                    p-4 rounded-kid
                    transition-all duration-200
                    ${selectedVoice === voice.voice.name
                      ? 'bg-rainbow-purple text-white shadow-lg'
                      : 'bg-gray-100 text-kid-text hover:bg-rainbow-yellow'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {selectedVoice === voice.voice.name ? '✓' : '🔊'}
                    </span>
                    <span className="font-fun font-bold text-lg">
                      {voice.name}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      previewVoice(voice.voice.name);
                    }}
                    className={`
                      px-4 py-2 rounded-kid
                      font-bold text-sm
                      transition-all
                      ${selectedVoice === voice.voice.name
                        ? 'bg-white/20 hover:bg-white/30'
                        : 'bg-rainbow-blue text-white hover:bg-rainbow-purple'
                      }
                    `}
                  >
                    Test 🔊
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Selection */}
        <div className="bg-white rounded-kid-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-fun font-bold text-kid-text mb-4">
            🔤 Pick a Font
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Choose how words look on screen!
          </p>

          <div className="grid gap-3">
            {FONT_OPTIONS.map((font) => (
              <button
                key={font.id}
                onClick={() => {
                  setSelectedFont(font.id);
                  saveFont(font.id);
                }}
                className={`
                  flex items-center justify-between
                  p-4 rounded-kid
                  transition-all duration-200
                  ${selectedFont === font.id
                    ? 'bg-rainbow-blue text-white shadow-lg'
                    : 'bg-gray-100 text-kid-text hover:bg-rainbow-yellow'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {selectedFont === font.id ? '✓' : '🔤'}
                  </span>
                  <div className="text-left">
                    <span className="font-bold text-lg block" style={{ fontFamily: font.family }}>
                      {font.name}
                    </span>
                    <span className={`text-sm ${selectedFont === font.id ? 'text-white/80' : 'text-gray-500'}`}>
                      {font.description}
                    </span>
                  </div>
                </div>
                <span
                  className="text-2xl font-bold"
                  style={{ fontFamily: font.family }}
                >
                  Abc 123
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Other Settings (placeholder for future) */}
        <div className="bg-white rounded-kid-lg shadow-lg p-6">
          <h2 className="text-2xl font-fun font-bold text-kid-text mb-4">
            🎨 More Settings Coming Soon!
          </h2>
          <ul className="text-lg text-gray-600 space-y-2">
            <li>• Dark mode</li>
            <li>• Color themes</li>
            <li>• Sound effects on/off</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
