# First Step Demo Script & Interaction Spec

> MVP scene: First Flight
> Experience model: Explore -> Guided -> Reflect
> Target duration: 2-3 minutes
> Primary action: `EXPLORE`

---

## 1. Product Promise

First Step helps people rehearse an unfamiliar real-world experience before facing it in reality.

The user does not need to know the correct process in advance. The system shows the environment, demonstrates the next action, offers one small contextual tip when it matters, and gradually reduces its guidance.

The intended emotional change is:

```text
I do not know what to do.
        ->
I know what the next step is.
        ->
I can probably do this in real life.
```

The experience is not a test, a game level, or a chatbot conversation.

---

## 2. Experience Principles

### One action at a time

Never show the user the entire airport checklist. Each moment has one visible goal.

### Show before asking

Before asking the user to interact, demonstrate the interaction once with light, camera movement, or a short animation.

### Tips appear in context

Do not show a long list of rules before the experience. Reveal one useful tip when the user reaches the relevant situation.

### No failure state

The user may pause, click the wrong object, or need extra guidance. The system responds by making the next step clearer, not by scoring or punishing.

### AI stays behind the experience

There is no chat panel, AI avatar, or open-ended conversation. AI observes the session and writes a short, behavior-based reflection at the end.

---

## 3. Visual Language

### Color ratio

```text
Black / deep gray       88%
Silver / cool white      9%
Warm light               3%
```

Warm light represents the next step, not an answer or reward.

### Typography

Use sparse English interface labels and concise Chinese explanations where precision matters.

Suggested labels:

```text
FIRST STEP
EXPLORE
LOOK AROUND
FIND YOUR FLIGHT
FOLLOW THE LIGHT
PREPARE FOR SECURITY
CONTINUE
A SMALL TIP
A NOTE FROM YOUR JOURNEY
NOW YOU KNOW HOW TO BEGIN
```

### Avoid

- Scores
- Timers
- Lives
- Correct / wrong labels
- Red error states
- Chat bubbles
- AI avatars
- Dense dashboards
- Bright gradients
- Generic game HUDs

---

## 4. Three-Minute Demo Script

## Scene 0: Landing / 0:00-0:15

### Visual

Nearly black screen. A single warm point of light breathes slowly. A faint airport gate outline is visible far behind it.

### Copy

```text
FIRST STEP

You don't need to know everything
in order to begin.

第一次坐飞机？
```

Primary button:

```text
EXPLORE
```

### Interaction

On hover, the light moves slightly toward the cursor. On click, the light travels into the screen and becomes the airport's distant gate light.

### Product purpose

Create curiosity without explaining the entire product. The user should feel invited, not instructed.

---

## Scene 1: Welcome / 0:15-0:25

### Visual

The airport emerges from darkness: a flight board, an abstract security area, and a distant gate. Fog hides the edges of the space.

### Copy

```text
A GUIDED SIMULATION

You won't get it wrong.
Follow one step at a time.
```

Button:

```text
I'M READY
```

Chinese support text, if needed:

```text
你不需要提前了解机场流程。
我们会先展示，再一起完成。
```

### Product purpose

Remove the fear of not knowing how to interact.

---

## Scene 2: Explore / 0:25-0:45

### Visual

The camera slowly surveys the space. Three elements receive a soft highlight in sequence:

1. Flight information board
2. Security area
3. Gate 18 in the distance

No button is required during the first few seconds.

### Copy

```text
LOOK AROUND

This place may feel unfamiliar.
You only need to notice one thing at a time.
```

### Optional voiceover

```text
机场看起来很大，但你现在不需要知道所有方向。
先观察一下周围。
```

### Product purpose

The first interaction is observation. The product proves that it will not immediately throw the user into a problem.

---

## Scene 3: Find the Flight / 0:45-1:10

### Visual

A thin beam of light travels to the flight board. The target row becomes slightly brighter:

```text
FS001   SHANGHAI   09:40   GATE 18
FS208   SEOUL      10:15   GATE 04
FS316   TOKYO      11:20   GATE 22
```

The system performs one short demonstration: the target row is selected automatically, then returns to its original state.

### Copy

```text
FIND YOUR FLIGHT

Start with one thing.
Look for FS001.
```

### User action

The user clicks the `FS001` row.

### Feedback

