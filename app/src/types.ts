export type PhaseId = 'landing' | 'avatar' | 'intro' | 'packing' | 'packingList' | 'arrival' | 'lookAround' | 'observe' | 'demoBoard' | 'findFlight' | 'goCounter' | 'baggage' | 'followPath' | 'securityDemo' | 'securityTip' | 'security' | 'reduceGuidance' | 'waitGate' | 'findGate' | 'board' | 'arrive' | 'reflection' | 'takeaways' | 'complete';

export type SpriteGender = 'male' | 'female';

export type AvatarOption = { id: SpriteGender; name: string; tag: string };
export type Tip = { id: string; phase: PhaseId; en: string; title: string; body: string };
export type EventName = 'scene_entered' | 'first_action' | 'flight_found' | 'tip_opened' | 'security_item_placed' | 'gate_found' | 'item_packed' | 'counter_found' | 'boarded' | 'boarding_pass_issued' | 'id_checked';
export type ExperienceEvent = { type: EventName; timestamp: number; payload?: Record<string, string | number | boolean> };
export type SessionSummary = { scenario: 'first_flight'; timeToFirstActionMs: number; flightAttempts: number; tipsOpened: string[]; neededExtraGuidance: boolean; securityItemsPlaced: string[]; gateFoundWithoutDirectHighlight: boolean; completed: boolean };

export type AppState = {
  phase: PhaseId;
  avatarId: SpriteGender;
  events: ExperienceEvent[];
  tipsOpened: string[];
  startedAt: number;
  firstActionAt?: number;
  flightAttempts: number;
  securityItemsPlaced: string[];
  neededExtraGuidance: boolean;
  gateFoundWithoutDirectHighlight: boolean;
  hintLevel: number;
  packedItems: string[];
  counterFound: boolean;
  boarded: boolean;
  boardingPassIssued?: boolean;
  hasCheckedBag?: boolean;
};

export type Action =
  | { type: 'ADVANCE'; phase: PhaseId }
  | { type: 'SELECT_AVATAR'; avatarId: SpriteGender }
  | { type: 'EVENT'; name: EventName; payload?: Record<string, string | number | boolean> }
  | { type: 'OPEN_TIP'; tipId: string }
  | { type: 'HINT' }
  | { type: 'RESET' };
