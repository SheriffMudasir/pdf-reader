// Initialize PDF.js worker - Ensure it's loaded before use
if (typeof pdfjsLib === 'undefined') {
    alert('PDF.js library failed to load. Please check your internet connection and reload the page.');
    throw new Error('PDF.js not loaded');
}

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Voice Management
class VoiceManager {
    constructor() {
        this.voices = [];
        this.selectedVoice = null;
        this.voiceSelect = document.getElementById('voiceSelect');
        this.init();
    }
    
    init() {
        // Load voices
        this.loadVoices();
        
        // Voices are loaded asynchronously, listen for the event
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
        
        // Handle voice selection
        this.voiceSelect.addEventListener('change', (e) => {
            const voiceName = e.target.value;
            this.selectedVoice = this.voices.find(v => v.name === voiceName);
            localStorage.setItem('selectedVoice', voiceName);
        });
    }
    
    loadVoices() {
        this.voices = speechSynthesis.getVoices();
        
        if (this.voices.length === 0) return;
        
        // Clear and populate select
        this.voiceSelect.innerHTML = '';
        
        // Group voices by language for better organization
        const voicesByLang = {};
        this.voices.forEach(voice => {
            const lang = voice.lang.split('-')[0]; // Get primary language code
            if (!voicesByLang[lang]) {
                voicesByLang[lang] = [];
            }
            voicesByLang[lang].push(voice);
        });
        
        // Add voices organized by language
        Object.keys(voicesByLang).sort().forEach(lang => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = `${lang.toUpperCase()} Voices`;
            
            voicesByLang[lang].forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} ${voice.localService ? '(Local)' : '(Online)'}`;
                optgroup.appendChild(option);
            });
            
            this.voiceSelect.appendChild(optgroup);
        });
        
        // Restore saved voice or select first English voice as default
        const savedVoiceName = localStorage.getItem('selectedVoice');
        if (savedVoiceName) {
            this.voiceSelect.value = savedVoiceName;
            this.selectedVoice = this.voices.find(v => v.name === savedVoiceName);
        } else {
            // Find first English voice
            const englishVoice = this.voices.find(v => v.lang.startsWith('en'));
            if (englishVoice) {
                this.voiceSelect.value = englishVoice.name;
                this.selectedVoice = englishVoice;
            } else {
                this.selectedVoice = this.voices[0];
                this.voiceSelect.value = this.voices[0].name;
            }
        }
    }
    
    getSelectedVoice() {
        return this.selectedVoice;
    }
}

// Theme Management
const themeToggle = document.getElementById('themeToggle');
const darkIcon = document.getElementById('darkIcon');
const lightIcon = document.getElementById('lightIcon');
const body = document.body;

// Load saved theme or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
    body.classList.add('light-theme');
    body.classList.remove('bg-gray-900');
    body.classList.add('bg-white');
    darkIcon.classList.add('hidden');
    lightIcon.classList.remove('hidden');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    
    if (body.classList.contains('light-theme')) {
        body.classList.remove('bg-gray-900');
        body.classList.add('bg-white');
        darkIcon.classList.add('hidden');
        lightIcon.classList.remove('hidden');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('bg-gray-900');
        body.classList.remove('bg-white');
        darkIcon.classList.remove('hidden');
        lightIcon.classList.add('hidden');
        localStorage.setItem('theme', 'dark');
    }
});

// Phase 1: Text Extraction Engine
class PDFTextExtractor {
    constructor() {
        this.sentences = [];
        this.masterData = [];
    }

    async extractText(pdfFile) {
        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            let rawText = '';
            
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                rawText += pageText + '\n';
            }
            
            return rawText;
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
            throw new Error(`Failed to extract text: ${error.message}`);
        }
    }

    sanitizeText(rawText) {
        let cleaned = rawText;
        cleaned = cleaned.replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2');
        cleaned = cleaned.replace(/^\s*\d+\s*$/gm, '');
        cleaned = cleaned.replace(/  +/g, ' ');
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
        cleaned = cleaned.replace(/^[ \t]+|[ \t]+$/gm, '');
        cleaned = cleaned.replace(/^(Chapter \d+|Page \d+|©.*|All rights reserved.*)$/gim, '');
        cleaned = cleaned.trim();
        
        return cleaned;
    }

    tokenizeSentences(text) {
        const sentenceRegex = /([.!?])\s+(?=[A-Z])|([.!?])$/g;
        let sentences = text.split(sentenceRegex).filter(s => s && s.trim() && s.length > 2);
        sentences = sentences.filter(s => /[a-zA-Z0-9]/.test(s)).map(s => s.trim());
        
        const mergedSentences = [];
        let buffer = '';
        
        for (let sentence of sentences) {
            if (sentence.length < 10 && !/[.!?]$/.test(sentence) && buffer.length > 0) {
                buffer += ' ' + sentence;
            } else if (buffer.length > 0) {
                mergedSentences.push(buffer + ' ' + sentence);
                buffer = '';
            } else if (/[.!?]$/.test(sentence)) {
                mergedSentences.push(sentence);
            } else {
                buffer = sentence;
            }
        }
        
        if (buffer.length > 0) {
            mergedSentences.push(buffer);
        }
        
        this.sentences = mergedSentences;
        return this.sentences;
    }

    createMasterData() {
        this.masterData = this.sentences.map((sentence, index) => ({
            index: index,
            text: sentence,
            charLength: sentence.length,
            wordCount: sentence.split(/\s+/).length
        }));
        
        return this.masterData;
    }

    async process(pdfFile) {
        try {
            const rawText = await this.extractText(pdfFile);
            
            if (!rawText || rawText.trim().length === 0) {
                throw new Error('PDF appears to be empty or contains no extractable text');
            }
            
            const cleanedText = this.sanitizeText(rawText);
            const sentences = this.tokenizeSentences(cleanedText);
            
            if (sentences.length === 0) {
                throw new Error('Could not extract any sentences from the PDF');
            }
            
            const masterData = this.createMasterData();
            
            return { sentences, masterData };
        } catch (error) {
            console.error('PDF Processing Error:', error);
            throw error;
        }
    }
}

// Phase 2 & 3: Playback Controller with HUD
class PlaybackController {
    constructor(voiceManager) {
        this.voiceManager = voiceManager;
        this.sentences = [];
        this.masterData = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentUtterance = null;
        this.startTime = null;
        this.totalChars = 0;
        this.charsPerSecond = 15; // Average reading speed (will be calibrated)
        
        // UI Elements
        this.playBtn = document.getElementById('playBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.skipBtn = document.getElementById('skipBtn');
        this.statusEl = document.getElementById('status');
        this.counterEl = document.getElementById('sentenceCounter');
        this.playbackSection = document.getElementById('playbackSection');
        
        // Phase 3: HUD Elements
        this.progressBar = document.getElementById('progressBar');
        this.timeRemainingEl = document.getElementById('timeRemaining');
        this.textView = document.getElementById('textView');
        
        this.setupEventListeners();
    }
    
    /**
     * Initialize the playback controller with sentences
     */
    initialize(sentences, masterData) {
        this.sentences = sentences;
        this.masterData = masterData;
        this.currentIndex = 0;
        this.totalChars = masterData.reduce((sum, item) => sum + item.charLength, 0);
        
        this.renderTextView();
        this.updateUI();
        this.playbackSection.classList.remove('hidden');
    }
    
    renderTextView() {
        this.textView.innerHTML = '';
        
        this.sentences.forEach((sentence, sentenceIndex) => {
            const sentenceEl = document.createElement('p');
            sentenceEl.id = `sentence-${sentenceIndex}`;
            sentenceEl.className = 'sentence p-3 rounded-xl transition-all duration-200 cursor-pointer hover:bg-gray-700';
            
            const words = sentence.split(' ');
            let charPosition = 0;
            
            words.forEach((word, wordIndex) => {
                if (word.length > 0) {
                    const wordSpan = document.createElement('span');
                    wordSpan.id = `word-${sentenceIndex}-${wordIndex}`;
                    wordSpan.className = 'word transition-all duration-100 inline-block';
                    wordSpan.textContent = word;
                    wordSpan.dataset.charStart = charPosition;
                    wordSpan.dataset.charEnd = charPosition + word.length;
                    sentenceEl.appendChild(wordSpan);
                    
                    charPosition += word.length;
                }
                
                if (wordIndex < words.length - 1) {
                    sentenceEl.appendChild(document.createTextNode(' '));
                    charPosition += 1;
                }
            });
            
            sentenceEl.addEventListener('click', () => {
                if (!this.isPlaying && !this.isPaused) {
                    this.currentIndex = sentenceIndex;
                    this.updateUI();
                    this.updateHighlight();
                }
            });
            
            this.textView.appendChild(sentenceEl);
        });
    }
    
    updateWordHighlight(charIndex) {
        const sentenceEl = document.getElementById(`sentence-${this.currentIndex}`);
        if (!sentenceEl) return;
        
        sentenceEl.querySelectorAll('.word').forEach(wordEl => {
            wordEl.classList.remove('bg-yellow-400', 'text-gray-900', 'px-1', 'rounded', 'font-bold', 'scale-110');
        });
        
        const words = sentenceEl.querySelectorAll('.word');
        for (let wordEl of words) {
            const start = parseInt(wordEl.dataset.charStart);
            const end = parseInt(wordEl.dataset.charEnd);
            
            if (charIndex >= start && charIndex < end) {
                wordEl.classList.add('bg-yellow-400', 'text-gray-900', 'px-1', 'rounded', 'font-bold', 'scale-110');
                break;
            }
        }
    }
    
    updateHighlight() {
        document.querySelectorAll('.sentence').forEach(el => {
            el.classList.remove('bg-gray-800', 'border-l-4', 'border-blue-500', 'pl-4');
            el.querySelectorAll('.word').forEach(wordEl => {
                wordEl.classList.remove('bg-yellow-400', 'text-gray-900', 'px-1', 'rounded', 'font-bold', 'scale-110');
            });
        });
        
        const currentEl = document.getElementById(`sentence-${this.currentIndex}`);
        if (currentEl) {
            currentEl.classList.add('bg-gray-800', 'border-l-4', 'border-blue-500', 'pl-4');
            currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    updateTimeRemaining() {
        if (this.sentences.length === 0) {
            this.timeRemainingEl.textContent = '--:--';
            return;
        }
        
        let remainingChars = 0;
        for (let i = this.currentIndex; i < this.masterData.length; i++) {
            remainingChars += this.masterData[i].charLength;
        }
        
        const remainingSeconds = Math.ceil(remainingChars / this.charsPerSecond);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        this.timeRemainingEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateProgressBar() {
        const progress = (this.currentIndex / this.sentences.length) * 100;
        this.progressBar.style.width = `${progress}%`;
    }
    
    calibrateSpeed(sentence, duration) {
        const charsInSentence = sentence.length;
        const measuredSpeed = charsInSentence / duration;
        this.charsPerSecond = this.charsPerSecond * 0.7 + measuredSpeed * 0.3;
    }
    
    /**
     * Setup button event listeners
     */
    setupEventListeners() {
        this.playBtn.addEventListener('click', () => this.play());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.skipBtn.addEventListener('click', () => this.skip());
    }
    
    play() {
        if (this.sentences.length === 0) return;
        
        if (this.isPaused) {
            window.speechSynthesis.resume();
            this.isPaused = false;
            this.isPlaying = true;
            this.updateButtonStates();
            this.updateStatus('Playing');
        } else {
            this.isPlaying = true;
            this.isPaused = false;
            this.startTime = Date.now();
            this.updateButtonStates();
            this.speakSentence(this.currentIndex);
        }
    }
    
    pause() {
        if (this.isPlaying && !this.isPaused) {
            window.speechSynthesis.pause();
            this.isPaused = true;
            this.isPlaying = false;
            this.updateButtonStates();
            this.updateStatus('Paused');
        }
    }
    
    stop() {
        window.speechSynthesis.cancel();
        this.isPlaying = false;
        this.isPaused = false;
        this.currentIndex = 0;
        this.currentUtterance = null;
        this.updateButtonStates();
        this.updateUI();
        this.updateStatus('Stopped');
    }
    
    skip() {
        if (this.isPlaying || this.isPaused) {
            window.speechSynthesis.cancel();
            this.currentIndex++;
            
            if (this.currentIndex >= this.sentences.length) {
                this.stop();
            } else {
                this.isPaused = false;
                this.isPlaying = true;
                this.speakSentence(this.currentIndex);
            }
        }
    }
    
    speakSentence(index) {
        if (index >= this.sentences.length) {
            this.stop();
            return;
        }
        
        const sentence = this.sentences[index];
        const sentenceStartTime = Date.now();
        this.currentIndex = index;
        this.updateUI();
        
        const utterance = new SpeechSynthesisUtterance(sentence);
        this.currentUtterance = utterance;
        
        // Apply selected voice
        const selectedVoice = this.voiceManager.getSelectedVoice();
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onend = () => {
            const duration = (Date.now() - sentenceStartTime) / 1000;
            this.calibrateSpeed(sentence, duration);
            
            if (this.isPlaying && !this.isPaused) {
                this.currentIndex++;
                if (this.currentIndex < this.sentences.length) {
                    this.speakSentence(this.currentIndex);
                } else {
                    this.stop();
                }
            }
        };
        
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                this.updateWordHighlight(event.charIndex);
                this.updateTimeRemaining();
            }
        };
        
        utterance.onerror = (event) => {
            this.stop();
        };
        
        window.speechSynthesis.speak(utterance);
        this.updateStatus('Playing');
    }
    
    updateUI() {
        this.counterEl.textContent = `${this.currentIndex + 1} / ${this.sentences.length}`;
        this.updateProgressBar();
        this.updateTimeRemaining();
        this.updateHighlight();
    }
    
    updateButtonStates() {
        this.playBtn.disabled = this.isPlaying && !this.isPaused;
        this.pauseBtn.disabled = !this.isPlaying || this.isPaused;
        this.stopBtn.disabled = !this.isPlaying && !this.isPaused;
        this.skipBtn.disabled = !this.isPlaying && !this.isPaused;
    }
    
    updateStatus(status) {
        this.statusEl.textContent = status;
        
        if (status === 'Playing') {
            this.statusEl.className = 'text-2xl font-bold text-green-400';
        } else if (status === 'Paused') {
            this.statusEl.className = 'text-2xl font-bold text-yellow-400';
        } else if (status === 'Stopped') {
            this.statusEl.className = 'text-2xl font-bold text-red-400';
        } else {
            this.statusEl.className = 'text-2xl font-bold text-blue-400';
        }
    }
}

// Initialize controllers
const voiceManager = new VoiceManager();
const extractor = new PDFTextExtractor();
const playbackController = new PlaybackController(voiceManager);

// File upload handler with error handling and loading state
document.getElementById('pdfInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    
    if (!file || file.type !== 'application/pdf') {
        alert('Please select a valid PDF file');
        return;
    }
    
    // Show loading state
    const pdfInput = document.getElementById('pdfInput');
    const playbackSection = document.getElementById('playbackSection');
    pdfInput.disabled = true;
    
    // Create loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingIndicator';
    loadingDiv.className = 'fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50';
    loadingDiv.innerHTML = `
        <div class="bg-gray-800 rounded-2xl p-8 text-center shadow-2xl">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p class="text-white text-xl font-semibold">Processing PDF...</p>
            <p class="text-gray-400 text-sm mt-2">Extracting and analyzing text</p>
        </div>
    `;
    document.body.appendChild(loadingDiv);
    
    try {
        // Process the PDF
        const result = await extractor.process(file);
        
        // Remove loading indicator
        loadingDiv.remove();
        
        // Check if we got valid results
        if (!result.sentences || result.sentences.length === 0) {
            throw new Error('No text could be extracted from this PDF. It may be a scanned image or empty.');
        }
        
        // Initialize playback controller
        playbackController.initialize(result.sentences, result.masterData);
        
        // Re-enable input
        pdfInput.disabled = false;
        
        // Show success message briefly
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
        successDiv.textContent = `✓ Successfully loaded ${result.sentences.length} sentences`;
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
        
    } catch (error) {
        // Remove loading indicator
        loadingDiv.remove();
        
        // Re-enable input
        pdfInput.disabled = false;
        
        // Show error message
        console.error('PDF Processing Error:', error);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
        errorDiv.innerHTML = `
            <div class="font-bold mb-1">Error Processing PDF</div>
            <div class="text-sm">${error.message || 'An unexpected error occurred. Please try another PDF file.'}</div>
            <div class="text-xs mt-2 opacity-75">Check browser console for details</div>
        `;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
});