```text
FOUND

Now you know where to go next.
```

### Environment response

- Other rows dim slightly.
- `GATE 18` becomes a distant point of light.
- A short path appears on the floor.
- Camera moves forward by a small amount.

### If the user pauses

After 5 seconds:

```text
Look toward the upper screen.
We are only looking for one number.
```

After another 5 seconds:

```text
The highlighted row is your starting point.
```

### Product purpose

Turn a large, confusing space into one manageable observation.

---

## Scene 4: Baggage Tip / 1:10-1:30

### Visual

The camera follows the path to a simplified baggage area. Two objects appear:

```text
CARRY ON
CHECK IN
```

The user can inspect both, but there is no forced A/B decision. On approaching `CHECK IN`, a small silver information point appears.

### Copy

```text
A SMALL TIP

Baggage fees may depend on your
airline and fare type.

Check before you check in.
```

Chinese support:

```text
托运行李是否免费，可能取决于航司和票价类型。
出发前先确认行李额度。
```

Button:

```text
GOT IT
```

### Important wording rule

Do not say:

```text
Checking in baggage is expensive.
```

Say:

```text
Baggage fees may depend on your airline and fare type.
```

The rule varies by airline, route, fare, and date. The product should educate without pretending that one rule applies everywhere.

### Environment response

The baggage label becomes clearer after the Tip is acknowledged. The path continues toward security.

### Product purpose

Show that First Step provides practical, trustworthy help, not only emotional encouragement.

---

## Scene 5: Security Demonstration / 1:30-1:55

### Visual

The security area is abstract: a table, a tray, a phone, and a small bag. The system automatically demonstrates the phone moving into the tray.

### Copy

```text
PREPARE FOR SECURITY

Keep the things you'll need
within easy reach.
```

Then:

```text
I'LL SHOW YOU ONCE.
```

After the demonstration:

```text
NOW YOU TRY.

Start with the phone.
```

### User action

1. Click phone -> phone moves to tray.
2. Click bag -> bag moves to tray.

### Security Tip

After the demonstration or when the user hovers near the objects:

```text
A SMALL TIP

Keeping easy-to-remove items near the top
can make security feel less rushed.

Follow the airport's current instructions.
```

Chinese support:

```text
把容易取出的物品放在外层，安检时会更从容。
具体要求以机场现场规定为准。
```

### If the user clicks the wrong object

The object gently returns to its place. No red state. Copy:

```text
That's okay.
Let's start with the highlighted item.
```

### If the user pauses

```text
You can start with the phone.
It is the object closest to the tray.
```

### Product purpose

Demonstrate, then let the user reproduce the action. This is where the user starts to feel capable rather than merely guided.

---

## Scene 6: Find Gate 18 / 1:55-2:20

### Visual

The system stops drawing the complete path. The camera remains still for a moment. The gate sign is visible but not highlighted immediately.

### Copy

```text
YOU KNOW WHAT TO LOOK FOR NOW.

Find GATE 18.
```

### User action

The user rotates the view or moves the cursor to locate Gate 18, then clicks the gate.

### If the user pauses

First support:

```text
Look for the number you found earlier.
```

Second support:

```text
Gate 18 is beyond the light on your right.
```

### Environment response

- Gate 18 becomes warm and stable.
- The path appears only after the user has looked toward the correct area.
- The camera moves through the gate.
- Airport noise fades into a quiet tone.

### Product purpose

Gradually remove assistance. The final discovery belongs to the user.

---

## Scene 7: Arrival / 2:20-2:35

### Visual

The user enters an open, quiet space. The path behind them remains visible as a thin line of light. The fog is lower; the environment is no longer visually overwhelming.

### Copy

```text
YOU MADE IT HERE.

You didn't suddenly learn everything.
You learned enough for the next step.
```

### Product purpose

Make the psychological change visible in the environment, not only in text.

---

## Scene 8: Reflection / 2:35-3:00

### Primary reflection

```text
NOW YOU KNOW HOW TO BEGIN
```

### Behavior-based AI note

Use the session summary to generate a short note. Example:

```text
You paused before your first action,
but you did not wait for every uncertainty to disappear.
You found one clear step and continued from there.
```

Heading:

```text
A NOTE FROM YOUR JOURNEY
```

### Takeaways

