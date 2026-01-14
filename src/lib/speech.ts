// Speech utility for School Helper
// Provides consistent voice selection across the app

const STORAGE_KEY = 'school-helper-voice';

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
