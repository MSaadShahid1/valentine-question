# A Little Question for You 💗

A cinematic, interactive Valentine's Day proposal website: a starry intro, a floating envelope, a love letter, a love quiz, and one very important question. The YES button grows with every attempt to press NO, and the NO button can never be caught.

Built with React 19, TypeScript, Vite 8 and Motion. All artwork is original SVG/CSS, all sound is synthesized in the browser, and there's no backend, tracking, or API key.

**Live site:** https://msaadshahid1.github.io/valentine-question/

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command             | What it does                                    |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Local dev server with hot reload                |
| `npm run typecheck` | TypeScript check (no output files)              |
| `npm run build`     | Type check + production build into `dist/`      |
| `npm run preview`   | Serve the production build locally              |
| `npm run deploy`    | Build and publish to GitHub Pages (`gh-pages` branch) |

## The experience

1. **Intro.** Stars fade in, a heart-shaped constellation draws itself, shooting stars streak by, and a line types itself in: "Someone has something special to ask you…".
2. **Envelope.** It floats in the sky. Tap it and the wax seal glows and breaks, the flap hinges open in 3D, a glowing heart escapes, the letter slides out, and paper hearts and emoji burst out.
3. **Love letter.** "Hey, you. 💗 …" with an "Okay, show me ✨" button.
4. **Love quiz.** Six questions. Every answer gets its own pop-up reaction: a dancing teddy, a bouncing emoji, a custom message and an emoji explosion. It ends with a heart-shaped love meter that fills to 100%, overloads, and breaks at "∞%".
5. **The big question.** A hand-drawn SVG teddy that blinks, breathes, follows the cursor and changes expression. It sits beside "Will you be my Valentine? 💖".
   - **NO is uncatchable.** It flees the cursor, dodges taps, teleports in puffs of smoke, spins, shrinks, jitters and cycles cheeky labels ("Nope 🙈", "Too slow 💨", "Try YES 💗"…). Clicks, taps, Enter and Space only make it escape again. Every attempt makes YES bigger and the teddy more dramatic.
   - It always stays on screen and never covers YES or any other control.
   - An optional mini-game sits below the question: three secret hearts.
6. **YES.** A wide-eyed "WAIT... YOU SAID YES?! 😭💖" beat, then a burst of hundreds of hearts with heart rings, light rays, confetti cannons and a screen shake. The sky turns into a pink-and-gold sunrise.
7. **Finale.**
   - "SHE SAID YES!!! 💖" with heart-shaped fireworks.
   - The final letter.
   - Send some love, Make it sparkle, Launch fireworks, and a flip-card surprise.
   - Save this moment (keepsake PNG) and Replay.
   - A hold-to-seal **pinky promise** and claimable **Valentine coupons**.
   - The gallery. Tapping anywhere on the finale pops hearts.

A **Skip intro** button jumps straight to the question at any point before it.

## Personalize it: `src/config/valentine.ts`

Everything editable lives in that one file.

| Setting | What it controls |
| --- | --- |
| `recipientName`, `senderName` | Optional names. Leave blank for name-free copy. |
| `features.intro / quiz / miniGame / gallery / audio / cursorEffects` | Turn whole sections on or off. |
| `intro` | Teaser line, envelope text, opening letter. |
| `quiz.questions` | Quiz questions; each option has an `emoji`, `label` and its own `reaction`. |
| `quiz.meter` | Love-meter titles, message and button. |
| `question` | Eyebrow, headline lines, the question, supporting text, YES label. |
| `noButton.labels / messages` | What the runaway NO button says. |
| `celebration` | The YES moment and celebration headlines. |
| `finalLetter` | Final letter, optional `relationshipMessages`, sign-off, signature. |
| `surprise`, `promise`, `coupons` | Finale extras (coupon list is fully editable). |
| `gallery` | Gallery copy and photos (see below). |
| `theme` | The eight palette colours. |

