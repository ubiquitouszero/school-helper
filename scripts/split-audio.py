#!/usr/bin/env python3
"""Split a single audio recording into individual sight word files using scipy."""

import os
import numpy as np
from scipy.io import wavfile
from scipy.io.wavfile import write as write_wav

# MES Kindergarten Essential Sight Words (in recording order)
SIGHT_WORDS = [
    'I', 'a', 'the', 'to', 'play', 'see', 'for', 'like', 'you', 'who',
    'what', 'go', 'so', 'look', 'come', 'said', 'be', 'he', 'she', 'me',
    'we', 'are', 'no', 'they', 'was', 'will', 'one', 'two', 'three', 'four',
    'that', 'this', 'do', 'my', 'too', 'am', 'can', 'at', 'all', 'good', 'say'
]

# Paths
SCRIPT_DIR = os.path.dirname(__file__)
INPUT_FILE = os.path.join(SCRIPT_DIR, '..', 'docs', 'Source-Material', 'sight_words20260126v2.wav')
OUTPUT_DIR = os.path.join(SCRIPT_DIR, '..', 'public', 'audio', 'words')


def find_silence_splits(audio, sample_rate, silence_thresh=0.02, min_silence_ms=250, min_sound_ms=50):
    """Find split points based on silence detection."""
    # Normalize audio to 0-1 range
    if audio.dtype == np.int16:
        audio_normalized = np.abs(audio.astype(np.float32) / 32768.0)
    else:
        audio_normalized = np.abs(audio.astype(np.float32) / np.max(np.abs(audio)))

    # If stereo, convert to mono for analysis
    if len(audio_normalized.shape) > 1:
        audio_normalized = np.mean(audio_normalized, axis=1)

    # Calculate samples for time windows
    min_silence_samples = int(sample_rate * min_silence_ms / 1000)
    min_sound_samples = int(sample_rate * min_sound_ms / 1000)

    # Find regions above/below threshold using rolling window
    window_size = int(sample_rate * 0.01)  # 10ms window
    is_sound = np.zeros(len(audio_normalized), dtype=bool)

    for i in range(0, len(audio_normalized) - window_size, window_size):
        window_max = np.max(audio_normalized[i:i+window_size])
        if window_max > silence_thresh:
            is_sound[i:i+window_size] = True

    # Find transitions
    transitions = np.diff(is_sound.astype(int))
    sound_starts = np.where(transitions == 1)[0]
    sound_ends = np.where(transitions == -1)[0]

    # Handle edge cases
    if is_sound[0]:
        sound_starts = np.insert(sound_starts, 0, 0)
    if is_sound[-1]:
        sound_ends = np.append(sound_ends, len(audio_normalized))

    # Pair up starts and ends
    segments = []
    for start, end in zip(sound_starts, sound_ends):
        duration = end - start
        if duration >= min_sound_samples:
            # Add padding
            padding = int(sample_rate * 0.05)  # 50ms padding
            padded_start = max(0, start - padding)
            padded_end = min(len(audio), end + padding)
            segments.append((padded_start, padded_end))

    return segments


def split_audio():
    print(f"Loading audio file: {INPUT_FILE}")
    sample_rate, audio = wavfile.read(INPUT_FILE)

    print(f"Sample rate: {sample_rate} Hz")
    print(f"Audio shape: {audio.shape}")
    print(f"Audio length: {len(audio) / sample_rate:.1f} seconds")
    print(f"Expected words: {len(SIGHT_WORDS)}")

    # Find split points
    print("\nDetecting silence and splitting...")
    segments = find_silence_splits(audio, sample_rate)

    print(f"Found {len(segments)} audio segments")

    if len(segments) != len(SIGHT_WORDS):
        print(f"\n** WARNING: Expected {len(SIGHT_WORDS)} words but found {len(segments)} segments!")
        print("\nSegment durations:")
        for i, (start, end) in enumerate(segments):
            duration_ms = (end - start) / sample_rate * 1000
            print(f"  {i+1}: {duration_ms:.0f}ms")

        response = input("\nContinue anyway? (y/n): ")
        if response.lower() != 'y':
            return

    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Export each segment as WAV (we'll convert to MP3 separately)
    print(f"\nExporting to: {OUTPUT_DIR}")
    for i, ((start, end), word) in enumerate(zip(segments, SIGHT_WORDS)):
        filename = f"{word.lower()}.wav"
        filepath = os.path.join(OUTPUT_DIR, filename)

        # Extract segment
        segment = audio[start:end]
        duration_ms = len(segment) / sample_rate * 1000

        # Write WAV file
        write_wav(filepath, sample_rate, segment)
        print(f"  {i+1}. {word} -> {filename} ({duration_ms:.0f}ms)")

    print(f"\nDone! Exported {min(len(segments), len(SIGHT_WORDS))} word files as WAV.")
    print("\nNote: Files are WAV format. The app expects MP3 but WAV will also work in browsers.")


if __name__ == "__main__":
    split_audio()
