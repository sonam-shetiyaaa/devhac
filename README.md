# TripRescue AI — AI Agent for Travel Disruption Recovery

> **Autonomous Multimodal Travel Disruption Recovery Platform**  

---

## 1. Central Idea: Whole-Trip Recovery

The fundamental issue in modern travel recovery is that existing systems attempt to fix **only the disrupted journey segment** rather than solving the **traveller's entire trip**.

When an upstream flight is cancelled or delayed, the traveller faces cascading domino failures:
```
Flight Cancelled (BLR → DEL) 
       └──> Missed Connecting Train (NDLS → JP Vande Bharat Express)
                └──> Late Hotel Check-in / Room Forfeiture Risk (ITC Rajputana Jaipur)
                         └──> Missed Non-Refundable Tour (Amber Fort Evening Light & Sound Show)
```

**TripRescue AI** transforms:
> *"My trip is disrupted"*  
into:  
> *"Here is your complete whole-trip recovery plan and your exact action checklist."*

---

## 2. Technical Stack (Follows Presentation Exactly)

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) + Tailwind CSS | Responsive, off-white clean modern UI with rectangular cards, timelines, and status labels |
| **Backend** | Node.js + Express | RESTful API orchestrating the multi-stage recovery pipeline |
| **AI Agent** | LLM + Agentic Workflow | Multi-step agentic decision reasoner supporting Google Gemini / OpenAI with built-in fallback |
| **Database** | MySQL 9.5 (`schema.sql` & `seed.sql`) | Relational database schema with resilient embedded persistence fallback |
| **Decision Engine** | Constraint & Disruption Scoring | Mathematical scoring of arrival timing, budget ceilings, cascade resolution, and comfort |

---

## 3. Core Features Implemented

### Feature 1: Recognize Disruptions and Identify Impacted Bookings
- Reports flight delays/cancellations, train delays/cancellations, and hotel check-in issues.
- Autonomous dependency graph traversal identifies cascaded conflicts across connecting trains, hotels, and activities.
- Live interactive preview dynamically calculates domino effects as the user fills the form.

### Feature 2: Understand Traveller Constraints
- Evaluates maximum additional budget, arrival deadlines, minimum connection buffers, and critical activities.
- Flags constraint breaches and offers an interactive **Constraint Relaxation Simulator** (e.g., relax budget or accept a revised schedule).

### Feature 3: Search and Assess Alternative Travel Solutions
- Generates 3 coherent alternatives:
  - **Option A (Priority Direct Reroute - Air India AI-840):** Bypasses Delhi connection completely, lands in Jaipur 5 hours early, saves hotel and Amber Fort tour within budget.
  - **Option B (Protected Multimodal - Vistara + Shatabdi Train):** Reaches Jaipur at 22:40, requires late hotel check-in notice, and reschedules Amber Fort tour.
  - **Option C (Economy Bus Transfer):** Lowest cost (₹600), but arrives at 23:15 with high travel fatigue.
- All mock data is explicitly labeled as **Demonstration Data (Simulated for Evaluation)** without fabricating live bookings.

### Feature 4: Choose and Justify a Recovery Solution
- **Mathematical Decision Engine:** Calculates 4 transparent factor scores:
  - *Timing & Arrival Feasibility* (Max 35 pts)
  - *Budget Feasibility* (Max 25 pts)
  - *Whole-Trip Cascade Resolution* (Max 25 pts)
  - *Travel Comfort & Stress* (Max 15 pts)
- **AI Agent Explanation:** Generates plain-language executive diagnosis, recommendation justification, trade-off comparisons, and constraint advice.

### Feature 5: Create a Revised Itinerary with Required Next Actions
- Generates a revised timeline with replacement transport, updated hotel check-in, and preserved/rescheduled tours.
- Provides an **interactive actionable checklist** with completion toggles (e.g. claim IndiGo refund, cancel unused train ticket, notify ITC Rajputana).
- Supports browser printing (**Print Itinerary**) and text export (**Download Summary**).
- Enforces ethical compliance: requires user approval; no real financial transactions are simulated.

---

## 4. Preloaded Demonstration Scenario

**Route:** Bengaluru (BLR) → Jaipur (JAI) through New Delhi (DEL)  
**Traveller:** Rohan Mehta  
**Disruption:** IndiGo 6E-204 cancelled at Bengaluru at 05:15 AM due to unscheduled technical aircraft maintenance.

