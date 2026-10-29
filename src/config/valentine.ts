/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  💘  PERSONALIZE EVERYTHING HERE
 * ─────────────────────────────────────────────────────────────────────────────
 *  This is the only file you need to edit to make the experience your own.
 *
 *  Text tokens
 *  - `{recipient}`        → replaced by `recipientName`
 *  - `{sender}`           → replaced by `senderName`
 *  - `{recipient|you}`    → uses the name if set, otherwise the fallback ("you")
 *  - `*words*`            → rendered with the romantic italic highlight
 *
 *  A line that ends up empty after replacement (for example a signature line
 *  that only contains `{sender}` while `senderName` is blank) is hidden
 *  automatically, so the recipient never sees awkward placeholder text.
 *
 *  Photos: put files in `public/images/` and list them in `gallery.images`
 *  (e.g. `src: 'images/first-date.jpg'`). See README.md for details.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface GalleryImage {
  /** Path relative to the `public` folder, e.g. `images/us.jpg`. */
  src: string;
  /** Describe the photo for screen readers. */
  alt: string;
  caption?: string;
}

export interface MiniGameHeart {
  label: string;
  title: string;
  message: string;
}

export interface QuizOption {
  emoji: string;
  label: string;
  /** The little pop-up reaction shown when this answer is picked. */
  reaction: string;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

export interface Coupon {
  emoji: string;
  title: string;
  detail: string;
}

export interface ThemeColors {
  midnightPlum: string;
  burgundy: string;
  crimson: string;
  bubblegum: string;
  blush: string;
  ivory: string;
  lavender: string;
  gold: string;
}

export interface ValentineConfig {
  recipientName: string;
  senderName: string;
  pageTitle: string;

  features: {
    /** Cinematic intro → envelope → love letter before the question. */
    intro: boolean;
    /** The six-question love quiz + compatibility meter before the big question. */
    quiz: boolean;
    /** "Before you answer... one tiny challenge" section under the question. */
    miniGame: boolean;
    /** "A Little Gallery of Us" section in the finale. */
    gallery: boolean;
    /** Optional synthesized soundtrack + sound effects (always off until the visitor opts in). */
    audio: boolean;
    /** Soft cursor glow + occasional sparkle trail on desktop. */
    cursorEffects: boolean;
  };

  intro: {
    teaser: string;
    envelopePrompt: string;
    envelopeHint: string;
    envelopeLabel: string;
    letter: {
      greeting: string;
      paragraphs: string[];
      cta: string;
    };
  };

  question: {
    eyebrow: string;
    headlineLines: [string, string];
    question: string;
    supporting: string;
    yesLabel: string;
    challengeCue: string;
  };

  noButton: {
    /** Rotated (never all at once) every time the NO button escapes. */
    messages: string[];
    /** The NO button's label cycles through these as it keeps running away. */
    labels: string[];
  };

  quiz: {
    eyebrow: string;
    title: string;
    intro: string;
    startLabel: string;
    skipLabel: string;
    questions: QuizQuestion[];
    meter: {
      title: string;
      overloadTitle: string;
      finalTitle: string;
      message: string;
      continueLabel: string;
    };
  };

  promise: {
    eyebrow: string;
    title: string;
    hint: string;
    holdLabel: string;
    sealedTitle: string;
    sealedMessage: string;
  };

  coupons: {
    title: string;
    subtitle: string;
    items: Coupon[];
  };

  miniGame: {
    title: string;
    subtitle: string;
    hearts: [MiniGameHeart, MiniGameHeart, MiniGameHeart];
    completeMessage: string;
  };

  celebration: {
    moment: string;
    headline: string;
    subheading: string;
    status: string;
  };

  finalLetter: {
    greeting: string;
    paragraphs: string[];
    /** Optional extra relationship-specific lines, shown after the paragraphs. */
    relationshipMessages: string[];
    signOff: string;
    signature: string;
  };

  surprise: {
    label: string;
    message: string;
  };

  /** Optional closing line shown at the very bottom of the finale. */
  endingMessage: string;

  gallery: {
    title: string;
    subtitle: string;
    /** Subtitle used while the gallery shows illustrations instead of photos. */
    illustrationSubtitle: string;
    /** When there are no photos: show original illustrations (true) or hide the section (false). */
    showIllustrationsWhenEmpty: boolean;
    images: GalleryImage[];
  };

