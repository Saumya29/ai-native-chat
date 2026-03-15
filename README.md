# Mesh

AI-native group chat where the AI is a teammate, not a sidebar widget.

## What is this

Mesh is a prototype for a new kind of group messaging. Instead of bolting AI onto chat as a `/slash command` or a separate panel, the AI sits inside the conversation as a full participant. It listens, contributes when useful, stays silent when it has nothing to add, and quietly extracts structure (decisions, tasks, budget, links) from the natural flow of conversation.

Built as a co-founder audition demo.

## Key features

- **"When to speak" logic**: The AI decides whether to respond or stay silent. Not every message gets a reply. A lightweight classifier determines relevance before generating a response.
- **Streaming responses**: AI messages appear token-by-token via SSE. Fast decision call (gpt-4o-mini) followed by streamed response (gpt-4o).
- **Live context panel**: Decisions, tasks, budget items, and links are extracted automatically and shown in a resizable sidebar. Tasks have checkboxes. Items link back to the source message.
- **Guided demo with reveal**: A "Watch Demo" auto-plays a realistic group conversation (Bali trip planning). The twist: one of the "human" participants was the AI the whole time.
- **Room settings**: Per-room AI personality (professional/casual/minimal), activity level slider, and capability toggles.
- **Dark mode**: Toggle between light and dark themes. Indigo primary preserved across both.
- **Mobile-responsive**: Context panel becomes a bottom drawer on small screens. Header adapts to available space.

## Tech stack

- Next.js 16 + TypeScript
- OpenAI GPT-4o / GPT-4o-mini via Vercel AI SDK
- Tailwind CSS 4 + shadcn/ui
- Geist Mono font
- Deployed on Vercel

## Running locally

```bash
pnpm install
cp .env.example .env.local  # add your OPENAI_API_KEY
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Demo password is `mesh2024`.

## Project structure

```
app/
  api/chat/route.ts     # streaming API with shouldRespond logic
  layout.tsx            # root layout, theme provider, Geist Mono
  globals.css           # light + dark theme tokens
components/
  chat-app.tsx          # main orchestrator
  message-bubble.tsx    # individual messages with markdown rendering
  context-sidebar.tsx   # resizable context panel with drag handle
  demo-player.tsx       # auto-play demo controls
  room-settings.tsx     # AI configuration sheet
  password-gate.tsx     # demo auth gate
lib/
  types.ts              # shared interfaces + constants
  demo-script.ts        # scripted demo conversation data
```
