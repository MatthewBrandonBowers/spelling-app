# SpellMaster - AI-Powered Spelling Improvement App

An intelligent spelling practice app that helps you master difficult words through personalized learning, progressive hints, and AI-powered insights.

## Features

- 📝 **Word Management**: Add your commonly misspelled words with AI categorization
- 🎯 **Smart Practice Tests**: Focus on words you struggle with
- 💡 **Progressive Hints**: Get help when you need it (try again → hint → partial reveal → answer)
- 📊 **Detailed Statistics**: Track your progress and success rate
- 🔊 **Audio Pronunciation**: Hear each word spoken aloud
- 🧠 **AI Insights**: Learn spelling rules, mnemonics, and similar words

## Deployment Options

### Option 1: Deploy to Vercel (Recommended - Free & Easy)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd spelling-app-deploy
   vercel
   ```

4. Follow the prompts (press Enter to accept defaults)
5. Your app will be live at a URL like: `https://spellmaster-xyz.vercel.app`

**OR use Vercel's Web Interface:**
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import from Git (or upload the folder)
4. Deploy automatically!

### Option 2: Deploy to Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy**:
   ```bash
   cd spelling-app-deploy
   npm install
   npm run build
   netlify deploy --prod
   ```

3. Follow the prompts and your site will be live!

**OR use Netlify's Web Interface:**
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `build` folder after running `npm run build`
3. Done!

### Option 3: Local Development

1. **Install dependencies**:
   ```bash
   cd spelling-app-deploy
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. **Add Words**: Click "Add Word" to input words you commonly misspell
   - The app will suggest correct spellings
   - AI will generate learning insights automatically

2. **Practice**: Click "Practice" to start a spelling test
   - Words are selected intelligently (focusing on your weak spots)
   - Audio pronunciation for each word
   - Progressive hints if you get stuck

3. **Track Progress**: View your statistics to see improvement over time
   - Success rate
   - Mastered words
   - Words that need more focus

## Data Storage

Currently uses browser localStorage:
- ✅ Works offline
- ✅ No account needed
- ✅ Private and secure
- ⚠️ Data is device-specific (clear cache = lose data)

### Future: Cloud Sync (Coming Soon)
We can add Firebase/Supabase integration for:
- Cross-device sync
- Account management
- Backup and restore
- Share word lists

## Technical Stack

- **Frontend**: React 18
- **UI Icons**: Lucide React
- **AI**: Anthropic Claude API (for spelling insights)
- **Speech**: Web Speech API (browser built-in)
- **Storage**: localStorage (local) → Firebase/Supabase (future)

## Browser Support

Works on all modern browsers:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS & Android)

## Contributing

Want to improve SpellMaster? Here are some ideas:
- Additional language support
- Export/import word lists
- Spaced repetition algorithm
- Gamification (streaks, achievements)
- Premium TTS voices

## License

Personal use - built with Claude AI assistance
