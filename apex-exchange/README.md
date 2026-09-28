# 🚀 Apex Exchange — Galactic Commodity Market Simulator

> Year 2192. Humanity has colonized the Orion Arm. Trade routes between planetary
> systems are regulated by the Apex Orbital Exchange. Speculate on volatile
> interstellar commodities — Quantum Fuel, Dark Matter Ore, Bio-Synthetics, and
> Terran Grains — as prices swing with simulated galactic events in real time.

A full-stack, real-time trading simulator built as a learning project, combining a
live server-side price engine, ACID-safe order execution, a Redis leaderboard, and
Socket.io-powered live updates.

---

## ✨ Features

- **Live galactic price ticker** — server-side worker updates 4 commodities every
  5–10 seconds with randomized drift, plus a 10% chance per tick of a "galactic
  event" (solar flares, piracy, embargoes, etc.) that spikes or crashes a price.
- **Real trading engine** — Buy / Sell / Short / Cover, backed by PostgreSQL ACID
  transactions with row-level locks (`SELECT ... FOR UPDATE`) so concurrent trades
  can never corrupt a wallet or position.
- **Live portfolio tracking** — cash balance, open positions, weighted average
  entry price, unrealized P&L, and total net worth.
- **Redis-powered leaderboard** — net worth ranking via Redis sorted sets, updated
  after every trade.
- **Real-time everything** — prices, galactic events, and leaderboard changes are
  pushed to every connected client instantly via Socket.io (no polling for prices).