  theme: ThemeColors;
}

export const valentineConfig: ValentineConfig = {
  // Leave blank to keep everything name-free and natural.
  recipientName: '',
  senderName: '',
  pageTitle: 'A Little Question for You 💗',

  features: {
    intro: true,
    quiz: true,
    miniGame: true,
    gallery: true,
    audio: true,
    cursorEffects: true,
  },

  intro: {
    teaser: 'Someone has something special to ask you...',
    envelopePrompt: 'Open your little surprise 💌',
    envelopeHint: 'tap the envelope',
    envelopeLabel: 'For {recipient|you} 💗',
    letter: {
      greeting: 'Hey, {recipient|you}. 💗',
      paragraphs: [
        'I made something a little different for you.',
        'It might be slightly dramatic.\nIt might be ridiculously cute.\nAnd it definitely contains an important question.',
        'Are you ready?',
      ],
      cta: 'Okay, show me ✨',
    },
  },

  question: {
    eyebrow: 'An extremely important question 💌',
    headlineLines: ['I have a tiny', '*BIG question*...'],
    question: 'Will you be my *Valentine*? 💖',
    supporting:
      'I may have spent an unreasonable amount of time making this just to ask you this one thing.',
    yesLabel: 'YES!',
    challengeCue: 'psst… one tiny challenge before you answer',
  },

  noButton: {
    messages: [
      'Wait... really? 🥺',
      'Are you absolutely sure?',
      'Give the teddy one chance 😭',
      'That button looks suspicious...',
      'Think about the tiny teddy bear.',
      'Not even a little bit? 💔',
      'Plot twist: I’m still adorable.',
      'You’re making the teddy nervous.',
      'Okay but hear me out...',
      'No pressure... but LOOK AT THE TEDDY.',
      'Error 404: NO not found 🤖',
      'This button is on a lunch break 🥪',
      'Too slow! 💨',
      'The YES button is RIGHT THERE 👀',
      'Nice try, cutie 😌',
      'I have legs now. Tiny ones. 🦵',
      'Catch me if you can! 🏃',
      'NO is not in today’s menu 🍰',
      'The teddy filed a complaint 📝',
      'Have you considered… YES? 💗',
    ],
    labels: ['NO 🙈', 'Nope 🙈', 'Nuh-uh 🙅', 'Catch me 😜', 'I’M SHY 😭', 'Too slow 💨', 'Still no? 🥺', 'Try YES 💗'],
  },

  quiz: {
    eyebrow: 'Before the big question…',
    title: 'A tiny *love quiz* 💘',
    intro: 'Six questions. No wrong answers. Only extremely adorable ones.',
    startLabel: 'Let’s do this ✨',
    skipLabel: 'Skip the quiz',
    questions: [
      {
        question: 'First things first… pick our perfect date 🌙',
        options: [
          { emoji: '🌌', label: 'Stargazing picnic', reaction: 'A blanket, snacks, and a sky full of stars? I’m already packing the basket. ✨' },
          { emoji: '🍿', label: 'Cozy movie night', reaction: 'Fuzzy socks, giant blanket, and I promise to share the popcorn. Mostly. 🍿' },
          { emoji: '🍝', label: 'Fancy dinner', reaction: 'Candlelight, pasta, and one very lucky person across the table. 🕯️' },
          { emoji: '🎢', label: 'Spontaneous adventure', reaction: 'Bold choice! Somewhere new, somewhere fun — as long as it’s with you. 🗺️' },
        ],
      },
      {
        question: 'How do you take your hugs? 🤗',
        options: [
          { emoji: '🐻', label: 'Big bear hugs', reaction: 'The teddy just did a little happy spin. Bear hugs approved. 🐻' },
          { emoji: '🫶', label: 'Surprise back hugs', reaction: 'Sneaky AND sweet? Consider it noted for future ambushes. 🫶' },
          { emoji: '☁️', label: 'Long, cozy ones', reaction: 'The kind where time stops for a bit? Absolutely. ☁️' },
          { emoji: '💞', label: 'All of the above', reaction: 'Correct answer. There is no such thing as too many hugs. 💞' },
        ],
      },
      {
        question: 'What’s your love language? 💌',
        options: [
          { emoji: '💬', label: 'Sweet words', reaction: 'Then here’s one: you make ordinary days feel special. 💬' },
          { emoji: '⏳', label: 'Quality time', reaction: 'Phones down, full attention, all the time in the world. ⏳' },
          { emoji: '🎁', label: 'Little surprises', reaction: 'Good news — this whole website is one big surprise. 🎁' },
          { emoji: '🤝', label: 'Holding hands', reaction: 'Okay, hand-holding privileges: officially requested. 🤝' },
        ],
      },
      {
        question: 'We get a pet. What do we name it? 🐾',
        options: [
          { emoji: '🧁', label: 'Pancake', reaction: 'Pancake. Fluffy, sweet, and perfect for lazy Sunday mornings. 🥞' },
          { emoji: '🍡', label: 'Mochi', reaction: 'Mochi is the cutest name ever invented and that is a scientific fact. 🍡' },
          { emoji: '🎩', label: 'Sir Fluffington III', reaction: 'A pet with a title. Distinguished. Elegant. Iconic. 🎩' },
          { emoji: '🚀', label: 'Captain Snuggles', reaction: 'Captain Snuggles reporting for duty. Mission: maximum cuddles. 🚀' },
        ],
      },
      {
        question: 'Be honest… how cute is this website so far? 🥹',
        options: [
          { emoji: '🙂', label: 'Pretty cute', reaction: 'Pretty cute?! Hold on, the teddy is adding more sparkles. ✨' },
          { emoji: '😍', label: 'Extremely cute', reaction: 'Extremely cute — just like the person reading this. 😍' },
          { emoji: '🚨', label: 'Illegally cute', reaction: 'Sorry officer, I can explain. It was made with love. 🚨' },
          { emoji: '😭', label: 'I’m literally crying', reaction: 'Happy tears only, please! Here, have a virtual hug. 🫂' },
        ],
      },
      {
        question: 'Last one. Would you rather… 🤔',
        options: [
          { emoji: '🤝', label: 'Hold my hand', reaction: 'Excellent choice. My hand is ready. 🤝' },
          { emoji: '💗', label: 'Hold my hand, but with feelings', reaction: 'Oh, the feelings are DEFINITELY included. 💗' },
        ],
      },
    ],
    meter: {
      title: 'Calculating our compatibility…',
      overloadTitle: 'Wait… that’s not right…',
      finalTitle: 'Compatibility: off the charts 💘',
      message: 'The love-o-meter broke. Turns out some things are too big to measure.',
      continueLabel: 'Okay… now the real question 💌',
    },
  },

  promise: {
    eyebrow: 'One more thing',
    title: 'Let’s make it *official*',
    hint: 'Press and hold the heart to seal it with a pinky promise.',
    holdLabel: 'Hold me',
    sealedTitle: 'Pinky promise sealed 🤞💗',
    sealedMessage: 'No take-backs. It’s official-official now.',
  },

  coupons: {
    title: 'Valentine *coupons* 🎟️',
    subtitle: 'Tap a coupon to claim it. Redeemable anytime — no expiry date.',
    items: [
      { emoji: '🍿', title: 'One cozy movie night', detail: 'Your pick of movie. Snacks included.' },
      { emoji: '🤗', title: 'Unlimited hugs', detail: 'Valid any day, any time, any mood.' },
      { emoji: '🥞', title: 'Breakfast in bed', detail: 'Pancakes, served with extra love.' },
      { emoji: '💃', title: 'A slow dance', detail: 'Anywhere. Even the kitchen.' },
    ],
  },

  miniGame: {
    title: 'Before you answer... one *tiny* challenge 💘',
    subtitle: 'Three little hearts are hiding secrets. Open as many as you like — the question will wait.',
    hearts: [
      {
        label: 'A compliment',
        title: 'Heart #1 · A compliment',
        message: 'You’re kind of ridiculously adorable, you know that?',
      },
      {
        label: 'A tiny promise',
        title: 'Heart #2 · A tiny promise',
        message: 'I promise to make this Valentine experience at least 73% more dramatic than necessary.',
      },
      {
        label: 'The final clue',
        title: 'Heart #3 · The final clue',
        message: 'There’s a very important button waiting for you above. 👀',
      },
    ],
    completeMessage: 'All three hearts found. You’re officially very good at this. 💘',
  },

  celebration: {
    moment: 'WAIT... YOU SAID YES?! 😭💖',
    headline: 'SHE SAID YES!!! 💖',
    subheading: 'Best. Plot twist. Ever.',
    status: 'Okay, official Valentine status: activated. 💘',
  },

  finalLetter: {
    greeting: 'Dear {recipient|Valentine},',
    paragraphs: [
      'You just made this little corner of the internet a whole lot happier.',
      'Here’s to sweet moments, silly jokes, unexpected surprises, and memories worth keeping.',
      'I’m really glad you clicked that button. 💗',
    ],
    relationshipMessages: [],
    signOff: 'With all the love this website can hold,',
    signature: '{sender}',
  },

  surprise: {
    label: 'One last little surprise...',
    message:
      'Every star on this page was placed by hand, every heart was nudged into place, and every line was rewritten until it felt right — because you deserve things made with care. Happy Valentine’s Day. 💗',
  },

  endingMessage: 'Made with an unreasonable amount of love.',

  gallery: {
    title: 'A Little Gallery of *Us* 💗',
    subtitle: 'A few favorite frames — tap any of them to look closer.',
    illustrationSubtitle: 'Every story needs a few blank pages. Here’s to filling these together. 💗',
    showIllustrationsWhenEmpty: true,
    images: [
      // { src: 'images/our-first-photo.jpg', alt: 'The two of us laughing at the beach', caption: 'That sunset 🌅' },
    ],
  },

  theme: {
    midnightPlum: '#170A20',
    burgundy: '#5C102D',
    crimson: '#F04468',
    bubblegum: '#FF82B2',
    blush: '#FFE1EA',
    ivory: '#FFF8F5',
    lavender: '#C9A7FF',
    gold: '#FFE5A0',
  },
};
