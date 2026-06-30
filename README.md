# Nutro AI

**Agentic health-and-fitness copilot for Swiggy Builders Club**

Nutro AI inspects a user's remaining daily macronutrient and caloric needs (simulated wearable data), then orchestrates Swiggy's **Food** and **Instamart** MCP servers to find, filter, and cart real-time meals or groceries that hit those macro targets.

```
┌─────────────────────────────────────────────────────────────────┐
│  Next.js 15 Dashboard  ←──SSE/NDJSON──→  FastAPI Orchestrator │
│       │                                        │                │
│  Vercel AI SDK 6                         Agent Loop            │
│       │                                        │                │
│  Bento UI (4 panels)              JSON-RPC MCP Transport        │
│                                          ┌──────┴──────┐        │
│                                          │ Food │ Insta│        │
│                                          └──────┴──────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Architecture

| Layer | Stack | Role |
|-------|-------|------|
| Frontend | Next.js 15, Tailwind CSS 4, Vercel AI SDK 6, Lucide React | Cyberpunk bento dashboard with streaming chat |
| Backend | Python 3.12+, FastAPI, Pydantic v2 | Agent orchestrator + MCP server simulation |
| Transport | JSON-RPC 2.0 over HTTP | Mirrors Swiggy MCP spec wire format |

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.12+
- npm

### 1. Install & run (Next.js — includes agent)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 2. Optional: Python backend (local dev only)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Deploy to Vercel

- **Root Directory:** `.` (repo root — do NOT set to `backend` or `frontend`)
- Framework auto-detects **Next.js**
- `backend/` is ignored via `.vercelignore`

## Dashboard Components

### A — Wearable Stats Card
Glowing SVG circular progress rings for **Calories**, **Protein**, **Carbs**, and **Fats**. Data sourced from `GET /api/profile`.

### B — Nutro Copilot Chat
Streaming chat powered by **Vercel AI SDK 6** `useChat` hook. Example prompts:

- *"I just finished a heavy leg day, get me a high-protein dinner from a top-rated spot nearby."*
- *"Need low-carb groceries from Instamart for meal prep this week."*
- *"Find a keto-friendly lunch under 500 calories with 40g+ protein."*

### C — MCP Terminal Matrix
Real-time JSON-RPC event log with state indicators:

| Indicator | State | Example |
|-----------|-------|---------|
| 🟢 | CALLING | `mcp.swiggy.com/food → get_addresses()` |
| 🟡 | PARSING | `extracted addressId: "addr_gym_098"` |
| 🔵 | EXECUTING | `search_restaurants(cuisine: "healthy", min_protein: 40)` |
| ✅ | SUCCESS | Checkout token generated |
| 🔴 | ERROR | Item out of stock — auto-fallback triggered |

### D — Swiggy Cart
Visual breakdown of agent-injected cart items with macro summaries, price totals, and checkout URL.

## Agent Orchestration Flow

```
User Message
     │
     ▼
┌─────────────┐
│ Load Profile│  GET remaining macros from wearable mock
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Route Intent│  food | instamart | auto (macro-driven)
└──────┬──────┘
       │
       ├──────────────────────────────────┐
       ▼                                  ▼
┌──────────────┐                  ┌──────────────┐
│ Food Chain   │                  │ Instamart    │
│              │                  │ Chain        │
│ get_addresses│                  │ get_addresses│
│ search_rest. │                  │ search_prod. │
│ update_cart  │                  │ update_cart  │
└──────┬───────┘                  └──────┬───────┘
       │                                  │
       └──────────┬───────────────────────┘
                  ▼
         Stream logs + cart + text