**1-Click Testing:** Click the green **"Load Demo Scenario (Bengaluru → Jaipur)"** button on the Dashboard or in the navigation header to instantly populate the scenario.

---

## 5. Project Directory Structure

```
devhac/
├── backend/
│   ├── src/
│   │   ├── config/ (env.js)
│   │   ├── controllers/ (tripController.js, disruptionController.js, recoveryController.js, itineraryController.js)
│   │   ├── database/ (dbAdapter.js, mockStore.js, schema.sql, seed.sql)
│   │   ├── engine/ (conflictDetector.js, scoringEngine.js, alternativesGenerator.js, recoveryAgent.js)
│   │   ├── routes/ (api.js)
│   │   └── server.js
│   ├── tests/
│   │   ├── conflictDetector.test.js
│   │   ├── scoringEngine.test.js
│   │   └── recoveryWorkflow.test.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/ (Navbar.jsx, Footer.jsx, StatusBadge.jsx, CascadeFlow.jsx, ScoreBreakdown.jsx)
│   │   ├── pages/ (DashboardPage.jsx, TripDetailsPage.jsx, ReportDisruptionPage.jsx, RecoveryAnalysisPage.jsx, RevisedItineraryPage.jsx)
│   │   ├── services/ (api.js)
│   │   ├── App.jsx, main.jsx, index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
├── schema.sql (Root copy for MySQL import)
├── seed.sql (Root copy for demo data)
├── .env.example
└── README.md
```

---

## 6. Setup and Execution Instructions

### Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+
- **MySQL** *(Optional)*: MySQL Server 8.0/9.5. If MySQL is not running or credentials are not supplied, the app automatically switches to the zero-dependency resilient storage mode so it functions seamlessly in any environment.

### Step 1: Configure Environment Variables
Copy `.env.example` into `backend/.env`:
```bash
cp .env.example backend/.env
```
*(Optional: Provide `GEMINI_API_KEY` for live Google Gemini LLM reasoning, or leave blank to use the built-in heuristic reasoning engine).*

### Step 2: Run Backend Server
```bash
cd backend
npm install
npm start
```
The backend server runs on `http://localhost:5000`.

### Step 3: Run Frontend Web Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 7. Running Automated Tests

Run the built-in test suite (tests cascade conflict detection, constraint scoring penalties, and itinerary checklist generation):
```bash
cd backend
npm test
```

---

## 8. REST API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/status` | System health, database connection mode, and AI engine status |
| `GET` | `/api/trips` | List all stored trips |
| `GET` | `/api/trips/:id` | Get trip with constraints, bookings, disruptions, and recovery data |
| `POST` | `/api/trips` | Create a new trip with constraints and initial bookings |
| `POST` | `/api/trips/:id/bookings` | Add a new travel leg/segment to an existing trip |
| `POST` | `/api/disruptions` | Report a flight, train, or hotel disruption |
| `POST` | `/api/disruptions/preview` | Preview live cascade conflicts without persisting |
| `POST` | `/api/recovery/analyze` | Run Decision Engine & AI Workflow to generate scored options |
| `GET` | `/api/recovery/options/:tripId` | Retrieve previously generated recovery options |
| `POST` | `/api/recovery/compare` | Re-score alternatives with relaxed constraints |
| `POST` | `/api/recovery/confirm` | Approve an option and generate revised itinerary + checklist |
| `GET` | `/api/itinerary/:tripId` | Retrieve the approved revised itinerary |
| `PATCH` | `/api/itinerary/:tripId/actions/:actionId` | Toggle checklist item completion status |
| `POST` | `/api/demo/reset` | Reset demo scenario to initial disrupted state |

---

## 9. System Impact & Benefits

1. **Faster Recovery Planning:** Generates a unified whole-trip recovery plan in seconds.
2. **Eliminates Manual Cross-Checking:** Automatically evaluates flight + train + hotel dependencies simultaneously.
3. **Transparent Decision Scoring:** Clear factor weightings (timing, budget, cascade, comfort) show exactly why an option is recommended.
4. **Actionable Next Steps:** Provides a structured checklist so travellers know precisely who to contact and what refunds to claim.
