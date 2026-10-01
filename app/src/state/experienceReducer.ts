import type { Action, AppState, ExperienceEvent, SessionSummary, SpriteGender } from '../types';

const now = () => Date.now();
export const initialState = (): AppState => ({ phase: 'landing', avatarId: 'female' as SpriteGender, events: [], tipsOpened: [], startedAt: now(), flightAttempts: 0, securityItemsPlaced: [], neededExtraGuidance: false, gateFoundWithoutDirectHighlight: false, hintLevel: 0 });

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADVANCE': {
      const next = { ...state, phase: action.phase, hintLevel: 0 };
      if (action.phase === 'intro' && state.phase === 'landing') next.startedAt = now();
      return next;
    }
    case 'SELECT_AVATAR': return state.avatarId === action.avatarId ? state : { ...state, avatarId: action.avatarId as SpriteGender };
    case 'HINT': return { ...state, hintLevel: Math.min(2, state.hintLevel + 1), neededExtraGuidance: true };
    case 'OPEN_TIP': return state.tipsOpened.includes(action.tipId) ? state : { ...state, tipsOpened: [...state.tipsOpened, action.tipId] };
    case 'EVENT': {
      const event: ExperienceEvent = { type: action.name, timestamp: now(), payload: action.payload };
      const next = { ...state, events: [...state.events, event] };
      if (action.name === 'first_action' && !state.firstActionAt) next.firstActionAt = event.timestamp;
      if (action.name === 'flight_found') next.flightAttempts = state.flightAttempts + 1;
      if (action.name === 'security_item_placed' && typeof action.payload?.item === 'string' && !state.securityItemsPlaced.includes(action.payload.item)) next.securityItemsPlaced = [...state.securityItemsPlaced, action.payload.item];
      if (action.name === 'gate_found') next.gateFoundWithoutDirectHighlight = true;
      return next;
    }
    case 'RESET': return initialState();
    default: return state;
  }
}

export const summaryFrom = (state: AppState): SessionSummary => ({
  scenario: 'first_flight',
  timeToFirstActionMs: (state.firstActionAt ?? Date.now()) - state.startedAt,
  flightAttempts: state.flightAttempts,
  tipsOpened: state.tipsOpened,
  neededExtraGuidance: state.neededExtraGuidance,
  securityItemsPlaced: state.securityItemsPlaced,
  gateFoundWithoutDirectHighlight: state.gateFoundWithoutDirectHighlight,
  completed: state.phase === 'complete' || state.phase === 'arrive',
});