```text
TAKE WITH YOU

01  Start with the flight information board.
02  Check baggage allowance before checking in.
03  Keep easy-to-remove items within reach.
04  When unsure, ask a staff member.
```

Chinese support:

```text
下次遇到陌生流程时，先寻找下一步，而不是试图一次理解全部。
```

Buttons:

```text
EXPLORE AGAIN
RETURN
```

### Product purpose

Connect the simulation to real-world confidence. The user leaves with both a feeling and practical knowledge.

---

## 5. Interaction State Machine

```text
LANDING
  -> INTRO
  -> OBSERVE_AIRPORT
  -> DEMONSTRATE_FLIGHT_BOARD
  -> FIND_FLIGHT
  -> BAGGAGE_CONTEXT
  -> SHOW_BAGGAGE_TIP
  -> SECURITY_DEMO
  -> SHOW_SECURITY_TIP
  -> SECURITY_INTERACTION
  -> REDUCE_GUIDANCE
  -> FIND_GATE
  -> ARRIVE_AT_GATE
  -> REFLECTION
  -> TAKEAWAYS
  -> COMPLETE
```

Each state should own:

- One primary objective
- One main instruction
- One optional hint
- One completion event
- One visual response

Avoid independent booleans such as `isShowingTip`, `hasClicked`, `isMoving`, and `isDone` controlling the whole flow. A single phase value makes the experience easier to test and demo.

---

## 6. Contextual Tips Registry

Tips are curated content, not free-form AI output.

```ts
export type ContextualTip = {
  id: string;
  trigger: string;
  title: string;
  body: string;
  sourceNote?: string;
  severity: "helpful" | "important";
};
```

MVP registry:

```ts
export const tips = [
  {
    id: "baggage-fee",
    trigger: "near_check_in",
    title: "A SMALL TIP",
    body: "Baggage fees may depend on your airline and fare type. Check before you check in.",
    severity: "important"
  },
  {
    id: "security-prep",
    trigger: "security_demo_complete",
    title: "A SMALL TIP",
    body: "Keep easy-to-remove items within reach. Follow the airport's current instructions.",
    severity: "helpful"
  },
  {
    id: "flight-board",
    trigger: "flight_board_intro",
    title: "A SMALL TIP",
    body: "Gate information can change. Check the flight board again before heading to your gate.",
    severity: "helpful"
  }
];
```

Dynamic travel rules should include a source link or source note in a production version. For the hackathon demo, show the rule as general guidance and avoid absolute claims.

---

## 7. Session Events for AI Reflection

Only send a compact, non-sensitive summary to the AI endpoint.

```ts
export type SessionSummary = {
  scenario: "first_flight";
  timeToFirstActionMs: number;
  flightAttempts: number;
  tipsOpened: string[];
  neededExtraGuidance: boolean;
  securityItemsPlaced: string[];
  gateFoundWithoutDirectHighlight: boolean;
  completed: boolean;
};
```

Do not send:

- Name
- Email
- Location
- Device fingerprint
- Full cursor path
- Psychological labels
- Unverified personal information

The AI prompt should request:

- One observation grounded in the session
- One gentle interpretation
- One short closing line
- No diagnosis
- No claims about the user's real personality
- No real-world rule generation
- Maximum 60-80 Chinese characters or 45 English words

Fallback text must always be available locally.

---

## 8. Acceptance Checklist

Before showing the demo, verify:

- The user understands the first action within 10 seconds.
- The first scene can be understood without prior airport knowledge.
- Every interaction is demonstrated before it is requested.
- A user who does nothing receives a clearer hint, not an error.
- Tips appear in context and never overwhelm the scene.
- The baggage Tip uses conditional, accurate wording.
- The security Tip includes a current-rules caveat.
- The user sees the environment respond after each action.
- Guidance decreases by the final step.
- The AI note is grounded in recorded behavior.
- The experience completes if Gemini is unavailable.
- No API key is exposed in browser code.
- The entire demo takes less than three minutes.

---

## 9. The One-Sentence Demo Pitch

> First Step lets people rehearse an unfamiliar real-world experience through a guided simulation, practical contextual tips, and a reflection that helps them leave with more confidence than they arrived with.

中文：

> First Step 让用户在安全的引导式模拟中预演陌生经历，在关键时刻获得可靠的避坑提醒，并带着更多信心回到现实。
