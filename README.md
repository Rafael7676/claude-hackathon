# CONNECT

**Break the bubble. Meet someone new.**

CONNECT is a campus social platform that fights loneliness and isolation by creating lightweight, recurring reasons for people to meet in person — not through swiping, but through shared curiosity and proximity.

Built for UW-Madison's 50,000-person campus. Designed to work anywhere people have forgotten how to talk to each other.

---

## The problem

We sit in lecture halls with 300 students and don't know the person next to us. We have more ways to communicate than any generation in history, and somehow it's harder than ever to feel like we belong. The tools that were supposed to connect us made us more lonely, isolated, and siloed.

What if we built better ones?

## The idea

CONNECT creates three types of real-world connection:

1. **AI-powered matching** — Tell us what you're curious about in natural language. Claude's API finds people whose interests *complement* yours — not just match. An econ student curious about art meets an art student curious about data.

2. **Proximity broadcasts** — Going to grab coffee? Need one more for pickup basketball? Broadcast an open invitation to people within walking distance. Low-stakes, high-warmth.

3. **Structured meetups** — Weekly coffee chats, meal matching, study groups. The connection is a byproduct of doing something together, not the explicit goal.

---

## Project structure

```
connect-app/
├── README.md
├── docs/
│   ├── pitch-deck.md          # Pitch materials and narrative
│   ├── competitive-analysis.md # Market landscape
│   ├── user-research/          # Interview notes, surveys
│   └── technical-spec.md       # Architecture decisions
├── prototypes/
│   ├── v1-interactive.html     # Initial interactive prototype
│   └── assets/                 # Design assets, screenshots
├── src/
│   ├── frontend/               # React Native / mobile app code
│   │   ├── components/
│   │   ├── screens/
│   │   └── navigation/
│   ├── backend/                # API server
│   │   ├── routes/
│   │   ├── models/
│   │   └── services/
│   └── ai/                     # Claude API integration
│       ├── matching.js         # Curiosity-based matching engine
│       ├── conversation.js     # Chat starter generation
│       └── prompts/            # Prompt templates
├── .gitignore
├── .env.example                # Template for environment variables
└── CONTRIBUTING.md             # How to contribute
```

---

## Tech stack (proposed)

| Layer | Technology | Why |
|-------|-----------|-----|
| Mobile app | React Native + Expo | Cross-platform, fast iteration |
| Backend | Node.js + Express | JS everywhere, team familiarity |
| Database | PostgreSQL + PostGIS | Location queries are first-class |
| AI matching | Anthropic Claude API | Natural language understanding for curiosity-based matching |
| Real-time | Socket.io | Live broadcast updates, proximity pings |
| Auth | Firebase Auth | Fast setup, social login support |
| Maps | Mapbox | Campus-specific map styling |

---

## Getting started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL 15+
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Setup
```bash
# Clone the repo
git clone https://github.com/your-team/connect-app.git
cd connect-app

# Install dependencies
npm install

# Copy environment template and add your keys
cp .env.example .env

# Start the development server
npm run dev
```

### Environment variables
```
ANTHROPIC_API_KEY=your_key_here
DATABASE_URL=postgresql://localhost:5432/connect
FIREBASE_CONFIG=your_firebase_config
MAPBOX_TOKEN=your_mapbox_token
```

---

## Contributing

### Branch naming
Use descriptive branch names with prefixes:
- `feature/` — new features (e.g., `feature/ai-matching`, `feature/broadcast-nearby`)
- `fix/` — bug fixes (e.g., `fix/location-permissions`)
- `docs/` — documentation updates (e.g., `docs/api-endpoints`)
- `prototype/` — design explorations (e.g., `prototype/onboarding-flow`)

### Workflow
1. Pull latest `main`: `git pull origin main`
2. Create your branch: `git checkout -b feature/your-feature`
3. Make changes and commit with clear messages
4. Push and open a Pull Request: `git push origin feature/your-feature`
5. Get at least one review before merging
6. Squash merge into `main` to keep history clean

### Commit messages
Write them like this:
```
Add curiosity-based matching API endpoint

- Integrates Claude API for natural language interest parsing
- Returns top 5 complementary matches with explanation
- Includes conversation starter suggestions
```

The first line is a short summary (imperative mood, under 72 chars). Add a blank line, then bullet points for details if needed.

### Code review expectations
- Every PR gets at least one review
- Reviewer checks: does it work, is it readable, does it follow project patterns
- Keep PRs small and focused — one feature or fix per PR
- If a PR is too big, break it into smaller ones

---

## Roadmap

### Phase 1 — Validate (now)
- [x] Interactive prototype
- [ ] User interviews (target: 20 students)
- [ ] Pitch deck v1
- [ ] Land on core feature set

### Phase 2 — MVP (weeks 3-6)
- [ ] User auth + basic profiles
- [ ] Proximity broadcast (post + join)
- [ ] Claude-powered matching (v1)
- [ ] Campus map integration

### Phase 3 — Beta launch (weeks 7-10)
- [ ] Deploy to 1-2 dorms
- [ ] Coffee chat scheduling
- [ ] Post-meetup feedback loop
- [ ] Iterate based on real usage data

### Phase 4 — Scale
- [ ] Campus-wide launch
- [ ] University partnership (housing, orientation)
- [ ] Expand to other campuses

---

## Team

| Name | Role | GitHub |
|------|------|--------|
| TBD | Product / Strategy | @handle |
| TBD | Frontend | @handle |
| TBD | Backend / AI | @handle |
| TBD | Design | @handle |

---

## License

TBD — discuss with team before open-sourcing.
