# PDF Audio Reader - Copilot Instructions

## Project Architecture

This is a **client-side web application** that transforms static PDFs into an interactive audio experience with a media player interface. The app operates entirely in the browser with no backend.

### Core Components

1. **Text Extraction Engine** (`Phase 1`)
   - Uses PDF.js to parse PDF blobs and extract raw text
   - Implements sanitization to remove artifacts (page numbers, headers/footers, hyphenation at line breaks)
   - Tokenizes cleaned text into sentences for playback management
   - Creates a master data structure mapping sentence indices to character lengths

2. **Playback Controller** (`Phase 2`)
   - Manages state using vanilla JavaScript (no frameworks)
   - Uses Web Speech API (`window.speechSynthesis` and `SpeechSynthesisUtterance`)
   - Implements sentence-based queue system since Speech API is "fire and forget"
   - Chains sentences by incrementing `currentIndex` on completion

3. **UI/Progress System** (`Phase 3`)
   - Tailwind CSS with "Dark Mode" movie-player aesthetic
   - Progress bar calculated as `(currentIndex / totalSentences) * 100`
   - Real-time text highlighting synchronized with audio playback
   - Time-remaining estimation based on speech rate

### Tech Stack

- **PDF.js**: PDF parsing and text extraction
- **Web Speech API**: `window.speechSynthesis` for audio playback
- **Tailwind CSS**: Styling framework
- **Vanilla JavaScript**: State management and playback queue

## Key Conventions

### Text Processing Pipeline

PDFs extract text in visual position chunks, not logical flow. The normalization logic must:

- Remove double spaces and unnecessary line breaks
- Handle hyphenated words at line breaks (rejoin them)
- Filter page footers and headers
- Use regex-based sanitization before tokenization

### State Management Pattern

Since Web Speech API doesn't provide `currentTime` like media elements, the app simulates it:

- Maintain `currentIndex` for the active sentence
- Use `onboundary` event for word-level progress tracking within sentences
- Calculate progress manually: current sentence position vs. total sentences

### Sentence Array as "Time Code"

The sentence array serves as the fundamental unit for:

- Progress calculation
- Time estimation
- Text highlighting
- Skip/seek functionality

Break text into sentences (not paragraphs or pages) for optimal Speech API performance and granular control.

## Development Phases

### Phase 1: Text Extraction & Normalization

Focus: PDF processing and sentence tokenization. Output should be a clean sentence array logged to console.

### Phase 2: Playback Controller

Focus: Speech API integration with Play, Pause, Stop, and Skip controls. Implement sentence chaining logic.

### Phase 3: Cinematic HUD

Focus: Progress bar, time remaining, and synchronized text highlighting.

## Implementation Notes

### PDF.js Integration

- Initialize PDF.js to loop through pages
- Extract text chunks per page
- Concatenate and normalize before tokenization

### Speech API Quirks

- "Fire and forget" nature requires manual state tracking
- Use `onboundary` for granular word tracking (optional enhancement)
- Handle interruption/pause by tracking current utterance state

### Progress Bar Formula

```javascript
progressPercentage = (currentIndex / totalSentences) * 100;
```

### Time Estimation

Calculate based on average characters per second at current speech rate.
