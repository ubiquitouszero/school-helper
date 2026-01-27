#!/usr/bin/env python3
"""Generate MP3 audio files for sight words using Microsoft Edge TTS."""

import asyncio
import os
import edge_tts

# MES Kindergarten Essential Sight Words
SIGHT_WORDS = [
    'I', 'a', 'the', 'to', 'play', 'see', 'for', 'like', 'you', 'who',
    'what', 'go', 'so', 'look', 'come', 'said', 'be', 'he', 'she', 'me',
    'we', 'are', 'no', 'they', 'was', 'will', 'one', 'two', 'three', 'four',
    'that', 'this', 'do', 'my', 'too', 'am', 'can', 'at', 'all', 'good', 'say'
]

# Use a friendly female voice (good for kids)
VOICE = "en-US-AnaNeural"  # Young, friendly voice

# Output directory
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio', 'words')


async def generate_word(word: str):
    """Generate audio for a single word."""
    filename = f"{word.lower()}.mp3"
    filepath = os.path.join(OUTPUT_DIR, filename)

    # Skip if already exists
    if os.path.exists(filepath):
        print(f"  Skipping {word} (already exists)")
        return

    communicate = edge_tts.Communicate(word, VOICE, rate="-10%")
    await communicate.save(filepath)
    print(f"  Created {filename}")


async def main():
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"Generating {len(SIGHT_WORDS)} sight word audio files...")
    print(f"Voice: {VOICE}")
    print(f"Output: {OUTPUT_DIR}\n")

    for word in SIGHT_WORDS:
        await generate_word(word)

    print(f"\nDone! Generated audio for {len(SIGHT_WORDS)} words.")


if __name__ == "__main__":
    asyncio.run(main())