- **JWT authentication** — register/login with bcrypt-hashed passwords.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, Recharts, React Router, Axios, Socket.io-client |
| Backend | Node.js, Express, Socket.io |
| Database | PostgreSQL (hosted on [Neon.tech](https://neon.tech)) |
| Cache / Leaderboard | Redis (hosted on [Upstash](https://upstash.com)) |
| Auth | JWT + bcryptjs |
| Backend hosting | [Render](https://render.com) |
| Frontend hosting | [Vercel](https://vercel.com) |

---

## 📁 Project Structure

```
apex-exchange/
├── client/ # React (Vite) frontend
│ ├── src/
│ │ ├── components/ # PriceChart, TradePanel, PortfolioPanel,
│ │ │ # LeaderboardPanel, CommodityCard, GalacticEventFeed
│ │ ├── context/
│ │ │ └── AuthContext.jsx # Auth state, login/register/logout, localStorage
│ │ ├── hooks/
│ │ │ ├── useMarketData.js # Socket listener: live prices + events
│ │ │ ├── usePortfolio.js # Fetches/refetches portfolio
│ │ │ └── useLeaderboard.js # Polls leaderboard every 10s
│ │ ├── lib/
│ │ │ ├── api.js # Axios instance w/ JWT interceptor
│ │ │ └── socket.js # Shared Socket.io client instance
│ │ ├── pages/
│ │ │ ├── LoginPage.jsx
│ │ │ ├── RegisterPage.jsx
│ │ │ └── DashboardPage.jsx # Main trading screen
│ │ ├── App.jsx # Routes
│ │ └── main.jsx
│ └── .env # VITE_API_URL (not committed)
│
├── server/ # Node + Express + Socket.io backend
│ ├── src/
│ │ ├── config/
│ │ │ ├── db.js # PostgreSQL pool (Neon, SSL)
│ │ │ └── redis.js # Redis client (Upstash, TLS)
│ │ ├── controllers/
│ │ │ ├── authController.js # register, login
│ │ │ ├── tradeController.js # placeOrder (BUY/SELL/SHORT/COVER)
│ │ │ └── portfolioController.js
│ │ ├── db/
│ │ │ ├── schema.sql # Table definitions
│ │ │ ├── seed.sql # Initial 4 commodities
│ │ │ └── runSeed.js # One-off seed runner (npm run seed)
│ │ ├── middleware/
│ │ │ └── authMiddleware.js # JWT verification
│ │ ├── routes/
│ │ │ ├── authRoutes.js
│ │ │ ├── tradeRoutes.js
│ │ │ └── leaderboardRoutes.js
│ │ ├── services/
│ │ │ └── leaderboardService.js # Redis sorted set logic
│ │ ├── sockets/
│ │ │ └── marketSocket.js # broadcastPrices, broadcastLeaderboard, broadcastGalacticEvent
│ │ └── workers/
│ │ └── tickerWorker.js # The galactic price engine
│ ├── server.js # Express + HTTP + Socket.io entrypoint
│ └── .env # DATABASE_URL, REDIS_URL, JWT_SECRET, PORT (not committed)
│
├── .gitignore
└── README.md
```
---

## 🗄️ Database Schema

| Table | Purpose |
|---|---|
| `users` | Traders — username, email, password_hash, cash_balance (default $100,000) |
| `commodities` | The 4 tradeable goods and their live current_price |
| `price_history` | Every price the ticker has ever set, per commodity — powers the charts |
| `galactic_events` | Log of random events, which commodity they hit, and the % impact |
| `positions` | Per-user, per-commodity holdings. Positive quantity = long, negative = short |
| `orders` | Permanent audit log of every trade ever executed |

Full definitions in `server/src/db/schema.sql`.

**Seeded commodities:**
| Symbol | Name | Starting Price |
|---|---|---|
| QFUEL | Quantum Fuel | $120.00 |
| DMO | Dark Matter Ore | $450.00 |
| BIOS | Bio-Synthetics | $75.00 |
| TGRN | Terran Grains | $18.00 |

---

## 🔌 API Reference

### Auth (`/api/auth`)
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Create account (username, email, password) |
| POST | `/login` | No | Returns JWT + user object |
| GET | `/me` | Yes | Returns decoded JWT user info |

### Trading (`/api/trade`)
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/order` | Yes | Body: `{ commoditySymbol, orderType, quantity }`. orderType ∈ BUY/SELL/SHORT/COVER |
| GET | `/portfolio` | Yes | Cash balance, open positions, unrealized P&L, net worth |

### Leaderboard (`/api/leaderboard`)
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/top` | No | Top traders by net worth (Redis sorted set) |

### Socket.io Events (emitted by server)
| Event | Payload | Frequency |
|---|---|---|
| `prices:update` | `[{ id, symbol, current_price }, ...]` | Every 5–10s |
| `galactic:event` | `{ headline, commodityId, impactPercent }` | ~10% of ticks |
| `leaderboard:update` | Ranked array | On trade |

---

## ⚙️ Local Setup

### Prerequisites
- Node.js (LTS)
- A [Neon.tech](https://neon.tech) Postgres database
- An [Upstash](https://upstash.com) Redis database

### 1. Backend
```bash
cd server
npm install
# Create .env with:
#   DATABASE_URL=<your Neon connection string>
#   REDIS_URL=<your Upstash rediss:// connection string>
#   JWT_SECRET=<any random string>
#   PORT=4000
npm run seed   # populates the 4 starting commodities (safe to re-run)
npm run dev    # starts server on :4000, logs Postgres/Redis connection + ticker
```

### 2. Frontend
```bash
cd client
npm install
# Create .env with:
#   VITE_API_URL=http://localhost:4000
npm run dev    # starts on :5173
```

Visit `http://localhost:5173`, register a trader, and start trading.

---

## 🚢 Deployment

- **Database**: Neon.tech (free tier) — run `schema.sql` then `seed.sql` in the Neon SQL Editor.
- **Redis**: Upstash (free tier) — Regional database, use the `rediss://` connection string (not the REST URL) since the backend uses `ioredis`.
- **Backend**: Render Web Service — root directory `server/`, build command `npm install`, start command `node server.js`, env vars: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `PORT`.
- **Frontend**: Vercel — root directory `client/`, env var `VITE_API_URL` pointing at the deployed Render backend URL.

---

## 🐛 Bugs Faced During Development (and how they were fixed)

Documenting these because they're realistic issues anyone building a similar
stack will likely hit:

1. **Duplicate ticker start (`🚀 Galactic ticker started` printed twice)**
   Caused by nodemon restarting mid-edit while a previous process was still
   alive, and no idempotency guard in `startTicker()`. **Fix**: added a
   module-level `tickerStarted` boolean flag that blocks a second start.

2. **Ticker crash: `ReferenceError: query is not defined`**
   `tickerWorker.js` called a bare `query(...)` function that was never
   imported. **Fix**: correctly imported `{ pool }` from `config/db.js` and
   used `pool.query(...)` throughout.

3. **Ticker crash: `column "impact_percent" of relation "galactic_events" does
   not exist`**
   The INSERT statement used a column name (`impact_percent`) that didn't
   match the actual schema (`price_impact_percent`), and was also missing the
   `commodity_id` column entirely. **Fix**: corrected the INSERT to match the
   real schema exactly.

4. **`seed.sql` syntax error: `syntax error at or near "INSERT"`**
   The file had been saved with an invisible UTF-8 Byte Order Mark (BOM)
   character at the very start, which Postgres's SQL parser choked on.
   **Fix**: recreated the file as plain UTF-8 without a BOM.

5. **Empty `commodities` table after a "successful" seed**
   Traced back to a Neon SQL Editor branch-selector mix-up during manual
   testing — briefly appeared to be viewing an unrelated branch's empty
   table. Root cause was actually stale data from bug #1 (two overlapping
   ticker processes writing inconsistent data). **Fix**: killed all stray
   `node.exe` processes, reseeded cleanly, confirmed via `SELECT * FROM
   commodities;`.

6. **`runSeed.js` created as a 0-byte empty file**
   An AI-generated file edit silently failed to write any content. **Fix**:
   re-specified the exact file contents explicitly and verified by viewing
   the file before running it.

7. **Repeated `npm error ... Could not read package.json` (`ENOENT`)**
   Terminal commands run from the wrong working directory (parent folder
   instead of `server/`). **Fix**: always check the terminal prompt's current
   path before running `npm run ...` — if it doesn't end in `\server` or
   `\client`, `cd` into the right folder first.

---

## 🎮 How to Play

1. Register a trader account (starts with $100,000 cash).
2. Watch the 4 commodities tick live — prices drift constantly, and roughly
   1 in 10 ticks triggers a galactic event that can swing a price ±35%.
3. Click a commodity to see its live chart.
4. Buy when you think a price will rise, Short when you think it'll fall.
5. Sell/Cover to lock in gains (or cut losses).
6. Climb the leaderboard by growing your net worth (cash + position value).

---

## 📄 License

Personal / educational project. Not for production financial use — this is a
simulation with fictional currency and fictional commodities.
