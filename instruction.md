## Project Overview

You are building a client-side application that transforms static PDFs into an interactive audio experience. Instead of just "reading text," this app will feel like a media player—complete with a progress bar, time-remaining estimates, and synchronized text highlighting.

### The Tech Stack

- **PDF.js:** To parse and extract raw text from PDF blobs.
- **Web Speech API:** Specifically `window.speechSynthesis` and `SpeechSynthesisUtterance`.
- **Tailwind CSS:** For a sleek, "Dark Mode" movie-player aesthetic.
- **Vanilla JavaScript:** To manage state and the playback queue.

---

## Phase 1: The "Clean Engine" (Text Extraction & Normalization)

The biggest hurdle with PDF.js is that it extracts text in "chunks" based on visual position, not logical flow. If you feed raw chunks to the Speech API, the voice will sound robotic and choppy.

**Your Tasks:**

1. **Extraction:** Initialize PDF.js and loop through pages to get raw text.
2. **Sanitization:** Use Regex to remove artifacts (page numbers, headers/footers) and fix broken words (hyphenated at line breaks).
3. **Sentence Tokenization:** Break the cleaned text into an array of sentences.

- _Why?_ The Web Speech API works best with smaller chunks, and this array will serve as our "Time Code" for the progress bar.

4. **The Master Object:** Create a data structure that maps each sentence index to its character length.

---

## Phase 2: The "Playback Controller" (State Management)

Since the Web Speech API is "fire and forget" (it doesn’t give us a `currentTime` like a video file), we must simulate it using our sentence array.

**Your Tasks:**

1. **Initialization:** Build the UI with Play, Pause, Stop, and a "Skip Sentence" button.
2. **The Queue:** Create a function that speaks `sentences[currentIndex]`.
3. **Boundary Events:** Use the `onboundary` event of the speech utterance to track word-level progress within a sentence if you want to be fancy.
4. **Chaining:** When one sentence finishes, increment the `currentIndex` and speak the next.

---

## Phase 3: The "Cinematic HUD" (Progress & Time)

This is where we calculate the "Movie Experience."

**Your Tasks:**

1. **Estimated Time Remaining (ETR):** \* Formula:
2. **The Progress Bar:** A visual bar where `(currentIndex / totalSentences) * 100` determines the width.
3. **Active Highlighting:** As a sentence is read, scroll the text view and highlight the active sentence in real-time.

---

## Instructions

**Your Goal:** Start with **Phase 1**. Do not worry about the UI yet; focus on a script that can take a PDF file and output a clean array of sentences to the console.

> **Important:** PDFs are notoriously messy. Your normalization logic should handle double spaces, unnecessary line breaks, and page-footer artifacts.

**Please confirm you understand the Phase 1 goals**
