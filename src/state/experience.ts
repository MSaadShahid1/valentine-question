import { valentineConfig } from '../config/valentine';

/**
 * The experience is a small state machine. Each stage is a scene; only the
 * transitions listed in ALLOWED can happen, which keeps double clicks and
 * overlapping timers from ever skipping or replaying a scene by accident.
 */
export type Stage = 'intro' | 'envelope' | 'letter' | 'quiz' | 'question' | 'celebration';

export interface ExperienceState {
  stage: Stage;
  /** Bumped on replay so every scene remounts with fresh state and counters. */
  run: number;
}

export type ExperienceAction = { type: 'go'; to: Stage } | { type: 'replay' };

const ALLOWED: Record<Stage, Stage[]> = {
  intro: ['envelope', 'question'],
  envelope: ['letter', 'question'],
  letter: ['quiz', 'question'],
  quiz: ['question'],
  question: ['celebration'],
  celebration: [],
};

/** Scenes that come before the big question (the "Skip intro" button is shown during these). */
export const INTRO_STAGES: Stage[] = ['intro', 'envelope', 'letter', 'quiz'];

const { features } = valentineConfig;

export const initialStage: Stage = features.intro ? 'intro' : features.quiz ? 'quiz' : 'question';

/** Where the love letter leads: the quiz if it's enabled, otherwise straight to the question. */
export const afterLetter: Stage = features.quiz ? 'quiz' : 'question';

export const initialExperience: ExperienceState = { stage: initialStage, run: 0 };

export function experienceReducer(state: ExperienceState, action: ExperienceAction): ExperienceState {
  switch (action.type) {
    case 'go':
      return ALLOWED[state.stage].includes(action.to) ? { ...state, stage: action.to } : state;
    case 'replay':
      return { stage: initialStage, run: state.run + 1 };
  }
}