```

### Out-of-Stock Edge Case

When `search_restaurants` or `search_products` returns an item with `in_stock: false`:

1. Agent logs a **🔴 ERROR** in the terminal matrix
2. Automatically calls an alternative search (same macro criteria, different item)
3. Logs **🔵 EXECUTING** with the fallback item
4. Proceeds to `update_cart` with the replacement

Mock out-of-stock items for testing:
- **Food**: Post-Workout Egg White Omelette (`food_004`)
- **Instamart**: Almond Butter (`groc_006`)

## MCP Server Mapping (Swiggy Spec Alignment)

This prototype implements a **local transport layer** that mirrors Swiggy's MCP JSON-RPC architecture. Each tool maps 1:1 to production Swiggy MCP endpoints.

### Transport Layer

```json
{
  "jsonrpc": "2.0",
  "id": "uuid",
  "method": "search_restaurants",
  "params": {
    "address_id": "addr_home_001",
    "cuisine": "healthy",
    "min_protein": 40,
    "sort_by": "rating"
  }
}
```

Response:

```json
{
  "jsonrpc": "2.0",
  "id": "uuid",
  "result": {
    "address_id": "addr_home_001",
    "results": [...],
    "total": 4
  }
}
```

### Server: `mcp.swiggy.com/food`

| Tool | Params | Returns | Production Equivalent |
|------|--------|---------|----------------------|
| `get_addresses()` | — | User delivery addresses | Swiggy Food MCP `get_addresses` |
| `search_restaurants(cuisine, min_protein, max_calories, address_id, sort_by)` | Filter params | Restaurant items with macro metadata | Swiggy Food MCP `search_restaurants` |
| `update_cart(items, address_id, source)` | Cart payload | Secure checkout URL token | Swiggy Food MCP `update_cart` |
| `get_cart()` | — | Current cart state | Swiggy Food MCP `get_cart` |

### Server: `mcp.swiggy.com/instamart`

| Tool | Params | Returns | Production Equivalent |
|------|--------|---------|----------------------|
| `get_addresses()` | — | Delivery addresses | Instamart MCP `get_addresses` |
| `search_products(query, min_protein, category, address_id)` | Filter params | Grocery products with macro metadata | Instamart MCP `search_products` |
| `update_cart(items, address_id, source)` | Cart payload | Secure checkout URL token | Instamart MCP `update_cart` |

### Macro Metadata Schema

Every food item and grocery product includes embedded macro data:

```json
{
  "macros": {
    "calories": 420,
    "protein": 45,
    "carbs": 12,
    "fats": 18
  }
}
```

This enables the agent to filter results against the user's **remaining** macro balance rather than daily totals.

## API Reference

### Backend Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health check |
| `GET` | `/api/profile` | Mock wearable fitness profile |
| `POST` | `/api/chat` | Agent orchestration (NDJSON stream) |

#### `POST /api/chat`

Request:
```json
{ "message": "high-protein dinner nearby" }
```

Stream events (one JSON object per line):
```json
{"type": "profile", "profile": {...}}
{"type": "log", "log": {...}}
{"type": "text", "content": "Found Keto Grilled..."}
{"type": "cart", "cart": {...}}
{"type": "done"}
```

### Frontend API Routes

| Route | Description |
|-------|-------------|
| `GET /api/profile` | Mock wearable fitness profile |
| `POST /api/chat` | Agent orchestration → AI SDK data stream |

## Project Structure

```
nutroAI/
├── app/                           # Next.js App Router
│   ├── api/chat/route.ts          # AI SDK streaming agent
│   ├── api/profile/route.ts
│   ├── page.tsx                   # Swiggy UI dashboard
│   └── layout.tsx
├── components/                    # UI components
├── lib/agent/                     # MCP + orchestrator (runs on Vercel)
├── backend/                       # Python FastAPI (local dev only)
│   ├── main.py
│   ├── orchestrator.py
│   └── mcp_server.py
├── vercel.json
└── .vercelignore                  # Excludes backend from deploy
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_URL` | `http://localhost:8000` | Python backend URL (frontend) |



1. Start both servers (backend → frontend)
2. Observe the **Wearable Stats** panel showing 700 kcal / 40g protein remaining
3. Click the leg-day prompt in the copilot chat
4. Watch the **Terminal Matrix** light up with MCP calls
5. See the **Swiggy Cart** populate with a macro-optimized meal
6. Try the Instamart prompt to see grocery orchestration
7. To trigger out-of-stock fallback, modify the orchestrator to prefer `food_004`

---

