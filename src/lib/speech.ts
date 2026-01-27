// Speech utility for School Helper
// Provides consistent voice selection across the app
// Falls back to pre-recorded audio for devices that don't support Web Speech API

const STORAGE_KEY = 'school-helper-voice';
const SIGHT_WORDS_VOICE_KEY = 'school-helper-sight-words-voice';
const AUDIO_BASE_PATH = '/audio/words/';

// Sight words voice options
export type SightWordsVoice = 'dad' | 'ana';

export const SIGHT_WORDS_VOICES: { id: SightWordsVoice; name: string; description: string }[] = [
  { id: 'dad', name: 'Dad', description: 'Recorded by Dad' },
  { id: 'ana', name: 'Ana', description: 'Computer voice' },
];

// Get saved sight words voice preference
export function getSightWordsVoice(): SightWordsVoice {
  if (typeof window === 'undefined') return 'dad';
  const saved = localStorage.getItem(SIGHT_WORDS_VOICE_KEY);
  return (saved === 'ana' ? 'ana' : 'dad') as SightWordsVoice;
}

// Save sight words voice preference
export function saveSightWordsVoice(voice: SightWordsVoice): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SIGHT_WORDS_VOICE_KEY, voice);
}

// Play a pre-recorded word audio file based on voice preference
export function playWordAudio(
  word: string,
  onEnd?: () => void,
  onError?: () => void
): void {
  const wordLower = word.toLowerCase();
  const voicePref = getSightWordsVoice();

  const tryPlay = (extension: string, fallback?: () => void) => {
    const audio = new Audio(AUDIO_BASE_PATH + wordLower + extension);

    audio.onended = () => {
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      if (fallback) {
        fallback();
      } else {
        console.warn(`Audio file not found for word: ${word}`);
        if (onError) onError();
      }
    };

    audio.play().catch(() => {
      if (fallback) {
        fallback();
      } else if (onError) {
        onError();
      }
    });
  };

  // Use preferred voice, fall back to other if not available
  if (voicePref === 'dad') {
    // Dad = WAV files, fallback to Ana (MP3)
    tryPlay('.wav', () => tryPlay('.mp3'));
  } else {
    // Ana = MP3 files, fallback to Dad (WAV)
    tryPlay('.mp3', () => tryPlay('.wav'));
  }
}

// Preview a sight words voice
export function previewSightWordsVoice(voice: SightWordsVoice): void {
  const extension = voice === 'dad' ? '.wav' : '.mp3';
  const audio = new Audio(AUDIO_BASE_PATH + 'play' + extension);
  audio.play().catch(() => {
    console.warn('Could not preview voice');
  });
}

// Track if speech synthesis actually works on this device
let speechTestedWorking: boolean | null = null;

// Test if speech synthesis actually works (not just exists)
export function testSpeechSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      speechTestedWorking = false;
      resolve(false);
      return;
    }

    // If already tested, return cached result
    if (speechTestedWorking !== null) {
      resolve(speechTestedWorking);
      return;
    }

    // Wait for voices to load
    const checkVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length === 0) {
        speechTestedWorking = false;
        resolve(false);
        return;
      }

      // Try a silent test utterance
      const testUtterance = new SpeechSynthesisUtterance('');
      testUtterance.volume = 0;
      testUtterance.onend = () => {
        speechTestedWorking = true;
        resolve(true);
      };
      testUtterance.onerror = () => {
        speechTestedWorking = false;
        resolve(false);
      };

      // Timeout fallback - if nothing happens in 1 second, assume broken
      const timeout = setTimeout(() => {
        if (speechTestedWorking === null) {
          speechTestedWorking = false;
          resolve(false);
        }
      }, 1000);

      testUtterance.onend = () => {
        clearTimeout(timeout);
        speechTestedWorking = true;
        resolve(true);
      };

      speechSynthesis.speak(testUtterance);
    };

    // Voices may load async
    if (speechSynthesis.getVoices().length > 0) {
      checkVoices();
    } else {
      speechSynthesis.onvoiceschanged = checkVoices;
      // Fallback timeout if onvoiceschanged never fires
      setTimeout(() => {
        if (speechTestedWorking === null) {
          checkVoices();
        }
      }, 500);
    }
  });
}

// Check if speech is known to work (synchronous, returns cached result)
export function isSpeechSupported(): boolean {
  return speechTestedWorking === true;
}

export interface VoiceOption {
  name: string;
  voice: SpeechSynthesisVoice;
  preview: string; // Word to preview the voice
}

// Get all available English voices
export function getAvailableVoices(): VoiceOption[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }

  const voices = speechSynthesis.getVoices();

  return voices
    .filter(v => v.lang.startsWith('en'))
    .map(voice => ({
      name: voice.name.replace('Microsoft ', '').replace(' Online (Natural)', ''),
      voice,
      preview: 'Hello!'
    }));
}

// Get saved voice preference
export function getSavedVoiceName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

// Save voice preference
export function saveVoiceName(voiceName: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, voiceName);
}

// Get the preferred voice (saved or default)
export function getPreferredVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const voices = speechSynthesis.getVoices();
  const savedName = getSavedVoiceName();

  // Try to find saved voice
  if (savedName) {
    const saved = voices.find(v => v.name === savedName);
    if (saved) return saved;
  }

  // Default preferences
  const preferredVoice = voices.find(v =>
    v.name.includes('Samantha') || // Mac - friendly
    v.name.includes('Zira') ||     // Windows
    v.name.includes('Google US English Female') || // Chrome
    (v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
  ) || voices.find(v => v.lang.startsWith('en-US')) || voices[0];

  return preferredVoice || null;
}

// Speak text with the preferred voice
export function speak(text: string, options?: { rate?: number; pitch?: number; delay?: number }): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Cancel any ongoing speech
  speechSynthesis.cancel();

  const doSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(text);

    const voice = getPreferredVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = options?.rate ?? 0.75;   // Slower for kids
    utterance.pitch = options?.pitch ?? 1.1;  // Friendlier
    utterance.volume = 1.0;

    speechSynthesis.speak(utterance);
  };

  // Small delay to prevent cutoff on first play
  const delay = options?.delay ?? 150;
  if (delay > 0) {
    setTimeout(doSpeak, delay);
  } else {
    doSpeak();
  }
}

// Speak with callback when done
export function speakWithCallback(
  text: string,
  onEnd: () => void,
  onError?: () => void,
  delay: number = 150
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd();
    return;
  }

  speechSynthesis.cancel();

  const doSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(text);

    const voice = getPreferredVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = 0.75;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;
    utterance.onend = onEnd;
    utterance.onerror = () => {
      if (onError) onError();
      else onEnd();
    };

    speechSynthesis.speak(utterance);
  };

  // Small delay to prevent cutoff
  if (delay > 0) {
    setTimeout(doSpeak, delay);
  } else {
    doSpeak();
  }
}
