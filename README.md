# Spelling Master 📝

A personalized spelling improvement app that helps you learn from your own misspelled words. Add words you commonly misspell, take daily audio-based spelling tests, and track your progress with detailed statistics.

## Features ✨

- **Add Misspelled Words**: Input words you commonly misspell with automatic spell-checking suggestions
- **Categorize by Rule**: Organize words by spelling rules (silent letters, double consonants, ie/ei, suffixes, etc.)
- **Audio-Based Tests**: Daily spelling tests where words are spoken out loud
- **Progressive Hints**: Three levels of hints before revealing the answer
- **Detailed Statistics**: Track accuracy, category breakdown, and words to focus on
- **Local Storage**: All data stored locally in your browser - no account needed
- **Zero Dependencies**: Lightweight, uses Web Speech API for audio

## Getting Started 🚀

### Prerequisites
- Node.js 14+ and npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd spelling-app

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## How to Use 📖

### 1. Add Words
- Go to "Add Words" tab
- Type a misspelled word
- Get automatic spell-checking suggestions
- Select or type the correct spelling
- Choose a category and spelling rule (optional)
- Click "Add Word"

### 2. Take a Test
- Go to "Daily Test" tab
- The app speaks each word
- Type your spelling attempt
- Get instant feedback:
  - 1st attempt: Try again
  - 2nd attempt: Hint available
  - 3rd attempt: Show answer
- Your results are recorded

### 3. View Your Words
- Filter by category or sort by accuracy
- See personal statistics for each word
- Delete words if needed

### 4. Check Statistics
- Overall accuracy percentage
- Accuracy by category
- Words needing focus
- Mastered vs. challenging words
- Personalized insights

## Tech Stack 🛠️

- **React 18** - UI framework
- **Vite** - Fast build tool
- **Web Speech API** - Audio pronunciation
- **localStorage** - Data persistence

## Project Structure 📁

```
src/
├── components/
│   ├── WordInput.jsx      # Add new words
│   ├── WordList.jsx       # View and manage words
│   ├── DailyTest.jsx      # Take spelling tests
│   ├── Stats.jsx          # View statistics
│   └── *.css              # Component styling
├── utils/
│   ├── storage.js         # localStorage management
│   └── spellCheck.js      # Spell checking utilities
├── App.jsx                # Main app component
├── App.css                # Global styles
└── main.jsx               # Entry point
```

## Features Roadmap 🗺️

- [ ] Cloud sync with Firebase/Supabase
- [ ] User accounts and authentication
- [ ] Share word lists with others
- [ ] Mobile app version
- [ ] More advanced spell checker
- [ ] Custom pronunciation guidance
- [ ] Leaderboards and achievements

## Browser Support 🌐

- Chrome/Edge 60+
- Firefox 55+
- Safari 14+
- Opera 47+

(Required for Web Speech API support)

## Tips for Better Learning 💡

1. **Daily Tests**: Take tests regularly to build muscle memory
2. **Focus on Categories**: Master one spelling rule at a time
3. **Review Stats**: Pay attention to your "Words to Focus On"
4. **Add Related Words**: If you misspell one word, add similar words to learn the pattern
5. **Track Progress**: Check your accuracy improvements over time

## License 📄

MIT License - Feel free to use and modify

## Contributing 🤝

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## Support 💬

Have questions or feedback? Feel free to open an issue!

---

**Happy Learning!** 🎯
