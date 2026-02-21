// ═══════════════════════════════════════════════════════
//   Advanced AI Tweet Enhancement System
//   Features: Tone control, Thread builder, Translate,
//   Emoji boost, Grammar fix, Hook generator, CTA,
//   Rewrite styles, Smart generate
// ═══════════════════════════════════════════════════════

const emojiMap = {
  happy: '😊', sad: '😢', love: '❤️', fire: '🔥', rocket: '🚀',
  money: '💰', code: '💻', build: '🏗️', learn: '📚', win: '🏆',
  idea: '💡', star: '⭐', sun: '☀️', moon: '🌙', music: '🎵',
  game: '🎮', food: '🍕', coffee: '☕', party: '🎉', work: '💪',
  blockchain: '⛓️', crypto: '🪙', ethereum: '💎', web3: '🌐',
  defi: '💎', nft: '🖼️', trading: '📈', mint: '🪙',
  smart: '🧠', contract: '📜', decentralized: '🔗', token: '🎯',
  tweet: '🐦', post: '📝', share: '📤', follow: '👥',
  new: '✨', launch: '🚀', update: '🔄', release: '🎯', announce: '📢',
  gm: '☀️', gn: '🌙', wagmi: '🚀', lfg: '🔥', based: '💯',
  amazing: '🤩', great: '👏', awesome: '🔥', cool: '😎', nice: '👍',
  think: '🤔', technology: '⚡', future: '🔮', art: '🎨', design: '✏️',
  security: '🔒', privacy: '🛡️', network: '🌍', data: '📊', speed: '⚡',
  community: '🤝', developer: '👨‍💻', innovation: '💫', growth: '📈',
  success: '🏅', goal: '🎯', team: '👥', global: '🌍', power: '💥',
};

const hashtagKeywords = {
  blockchain: ['#Blockchain', '#Web3'],
  ethereum: ['#Ethereum', '#ETH'],
  crypto: ['#Crypto', '#Web3'],
  defi: ['#DeFi', '#Crypto'],
  nft: ['#NFT', '#Web3'],
  web3: ['#Web3', '#Decentralized'],
  solidity: ['#Solidity', '#SmartContracts'],
  coding: ['#Coding', '#Developer'],
  programming: ['#Programming', '#Tech'],
  javascript: ['#JavaScript', '#WebDev'],
  react: ['#ReactJS', '#Frontend'],
  developer: ['#Developer', '#BuildInPublic'],
  building: ['#BuildInPublic', '#Web3'],
  learning: ['#Learning', '#Growth'],
  trading: ['#Trading', '#Crypto'],
  market: ['#CryptoMarket', '#Trading'],
  community: ['#Community', '#Web3'],
  technology: ['#Technology', '#Innovation'],
  ai: ['#AI', '#Tech'],
  future: ['#Future', '#Innovation'],
  design: ['#Design', '#Creative'],
  startup: ['#Startup', '#Entrepreneurship'],
  security: ['#CyberSecurity', '#InfoSec'],
  data: ['#DataScience', '#BigData'],
  machine: ['#MachineLearning', '#AI'],
  python: ['#Python', '#DataScience'],
  cloud: ['#CloudComputing', '#DevOps'],
};

// ── Utility Functions ────────────────────────

function findKeywords(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const key of Object.keys(emojiMap)) {
    if (lower.includes(key)) found.push(key);
  }
  return found;
}