Text tokens inside the config:

- `{recipient}` / `{sender}` insert a name.
- `{recipient|you}` uses the name if set, otherwise "you".
- `*words*` get the romantic italic highlight.
- A line that ends up empty (e.g. a signature line with no sender name) is hidden automatically, so no placeholder text ever shows.

## Adding photos

1. Put images in `public/images/` (e.g. `public/images/first-date.jpg`).
2. List them in `gallery.images`:

   ```ts
   images: [
     { src: 'images/first-date.jpg', alt: 'Us laughing at the beach', caption: 'That sunset 🌅' },
   ],
   ```

If no photos are listed, the gallery shows four original illustrations (set `showIllustrationsWhenEmpty: false` to hide it instead). A photo that fails to load is quietly removed, so no broken images appear.

To change other artwork:
- The teddy is in `src/components/TeddyCharacter.tsx`.
- The envelope is in `src/components/Envelope.tsx`.
- The gallery illustrations are in `src/components/GalleryArt.tsx`.
- The favicon is `public/favicon.svg`.

## Sound

Audio is **off by default**. A small "Add a little soundtrack? 🎵" prompt appears during the intro, and the speaker button toggles it at any time. Muting is instant: the master gain drops to zero and the audio context is suspended. The music (an original lullaby) and all effects are synthesized with the Web Audio API, so there are no audio files and nothing to license. The visitor's choice is remembered in `localStorage`; nothing else is stored.

## "Save this moment"

This draws a 1080×1350 keepsake card (sunrise sky, hearts, the dancing teddy, the headline and today's date) on a canvas, then starts a PNG download, all in the browser. Limitations:
- The site can't confirm the file was saved, so the message only says the download *started*.
- Some older iOS browsers open the image in a new tab instead of downloading it.
- If a browser refuses to draw the teddy into the image, the card falls back to a big heart.

## Deploying

`npm run build` produces a static `dist/` folder. It uses relative paths, so it works at a domain root or in a sub-folder.

- **GitHub Pages (already set up):** after changing anything, run `npm run deploy`. It rebuilds the site and pushes `dist/` to the `gh-pages` branch, which GitHub Pages serves at the live link above (updates appear within a minute or two). Commit and push your source changes to `main` as usual.
- **Netlify / Vercel / Cloudflare Pages:** build command `npm run build`, output directory `dist`.

## Accessibility & motion

- `prefers-reduced-motion` is honoured: simple fades replace springs, blurs and shakes, and ambient loops become static.
- Ambient animation pauses when the tab is hidden.
- Every scene moves focus to its heading. Dialogs trap focus and close with Escape, and visible focus rings are used throughout. Screen-reader text is provided for animated headlines and live messages.
- The NO button is deliberately uncatchable (an explicit creative choice for this site). YES is always reachable by mouse, touch and keyboard, and visitors can always close the tab.

## Project structure

```
src/
  config/valentine.ts        ← all personalization
  App.tsx                    ← providers, scene switching, persistent layers
  state/experience.ts        ← scene state machine (intro → … → celebration)
  scenes/                    ← Intro, Envelope, Letter, Quiz, Question, Celebration
  components/                ← Teddy, Envelope, NoButton, LoveLetter, MiniGame, Gallery,
                               PinkyPromise, Coupons, FinaleActions, TransitionFlash, …
  components/quiz/           ← QuizCard (answers + reactions), LoveMeter
  components/background/     ← sky gradients, star field + shooting stars, floating hearts
  context/                   ← effects (particles/flash/shake), sound, pointer parallax
  audio/AudioEngine.ts       ← synthesized music + sound effects
  utils/particles.ts         ← canvas particles: hearts, confetti, emoji, fireworks
  utils/dodge.ts             ← safe-position maths for the runaway NO button
  utils/keepsake.ts          ← keepsake PNG renderer
  styles/                    ← tokens, globals, keyframes, chrome
```
