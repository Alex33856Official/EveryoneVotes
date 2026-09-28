# Development Plan

## 1. Core Feature Concept & Wii Channel Parallels

| Wii "Everyone Votes Channel" Feature | Web App Equivalent                                                                                                                                    |
|:-------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Two-Choice Polls**                 | Binary/split voting polls ("Cats vs. Dogs", "Morning vs. Night", "Would you rather...").                                                              |
| **Vote & Predict Mechanic**          | 1) Cast your own vote, 2) Predict which option you think the public will choose.                                                                      |
| **Results & Intuition Score**        | After voting/poll closing: visually show the % breakdown, whether you were in the majority, and track an **"Intuition / Prediction Accuracy"** score. |
| **Household / Mii Profiles**         | A playful local profile / avatar system (Mii-inspired customizable SVG avatars or nickname switching).                                                |
| **Suggest a Question**               | Community submission portal where users can propose questions for upcoming polls.                                                                     |
| **Wii Aesthetic & Audio**            | Rounded channel tiles, gentle bounce animations, crisp Wii-style sound effects (Web Audio API/chimes), and clean retro-modern UI.                     |

---

## 2. Recommended Tech Stack

- **Hosting & Serverless:** **Netlify**
    - **Vite + React (TypeScript)** for a fast, responsive Single Page Application.
    - **Netlify Functions** (`netlify/functions/`): For secure operations (e.g., verifying votes, calculating aggregate
      poll tallies, preventing multi-vote tampering via master keys or IP hashes).
    - `netlify.toml` for build and redirect/proxy configurations.
- **Backend & Database:** **Back4App** (Parse Server)
    - JavaScript SDK (`parse`) communicating with your Back4App App ID & JavaScript Key (or REST API).
    - LiveQuery / subscriptions for real-time poll result updates.
    - Class-level permissions (CLPs) to secure public reads and write-access.
- **Styling & Motion:**
    - **Tailwind CSS**: Rapid styling with custom Wii palette (soft blues, warm grays, pill buttons, floating glass
      tiles).
    - **Framer Motion**: Replicating the bouncy, springy transitions and tile flips of the Wii Channel.
    - **Lucide Icons / Canvas / SVG**: For Mii-style avatar generator and iconography.
- **Sound Effects:**
    - Synthesized Web Audio API chimes or lightweight audio cues (button click, channel select, drumroll, vote
      confirmation).

---

## 3. Back4App Data Model Schema

We will model four primary Parse Classes on Back4App:

```plain text
1. Poll
   ├── objectId (string)
   ├── title (string)                 // e.g. "Which pet is better?"
   ├── optionA (string)               // e.g. "Dogs"
   ├── optionB (string)               // e.g. "Cats"
   ├── category (string)              // "Daily", "Worldwide", "Fun"
   ├── status (string)                // "voting", "closed", "upcoming"
   ├── expiresAt (Date)
   ├── votesCountA (number)           // Aggregated tally
   ├── votesCountB (number)
   ├── predictionsCountA (number)     // Prediction tally
   └── predictionsCountB (number)

2. Vote
   ├── objectId (string)
   ├── poll (Pointer -> Poll)
   ├── voterToken / userId (string)   // Device fingerprint or Back4App User
   ├── selectedOption (string)        // "A" or "B"
   ├── predictedOption (string)       // "A" or "B"
   └── createdAt (Date)

3. AvatarProfile (Local or Back4App)
   ├── nickname (string)
   ├── avatarConfig (JSON: head, eyes, hair, color)
   ├── totalPredictions (number)
   └── correctPredictions (number)

4. Suggestion
   ├── question (string)
   ├── optionA (string)
   ├── optionB (string)
   ├── authorName (string)
   └── status (string: "pending" | "approved")
```

---

## 4. Phased Implementation Roadmap

### **Phase 1: Project Setup & Back4App Integration**

- Initialize the frontend project (React + TypeScript + Vite + Tailwind CSS).
- Configure Netlify build pipeline (`netlify.toml`) and environment variable stubs (`VITE_BACK4APP_APP_ID`,
  `VITE_BACK4APP_JS_KEY`).
- Initialize Back4App JS SDK service layer and test connectivity with sample poll data.

### **Phase 2: Wii Aesthetic Design System**

- Create Wii-themed UI components:
    - Channel Grid / Card carousel.
    - Floating pill buttons with hover squeeze/pop animations.
    - Wii-like header bar (Date, time, profile chip, back/home navigation).
    - Sound effect manager (Web Audio API sound triggers with a mute toggle).

### **Phase 3: Core Voting & Prediction Flow**

- Poll Viewer: Active question with Option A vs. Option B display.
- Two-step interaction:
    1. *Pick your choice* (Vote).
    2. *Predict the public majority* (Prediction).
- Submit vote & prediction to Back4App.
- Local storage / session tracking so a user can't easily vote twice on the same device.

### **Phase 4: Results & Statistics Screen**

- Dynamic split-bar comparison visualization (e.g. 54% vs 46%) with reveal animation.
- Accuracy check: Compare user's prediction against the prevailing majority.
- Past polls archive to review previous channel results.

### **Phase 5: Mii-Style Avatar System & Suggestion Box**

- Simple, whimsical avatar builder (choose colors, hair, eyes, accessory).
- User intuition score (tracks lifetime prediction accuracy).
- "Suggest a Question" submission form.