function findHashtags(text) {
  const lower = text.toLowerCase();
  const tags = new Set();
  for (const [key, hashtags] of Object.entries(hashtagKeywords)) {
    if (lower.includes(key)) {
      hashtags.forEach(t => tags.add(t));
    }
  }
  if (tags.size === 0) {
    const words = text.split(/\s+/).filter(w => w.length > 4 && !w.startsWith('#') && !w.startsWith('@') && !w.startsWith('http'));
    const topWords = words.slice(0, 2);
    topWords.forEach(w => tags.add('#' + w.charAt(0).toUpperCase() + w.slice(1).replace(/[^a-zA-Z0-9]/g, '')));
  }
  return [...tags].slice(0, 4);
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sentenceCase(text) {
  return text.replace(/(^|[.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase());
}

// ── Core AI Functions ────────────────────────

export function enhanceTweet(text) {
  if (!text.trim()) return text;
  let result = text.trim();
  const keywords = findKeywords(result);

  // Smart emoji placement
  if (keywords.length > 0 && !/[\u{1F300}-\u{1FAD6}]/u.test(result)) {
    const emoji = emojiMap[keywords[0]];
    if (emoji) result = emoji + ' ' + result;
  }

  // Capitalize properly
  result = result.charAt(0).toUpperCase() + result.slice(1);

  // Add engaging ending emoji
  if (result.length < 120 && keywords.length > 1) {
    const endEmoji = emojiMap[keywords[keywords.length - 1]];
    if (endEmoji) result += ' ' + endEmoji;
  }

  // Smart hashtags
  const tags = findHashtags(text);
  if (tags.length > 0 && result.length + tags.join(' ').length + 2 <= 280) {
    result += '\n\n' + tags.join(' ');
  }

  return result.slice(0, 280);
}

export function makeProfessional(text) {
  if (!text.trim()) return text;
  let result = text.trim();

  const casualMap = {
    'lol': '', 'lmao': '', 'bruh': '', 'bro': '', 'dude': '',
    'gonna': 'going to', 'wanna': 'want to', 'gotta': 'have to',
    'kinda': 'somewhat', 'tbh': 'to be honest', 'imo': 'in my opinion',
    'ngl': 'honestly', 'fr': 'indeed', 'rn': 'currently',
    'smh': '', 'omg': '', 'af': '', 'asap': 'at the earliest',
    'btw': 'additionally', 'fyi': 'for your information',
    'idk': "I'm not certain", 'ikr': 'I agree',
    'dm': 'direct message', 'pls': 'please', 'thx': 'thank you',
    'u': 'you', 'ur': 'your', 'r': 'are', 'n': 'and',
    'w/': 'with', 'w/o': 'without', 'b/c': 'because',
  };

  for (const [casual, formal] of Object.entries(casualMap)) {
    const regex = new RegExp(`\\b${casual}\\b`, 'gi');
    result = result.replace(regex, formal);
  }

  // Remove excessive punctuation/emoji
  result = result.replace(/[!]{2,}/g, '.');
  result = result.replace(/[\u{1F300}-\u{1FAD6}]/gu, '');

  result = result.replace(/\s+/g, ' ').trim();
  result = sentenceCase(result);
  result = result.charAt(0).toUpperCase() + result.slice(1);
  if (!/[.!?]$/.test(result)) result += '.';

  // Add professional flair
  const closers = [
    '\n\nThoughts? 💭',
    '\n\nInterested in your perspective.',
    '\n\nLet\'s discuss.',
  ];
  if (result.length < 220) {
    result += pickRandom(closers);
  }

  return result.slice(0, 280);
}

export function makeCasual(text) {
  if (!text.trim()) return text;
  let result = text.trim();

  const words = result.split(' ');
  result = words.map((w, i) => i === 0 ? w : w.toLowerCase()).join(' ');
  result = result.replace(/\.$/, '');

  // Replace formal words
  const formalToCasual = {
    'however': 'but like',
    'therefore': 'so',
    'additionally': 'also',
    'furthermore': 'plus',
    'nevertheless': 'still tho',
    'regarding': 'about',
    'utilize': 'use',
    'commence': 'start',
    'terminate': 'end',
    'sufficient': 'enough',
    'approximately': 'about',
    'consequently': 'so basically',
  };

  for (const [formal, casual] of Object.entries(formalToCasual)) {
    result = result.replace(new RegExp(`\\b${formal}\\b`, 'gi'), casual);
  }

  const casualEndings = [
    'fr fr 🔥', 'ngl 😤', 'no cap 💯', 'lowkey 👀',
    'vibes ✨', 'sheesh 🫡', 'bussin 🤌', 'deadass 💀',
    'on god 🙏', 'real talk 💯', 'its giving 💅',
  ];
  result += ' ' + pickRandom(casualEndings);

  return result.slice(0, 280);
}

export function addHashtags(text) {
  if (!text.trim()) return text;
  let result = text.trim();
  const cleanText = result.replace(/#\w+/g, '').trim();
  const tags = findHashtags(cleanText);
  if (tags.length > 0 && cleanText.length + tags.join(' ').length + 2 <= 280) {
    result = cleanText + '\n\n' + tags.join(' ');
  }
  return result.slice(0, 280);
}

export function shortenText(text) {
  if (!text.trim()) return text;
  let result = text.trim();

  const fillers = [
    'very', 'really', 'actually', 'basically', 'literally', 'just',
    'simply', 'quite', 'rather', 'somewhat', 'extremely', 'definitely',
    'certainly', 'absolutely', 'particularly', 'essentially', 'virtually',
    'practically', 'evidently', 'apparently', 'seemingly', 'mostly',
  ];
  for (const filler of fillers) {
    result = result.replace(new RegExp(`\\b${filler}\\s+`, 'gi'), '');
  }

  // Remove filler phrases
  const phrases = [
    'I think that', 'I believe that', 'I feel like',
    'In my opinion,?\\s*', 'It seems like', 'At the end of the day,?\\s*',
    'As a matter of fact,?\\s*', 'The thing is,?\\s*',
    'To be honest,?\\s*', 'In order to',
    'Due to the fact that', 'For all intents and purposes,?\\s*',
  ];
  for (const phrase of phrases) {
    result = result.replace(new RegExp(phrase, 'gi'), '');
  }

  // Shorten common wordy phrases
  const wordyMap = {
    'in order to': 'to',
    'a large number of': 'many',
    'a lot of': 'many',
    'at this point in time': 'now',
    'in the event that': 'if',
    'on a daily basis': 'daily',
    'at the present time': 'now',
    'in the near future': 'soon',
    'has the ability to': 'can',
    'is able to': 'can',
    'make a decision': 'decide',
    'take into consideration': 'consider',
    'come to the conclusion': 'conclude',
  };

  for (const [wordy, short] of Object.entries(wordyMap)) {
    result = result.replace(new RegExp(wordy, 'gi'), short);
  }

  result = result.replace(/\s+/g, ' ').trim();
  result = result.charAt(0).toUpperCase() + result.slice(1);

  return result.slice(0, 280);
}

// ── NEW Advanced Features ────────────────────

export function addHook(text) {
  if (!text.trim()) return text;
  let result = text.trim();

  const hooks = [
    '🧵 Thread:',
    '💡 Here\'s a thought:',
    '🔥 Hot take:',
    '📢 Unpopular opinion:',
    '🚀 Breaking:',
    '⚡ Quick insight:',
    '🎯 Key takeaway:',
    '🤯 Mind-blowing:',
    '📊 Data point:',
    '🔮 Prediction:',
    '💎 Hidden gem:',
    '🏗️ Building update:',
  ];

  // Remove existing hook if present
  const hookPattern = /^[^\n]{0,30}:\s*/;
  if (hookPattern.test(result)) {
    result = result.replace(hookPattern, '');
  }

  const hook = pickRandom(hooks);
  result = hook + ' ' + result;
  return result.slice(0, 280);
}

export function addCTA(text) {
  if (!text.trim()) return text;
  let result = text.trim();

  // Remove any trailing punctuation
  result = result.replace(/[.!?]+$/, '');

  const ctas = [
    '\n\n👇 Drop your thoughts below!',
    '\n\n🔄 RT if you agree!',
    '\n\n💬 What\'s your take?',
    '\n\n❤️ Like if this resonates!',
    '\n\n📌 Save this for later!',
    '\n\n👀 Follow for more insights!',
    '\n\n🤝 Tag someone who needs this!',
    '\n\n⬇️ Reply with your experience!',
    '\n\n🔔 Turn on notifications!',
  ];

  const cta = pickRandom(ctas);
  if (result.length + cta.length <= 280) {
    result += cta;
  }
  return result.slice(0, 280);
}

export function fixGrammar(text) {
  if (!text.trim()) return text;
  let result = text.trim();

  // Fix common grammar issues
  const grammarFixes = [
    [/\bi\b/g, 'I'],
    [/\bi'm\b/gi, "I'm"],
    [/\bi've\b/gi, "I've"],
    [/\bi'll\b/gi, "I'll"],
    [/\bi'd\b/gi, "I'd"],
    [/\bdont\b/gi, "don't"],
    [/\bwont\b/gi, "won't"],
    [/\bcant\b/gi, "can't"],
    [/\bdidnt\b/gi, "didn't"],
    [/\bhasnt\b/gi, "hasn't"],
    [/\bhavent\b/gi, "haven't"],
    [/\bisnt\b/gi, "isn't"],
    [/\barent\b/gi, "aren't"],
    [/\bwasnt\b/gi, "wasn't"],
    [/\bwerent\b/gi, "weren't"],
    [/\bcouldnt\b/gi, "couldn't"],
    [/\bwouldnt\b/gi, "wouldn't"],
    [/\bshouldnt\b/gi, "shouldn't"],
    [/\bthats\b/gi, "that's"],
    [/\bwhats\b/gi, "what's"],
    [/\bwhos\b/gi, "who's"],
    [/\bheres\b/gi, "here's"],
    [/\btheres\b/gi, "there's"],
    [/\bits\b(?=\s+(a|the|not|very|really|so|just|been|going|like|about|an|time|been))/gi, "it's"],
    [/\byoure\b/gi, "you're"],
    [/\btheyre\b/gi, "they're"],
    [/\bwere\b(?=\s+(going|not|just|so))/gi, "we're"],
    [/\bcouldve\b/gi, "could've"],
    [/\bwouldve\b/gi, "would've"],
    [/\bshouldve\b/gi, "should've"],
    [/\balot\b/gi, "a lot"],
    [/\binfact\b/gi, "in fact"],
    [/\bnoone\b/gi, "no one"],
    [/\beverytime\b/gi, "every time"],
    [/\btho\b/gi, "though"],
    [/\bcuz\b/gi, "because"],
    [/\bcos\b/gi, "because"],
  ];

  for (const [pattern, replacement] of grammarFixes) {
    result = result.replace(pattern, replacement);
  }

  // Fix double spaces
  result = result.replace(/\s+/g, ' ');

  // Capitalize first letter of sentences
  result = sentenceCase(result);
  result = result.charAt(0).toUpperCase() + result.slice(1);

  // Add period if missing
  if (!/[.!?]$/.test(result) && !result.endsWith('🔥') && !/[\u{1F300}-\u{1FAD6}]$/u.test(result)) {
    result += '.';
  }

  return result.slice(0, 280);
}

export function emojiBoost(text) {
  if (!text.trim()) return text;
  let result = text.trim();
  const keywords = findKeywords(result);

  // Add emoji after relevant words
  const lower = result.toLowerCase();
  const usedEmojis = new Set();
  for (const key of Object.keys(emojiMap)) {
    if (lower.includes(key) && !usedEmojis.has(emojiMap[key])) {
      const regex = new RegExp(`(\\b${key}\\w*\\b)(?!\\s*[\\u{1F300}-\\u{1FAD6}])`, 'giu');
      let replaced = false;
      result = result.replace(regex, (match) => {
        if (!replaced) {
          replaced = true;
          usedEmojis.add(emojiMap[key]);
          return match + ' ' + emojiMap[key];
        }
        return match;
      });
    }
  }

  // If no emojis added, sprinkle some
  if (usedEmojis.size === 0) {
    const genericEmojis = ['✨', '🔥', '💯', '🚀', '💡', '⚡', '🎯'];
    const words = result.split(' ');
    if (words.length > 3) {
      const midIdx = Math.floor(words.length / 2);
      words.splice(midIdx, 0, pickRandom(genericEmojis));
    }
    result = words.join(' ');
    result += ' ' + pickRandom(genericEmojis);
  }

  return result.slice(0, 280);
}

export function makeThread(text) {
  if (!text.trim()) return text;
  const result = text.trim();

  // Split into sentences
  const sentences = result.split(/(?<=[.!?])\s+/).filter(s => s.trim());

  if (sentences.length <= 1) {
    // If single sentence, add thread structure
    return ('🧵 1/ ' + result + '\n\n2/ More thoughts coming soon...\n\nFollow for the full thread! 👇').slice(0, 280);
  }

  // Format as thread
  let thread = '🧵 Thread:\n\n';
  sentences.forEach((s, i) => {
    const prefix = `${i + 1}/ `;
    thread += prefix + s.trim() + '\n';
  });

  return thread.trim().slice(0, 280);
}

export function motivational(text) {
  if (!text.trim()) return text;
  let result = text.trim();

  // Add motivational framing
  const openers = [
    '💪 ', '🌟 ', '✨ ', '🔥 Remember: ', '⭐ ', '🚀 ',
  ];
  const closers = [
    '\n\nKeep pushing! 💪🔥',
    '\n\nYou got this! 🚀',
    '\n\nStay focused, stay hungry! 🎯',
    '\n\nGreat things take time! ⏳✨',
    '\n\nBelieve in the process! 🙏',
    '\n\nThe grind never stops! 💯',
  ];

  result = pickRandom(openers) + result;
  result = result.charAt(0).toUpperCase() + result.slice(1);

  if (result.length < 220) {
    result += pickRandom(closers);
  }

  return result.slice(0, 280);
}

export function storytelling(text) {
  if (!text.trim()) return text;

  const storyFrames = [
    { open: '📖 Story time:\n\n', close: '\n\n...and that changed everything. 🔮' },
    { open: '🎬 Picture this:\n\n', close: '\n\nThe rest is history. ✨' },
    { open: '💭 True story:\n\n', close: '\n\nLesson learned. 🎯' },
    { open: '⏰ Flashback:\n\n', close: '\n\nFast forward to today — totally worth it. 🚀' },
    { open: '🔑 The moment I realized:\n\n', close: '\n\nGame changer. 🔥' },
  ];

  const frame = pickRandom(storyFrames);
  let result = frame.open + text.trim();
  if (result.length + frame.close.length <= 280) {
    result += frame.close;
  }

  return result.slice(0, 280);
}

export function translateToHindi(text) {
  if (!text.trim()) return text;
  // Common English-to-Hinglish translations
  const translations = {
    'hello': 'namaste', 'hi': 'hey', 'friend': 'dost', 'friends': 'dosto',
    'good morning': 'suprabhat', 'good night': 'shubh ratri',
    'thank you': 'dhanyavaad', 'thanks': 'shukriya',
    'love': 'pyaar', 'life': 'zindagi', 'heart': 'dil',
    'world': 'duniya', 'dream': 'sapna', 'dreams': 'sapne',
    'money': 'paisa', 'work': 'kaam', 'home': 'ghar',
    'water': 'paani', 'food': 'khana', 'time': 'waqt',
    'today': 'aaj', 'tomorrow': 'kal', 'yesterday': 'kal',
    'happy': 'khush', 'sad': 'udaas', 'beautiful': 'sundar',
    'big': 'bada', 'small': 'chhota', 'new': 'naya',
    'think': 'sochna', 'know': 'jaanna', 'believe': 'vishwas',
    'people': 'log', 'everyone': 'sab log', 'future': 'bhavishya',
    'learn': 'seekhna', 'teach': 'sikhana', 'build': 'banana',
    'power': 'shakti', 'strength': 'taakat', 'truth': 'sach',
    'way': 'raasta', 'path': 'raasta', 'journey': 'safar',
    'amazing': 'kamaal', 'great': 'bahut achha', 'awesome': 'zabardast',
  };

  let result = text.trim();
  for (const [eng, hindi] of Object.entries(translations)) {
    result = result.replace(new RegExp(`\\b${eng}\\b`, 'gi'), hindi);
  }
  result += ' 🇮🇳';
  return result.slice(0, 280);
}

// ── Smart Generate (much more variety) ─────

const generateTemplates = {
  web3: [
    '🚀 Just explored {topic} and it\'s absolutely game-changing! The potential here is massive.',
    '💡 {topic} insight: We\'re still in the early innings. The infrastructure being built will power the next decade.',
    '⛓️ {topic} is not just tech — it\'s a movement. Decentralization, transparency, ownership. The future is here.',
    '🔥 Deep dive into {topic} today — the innovation is unmatched. This space moves at lightspeed.',
    '🏗️ Building with {topic} has been incredible. Developer community = next level.',
    '🧠 {topic} hot take: We\'ll see mass adoption within 2 years. Adoption curve is accelerating.',
    '💎 Why {topic} matters: open, permissionless, censorship-resistant systems for everyone.',
    '📈 {topic} metrics are looking bullish. TVL up, developers up, users up. Fundamentals don\'t lie.',
    '🔮 {topic} prediction: 2026 will be remembered as the year everything changed.',
    '🤝 The {topic} community is something special — collaboration over competition.',
  ],
  tech: [
    '⚡ {topic} is evolving faster than anyone predicted. What used to take months now takes days.',
    '💻 Hot take: {topic} will be the most in-demand skill by 2027. Start learning now.',
    '🧠 The intersection of {topic} and AI is where the magic happens.',
    '📊 {topic} stats that blew my mind today — the growth is exponential.',
    '🎯 Focus on {topic} fundamentals. Trends come and go, but strong foundations last.',
    '🔬 Exploring the cutting edge of {topic}. The possibilities are mind-blowing.',
  ],
  motivation: [
    '💪 Success in {topic} isn\'t about talent — it\'s about consistency. Show up every single day.',
    '🌟 Your {topic} journey is unique. Stop comparing, start creating.',
    '🔥 The best time to start with {topic} was yesterday. The second best time is NOW.',
    '🚀 Every expert in {topic} was once a beginner. Don\'t fear the learning curve.',
    '⭐ {topic} taught me: Fail fast, learn faster, iterate constantly.',
    '🎯 Set your {topic} goals. Write them down. Execute relentlessly.',
  ],
  general: [
    '✨ Just had the most interesting conversation about {topic}. Perspectives matter.',
    '📢 Attention {topic} enthusiasts: Something big is brewing. Stay tuned. 👀',
    '🤔 Controversial take on {topic}: We\'re all overthinking it. Simplicity wins.',
    '📝 Lessons from {topic}: 1) Start small 2) Stay consistent 3) Never stop learning',
    '🎉 Celebrating a milestone in {topic} today! Growth is a beautiful thing.',
    '💭 What if {topic} could solve problems we haven\'t even imagined yet?',
  ],
};

export function generateContent(topic) {
  if (!topic) topic = 'Web3';
  const lowerTopic = topic.toLowerCase();

  let category = 'general';
  if (/web3|blockchain|crypto|defi|nft|ethereum|solidity|smart contract/i.test(lowerTopic)) {
    category = 'web3';
  } else if (/tech|code|programming|ai|ml|data|cloud|software|dev/i.test(lowerTopic)) {
    category = 'tech';
  } else if (/motivation|inspire|success|goal|dream|hustle|grind/i.test(lowerTopic)) {
    category = 'motivation';
  }

  const templates = generateTemplates[category];
  const template = pickRandom(templates);
  return template.replace(/\{topic\}/g, topic).slice(0, 280);
}

// ── AI OPTIONS (shown in dropdown) ─────────

export const AI_OPTIONS = [
  { id: 'enhance', label: '✨ Enhance', desc: 'Make more engaging with emojis & hashtags', fn: enhanceTweet, category: 'style' },
  { id: 'professional', label: '💼 Professional', desc: 'Formal, polished business tone', fn: makeProfessional, category: 'style' },
  { id: 'casual', label: '😎 Casual', desc: 'Relaxed Gen-Z vibe', fn: makeCasual, category: 'style' },
  { id: 'motivational', label: '💪 Motivational', desc: 'Inspiring & empowering tone', fn: motivational, category: 'style' },
  { id: 'storytelling', label: '📖 Storytelling', desc: 'Narrative, story-driven format', fn: storytelling, category: 'style' },
  { id: 'grammar', label: '📝 Fix Grammar', desc: 'Correct spelling & grammar errors', fn: fixGrammar, category: 'tools' },
  { id: 'shorten', label: '📏 Shorten', desc: 'Remove filler, make concise', fn: shortenText, category: 'tools' },
  { id: 'hashtags', label: '#️⃣ Hashtags', desc: 'Add relevant trending tags', fn: addHashtags, category: 'tools' },
  { id: 'emoji', label: '🎨 Emoji Boost', desc: 'Add emojis matching your content', fn: emojiBoost, category: 'tools' },
  { id: 'hook', label: '🎣 Add Hook', desc: 'Attention-grabbing opener', fn: addHook, category: 'engage' },
  { id: 'cta', label: '📢 Add CTA', desc: 'Call-to-action for engagement', fn: addCTA, category: 'engage' },
  { id: 'thread', label: '🧵 Thread Format', desc: 'Convert to numbered thread', fn: makeThread, category: 'engage' },
  { id: 'hinglish', label: '🇮🇳 Hinglish', desc: 'Convert to Hindi-English mix', fn: translateToHindi, category: 'translate' },
];
