# 📖 PDF Audio Reader

Transform your static PDFs into an interactive audio experience with a sleek, cinematic media player interface.

![PDF Audio Reader](https://img.shields.io/badge/Status-Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen)

## ✨ Features

### 🎯 Core Functionality
- **PDF Text Extraction** - Intelligent parsing with PDF.js to extract clean, readable text
- **Text-to-Speech** - Natural voice synthesis using Web Speech API
- **Smart Text Processing** - Removes page numbers, headers, footers, and fixes hyphenation
- **Sentence Tokenization** - Breaks text into optimal chunks for smooth playback

### 🎬 Media Player Experience
- **Playback Controls** - Play, Pause, Stop, and Skip sentence navigation
- **Real-Time Progress Bar** - Visual progress indicator with gradient styling
- **Time Estimation** - Calculates and displays remaining reading time (MM:SS)
- **Word-Level Highlighting** - Karaoke-style highlighting synchronized with speech
- **Interactive Text View** - Click any sentence to jump to that position

### 🎤 Voice Customization
- **Multiple Voice Support** - Choose from all available system/browser voices
- **Language Groups** - Voices organized by language for easy selection
- **Local/Online Indicators** - Shows which voices are stored locally vs cloud-based
- **Persistent Selection** - Your voice preference is saved across sessions

### 🎨 Modern UI/UX
- **Light/Dark Theme Toggle** - Seamless theme switching with localStorage persistence
- **Responsive Design** - Works beautifully on desktop, tablet, and mobile
- **Gradient Accents** - Beautiful color gradients throughout the interface
- **Smooth Animations** - Polished transitions and hover effects
- **Custom Scrollbar** - Styled scrollbar for better aesthetics

## 🚀 Technologies Used

- **PDF.js** - Mozilla's PDF parsing library
- **Web Speech API** - Native browser text-to-speech
- **Tailwind CSS** - Utility-first CSS framework (via CDN)
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **HTML5** - Modern semantic markup

## 📦 Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pdf-reader
   ```

2. **Open in browser**
   Simply open `index.html` in your web browser. No build process required!
   
   Or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   ```

3. **Visit**
   ```
   http://localhost:8000
   ```

## 🌐 Deployment on Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

### Manual Deployment

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow the prompts**
   - Set up and deploy: Yes
   - Which scope: Select your account
   - Link to existing project: No
   - Project name: pdf-audio-reader (or your choice)
   - In which directory is your code located: ./
   - Override settings: No

4. **Production deployment**
   ```bash
   vercel --prod
   ```

### Deploy via GitHub Integration

1. Push your code to GitHub
2. Visit [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect settings (no configuration needed for static sites)
6. Click "Deploy"

Your site will be live at: `https://your-project-name.vercel.app`

### ⚠️ Important: Cross-Origin-Embedder-Policy Challenge

**Issue:** If you encounter issues where the app works locally but fails on Vercel after uploading a PDF, it's likely related to the `Cross-Origin-Embedder-Policy: require-corp` header.

**Symptoms:**
- PDF uploads but processing stops
- Console shows CORS errors for CDN resources
- Tailwind CSS or PDF.js fails to load

**Solution:**
Remove or modify the restrictive CORS headers in `vercel.json`. The default configuration in this repository has been optimized to work with CDN resources:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
        // Note: Cross-Origin-Embedder-Policy: require-corp is NOT included
        // as it blocks CDN resources without matching CORP headers
      ]
    }
  ]
}
```

**Why this happens:**
- The `Cross-Origin-Embedder-Policy: require-corp` header requires all cross-origin resources to explicitly opt-in
- CDN resources (Tailwind CSS, PDF.js) from `cdnjs.cloudflare.com` and `cdn.tailwindcss.com` don't always send matching `Cross-Origin-Resource-Policy` headers
- This causes the browser to block these resources, breaking the app

**Best Practice:**
- For static sites using public CDNs, avoid `Cross-Origin-Embedder-Policy: require-corp`
- Only use this header if you need SharedArrayBuffer or other features requiring cross-origin isolation
- Alternative: Self-host all dependencies if strict COEP is required

## 📖 Usage

### Basic Workflow

1. **Upload PDF**
   - Click "Upload PDF" and select your PDF file
   - The app will extract and process the text

2. **Select Voice** (Optional)
   - Choose your preferred voice from the dropdown
   - Voices are grouped by language
   - Your selection is saved automatically

3. **Start Playback**
   - Click the **Play** button to start reading
   - Watch the word-level highlighting follow along
   - Monitor progress and time remaining

4. **Playback Controls**
   - **Pause** - Temporarily pause reading
   - **Stop** - Stop and reset to beginning
   - **Skip** - Jump to next sentence
   - **Click Sentence** - Jump to any sentence when stopped

5. **Toggle Theme**
   - Click the sun/moon icon to switch between light and dark modes

## 🔧 Project Structure

```
pdf-reader/
├── index.html              # Main HTML file
├── pdf-processor.js        # Core application logic
├── copilot-instructions.md # AI assistant guidelines
├── instruction.md          # Original project specification
└── README.md              # This file
```

## 🌟 Key Components

### PDFTextExtractor
Handles PDF parsing, text sanitization, and sentence tokenization.

### PlaybackController
Manages speech synthesis, playback state, and UI updates.

### VoiceManager
Loads, organizes, and manages available speech synthesis voices.

## 🎯 Browser Compatibility

### Fully Supported
- ✅ Chrome/Edge (90+)
- ✅ Firefox (89+)
- ✅ Safari (14.1+)
- ✅ Opera (76+)

### Requirements
- Modern browser with Web Speech API support
- JavaScript enabled
- PDF.js compatible browser

### Voice Availability
Voice selection depends on your operating system and browser:
- **Windows**: Microsoft voices (David, Zira, etc.)
- **macOS**: Apple voices (Alex, Samantha, etc.)
- **Linux**: eSpeak voices
- **Chrome**: Google voices (may require internet)

## 🐛 Known Limitations

- **Speech API Quirks**: Some browsers may have limited voice options
- **PDF Complexity**: Very complex PDFs (scanned images, forms) may not extract well
- **Text Artifacts**: Some PDFs may contain formatting artifacts
- **Pause/Resume**: Browser implementation varies; some may restart sentence
- **Cross-Origin Headers**: Avoid strict COEP policies when using public CDNs (see Deployment section)

## 🛠️ Future Enhancements

- [ ] Speed/pitch/volume controls
- [ ] Bookmark/save position
- [ ] Export to audio file
- [ ] Support for multiple file formats (EPUB, DOCX)
- [ ] Chapter/section navigation
- [ ] Reading statistics dashboard

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👨‍💻 Development

This project follows a three-phase architecture:

- **Phase 1**: Text extraction and normalization
- **Phase 2**: Playback controller and state management
- **Phase 3**: Cinematic HUD with progress tracking

See `copilot-instructions.md` for detailed architecture documentation.

## 🙏 Acknowledgments

- [PDF.js](https://mozilla.github.io/pdf.js/) - Mozilla's PDF parsing library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) - Browser text-to-speech

## 📧 Support

For support, please open an issue in the GitHub repository.

---

Made with ❤️ for accessible reading
