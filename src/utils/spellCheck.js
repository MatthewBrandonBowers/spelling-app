// Simple spell checking and dictionary utilities
const commonMisspellings = {
  'recieve': 'receive',
  'occured': 'occurred',
  'seperete': 'separate',
  'bussiness': 'business',
  'untill': 'until',
  'neccessary': 'necessary',
  'existance': 'existence',
  'wierd': 'weird',
  'their': 'there',
  'wich': 'which',
  'alot': 'a lot',
  'occassion': 'occasion',
  'definately': 'definitely',
};

export const spellCheck = {
  // Get suggestions for a misspelled word
  getSuggestions: async (word) => {
    const normalized = word.toLowerCase();
    
    // Check if we have it in common misspellings
    if (commonMisspellings[normalized]) {
      return [commonMisspellings[normalized]];
    }

    // Try to fetch from datamuse API (free, no key needed)
    try {
      const response = await fetch(`https://api.datamuse.com/sps?sp=${encodeURIComponent(word)}`);
      if (response.ok) {
        const suggestions = await response.json();
        return suggestions.map(s => s.word).slice(0, 5);
      }
    } catch (error) {
      console.log('Could not fetch suggestions from API');
    }

    return [];
  },

  // Check if a word looks misspelled (simple heuristic)
  looksLikeMisspelling: (word) => {
    // Very simple check - just see if it has odd letter patterns
    // For MVP, we trust user input mostly
    return word.length > 2;
  },
};

// Common spelling rules to show users
export const spellingRules = {
  'ie_vs_ei': {
    name: 'i before e, except after c',
    examples: ['believe', 'receive', 'achieve'],
    rule: 'Most words have "ie" (believe, friend), but after "c" use "ei" (receive, ceiling)',
  },
  'silent_letters': {
    name: 'Silent Letters',
    examples: ['knife', 'psychology', 'rhythm'],
    rule: 'Some letters are not pronounced but must be spelled',
  },
  'double_consonants': {
    name: 'Double Consonants',
    examples: ['beginning', 'occurred', 'equipped'],
    rule: 'After a short vowel in a stressed syllable, double the consonant before adding -ing or -ed',
  },
  'suffix_rules': {
    name: 'Suffix Rules',
    examples: ['changing', 'writing', 'becoming'],
    rule: 'Drop silent e before adding -ing (change → changing). Keep e for soft sounds (notice → noticing)',
  },
  'prefix_rules': {
    name: 'Prefix Rules', 
    examples: ['misspell', 'unnecessary', 'irrelevant'],
    rule: 'Prefixes like un-, re-, mis- are added directly without changing the root word',
  },
  'common_endings': {
    name: 'Common Endings',
    examples: ['definitely', 'beautiful', 'necessary'],
    rule: 'Learn common word endings: -tion, -sion, -ous, -able, -ible',
  },
};

// Get rule explanation for a word
export const getRuleForWord = (rule) => {
  return spellingRules[rule] || null;
};
