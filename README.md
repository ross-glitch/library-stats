# 📚 Elementary School Library Statistics System

A simple digital system for recording and viewing daily book usage statistics
in an elementary school library. Built with Next.js, TypeScript, TailwindCSS,
Prisma, and PostgreSQL.

---

## 🗂️ Folder Structure

```
library-stats/
├── prisma/
│   ├── schema.prisma          # Database schema (tables & relations)
│   └── seed.ts                # Sample data: assistants + example entries
│
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root HTML layout (fonts, global styles)
│   │   ├── page.tsx           # Root redirect → /login
│   │   ├── globals.css        # TailwindCSS + custom styles
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx       # Assistant picker (login screen)
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx       # Monthly totals + daily entries tables
│   │   │
│   │   ├── add-entry/
│   │   │   └── page.tsx       # Form to submit daily book counts
│   │   │
│   │   └── api/
│   │       ├── assistants/
│   │       │   └── route.ts   # GET /api/assistants
│   │       └── stats/
│   │           ├── route.ts          # GET + POST /api/stats
│   │           └── monthly/
│   │               └── route.ts      # GET /api/stats/monthly
│   │
│   ├── components/
│   │   └── Navbar.tsx         # Top navigation bar
│   │
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── utils.ts           # Date helpers (formatDate, getTodayLocal, etc.)
│   │
│   └── types/
│       └── index.ts           # TypeScript interfaces + CATEGORIES constant
│
├── .env.example               # Copy to .env and fill in DATABASE_URL
├── .gitignore
├── next.config.ts
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md                  # ← You are here
```

---

## 🗄️ Database Schema

```prisma
model Assistant {
  id         Int         @id @default(autoincrement())
  name       String      @unique
  createdAt  DateTime    @default(now())
  dailyStats DailyStat[]
}

model DailyStat {
  id          Int      @id @default(autoincrement())
  date        DateTime @db.Date          // One entry per date (unique)
  assistantId Int
  newBooks    Int      @default(0)
  fiction     Int      @default(0)
  easy        Int      @default(0)
  reference   Int      @default(0)
  filipiniana Int      @default(0)
  createdAt   DateTime @default(now())

  assistant   Assistant @relation(fields: [assistantId], references: [id])

  @@unique([date])   // Enforces one entry per calendar date
}
```

### Key Design Decisions
- `@@unique([date])` — prevents duplicate entries for the same day at the DB level
- `@db.Date` — stores only the date portion (no time), avoiding timezone conflicts
- Monthly totals are **computed at query time** (no separate table needed), keeping the schema lean

---

## ⚙️ API Routes

| Method | Endpoint              | Description                             |
|--------|-----------------------|-----------------------------------------|
| GET    | `/api/assistants`     | Returns all assistants (for picker)     |
| GET    | `/api/stats`          | Returns all daily entries (newest first)|
| GET    | `/api/stats?month=YYYY-MM` | Filter daily entries by month      |
| POST   | `/api/stats`          | Submit a new daily entry                |
| GET    | `/api/stats/monthly`  | Returns aggregated monthly totals       |

### POST /api/stats — Request Body

```json
{
  "date":        "2026-01-15",
  "assistantId": 1,
  "newBooks":    3,
  "fiction":     10,
  "easy":        15,
  "reference":   4,
  "filipiniana": 1
}
```

### POST /api/stats — Response (201 Created)

```json
{
  "data": { "id": 1, "date": "2026-01-15", ... },
  "message": "Entry saved successfully!"
}
```

### POST /api/stats — Error Responses

| Status | Reason                              |
|--------|-------------------------------------|
| 400    | Missing required fields or negative values |
| 404    | Assistant not found                 |
| 409    | Entry for that date already exists  |
| 500    | Server / database error             |

---

## 🚀 How to Run Locally — Step by Step

### Prerequisites

Make sure you have these installed:
- **Node.js** v18 or newer → https://nodejs.org
- **PostgreSQL** v14 or newer → https://www.postgresql.org/download/
- **npm** (comes with Node.js)

---

### Step 1 — Clone or copy the project

```bash
# If you have the folder already, just navigate into it:
cd library-stats
```

---

### Step 2 — Install dependencies

```bash
npm install
```

This installs Next.js, Prisma, TailwindCSS, and all other packages.

---

### Step 3 — Set up PostgreSQL

Open **pgAdmin** or the **psql** terminal and create a new database:

```sql
CREATE DATABASE library_stats;
```

If you need to create a user too:

```sql
CREATE USER library_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE library_stats TO library_user;
```

---

### Step 4 — Configure environment variables

Copy the example file and edit it:

```bash
cp .env.example .env
```

Open `.env` and update the connection string:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/library_stats"
```

Replace `postgres`, `yourpassword`, and `library_stats` with your actual
PostgreSQL username, password, and database name.

---

### Step 5 — Run Prisma migration

This creates the tables in your database:

```bash
npm run db:migrate
```

You'll be prompted for a migration name — type `init` and press Enter.

Alternatively, for a quick push without migration history:

```bash
npm run db:push
```

---

### Step 6 — Seed the database

This adds the 8 sample assistants and 20 example daily entries:

```bash
npm run db:seed
```

You should see output like:

```
🌱 Seeding database...
✅ Created 8 assistants
✅ Created 20 sample daily stats
🎉 Seeding complete!
```

---

### Step 7 — Start the development server

```bash
npm run dev
```

Open your browser and go to: **http://localhost:3000**

---

### Step 8 — Use the app

1. You'll be redirected to `/login`
2. Select your name from the list
3. You'll land on the **Dashboard** — see monthly totals and daily entries
4. Click **"Add Today's Entry"** to submit daily book counts
5. Fill in the date, confirm your name, enter counts per category, and click **Save**

---

## 👩‍💻 Available Scripts

| Command             | What it does                                    |
|---------------------|-------------------------------------------------|
| `npm run dev`       | Start development server (hot reload)           |
| `npm run build`     | Build for production                            |
| `npm run start`     | Start production server                         |
| `npm run db:migrate`| Run Prisma migrations (creates/updates tables)  |
| `npm run db:push`   | Push schema to DB without migration history     |
| `npm run db:seed`   | Insert sample assistants and entries            |
| `npm run db:studio` | Open Prisma Studio (visual DB browser)          |
| `npm run db:reset`  | Reset DB and re-run migrations (⚠️ deletes data)|

---

## 📊 Sample Data Included (after seeding)

### Assistants
Maria Santos, Jose Reyes, Ana Cruz, Carlo Bautista,
Liza Garcia, Miguel Ramos, Sofia Dela Cruz, Ramon Torres

### Example Monthly Totals (after seed)

| Month         | New | Fiction | Easy | Reference | Filipiniana | Total |
|---------------|-----|---------|------|-----------|-------------|-------|
| January 2026  | 31  | 103     | 158  | 50        | 21          | 363   |
| February 2026 | 15  | 54      | 82   | 25        | 12          | 188   |
| March 2026    | 20  | 61      | 90   | 31        | 15          | 217   |

---

## 🖥️ UI Pages

| Path          | Purpose                                         |
|---------------|-------------------------------------------------|
| `/login`      | Name picker — select which assistant you are    |
| `/dashboard`  | View monthly totals + daily entry history       |
| `/add-entry`  | Submit the day's book count form                |

---

## 🔒 Rules Enforced by the System

1. **One entry per date** — The database rejects duplicate dates at the constraint level AND the API returns a clear error message (HTTP 409)
2. **No negative numbers** — API validates all category counts ≥ 0
3. **Weekday warning** — If a weekend date is selected, the app warns the assistant before submitting (but doesn't hard-block, to allow backfilling)
4. **Assistant required** — Both date and assistant name are required fields

---

## 🔮 Future Improvements

Here are features that can be added later as the system grows:

### 📈 Charts & Visualizations
- Bar charts showing monthly trends per category
- Line chart comparing month-over-month growth
- Use **Recharts** or **Chart.js** (both work well with Next.js)

### 📤 Export to Excel / CSV
- Add an "Export" button on the Dashboard
- Use **xlsx** or **csv-stringify** npm packages
- Let the librarian download monthly reports as spreadsheets

### 🔐 Admin Authentication
- Add a proper login system with **NextAuth.js**
- Separate "admin" role (librarian) from "assistant" role
- Admins can edit or delete entries; assistants can only add
- Use **bcrypt** for password hashing

### 📅 Automatic Weekday Enforcement
- Hard-block submissions on Saturdays and Sundays
- Show a friendly message: "The library is closed on weekends!"
- Can be toggled by an admin setting

### 🏫 School Year & Grade Level Tracking
- Track which school year each entry belongs to
- Filter stats by school year (e.g. SY 2025–2026)

### 📱 Mobile PWA
- Make it installable on tablets/phones as a Progressive Web App
- Student assistants can use it from any school device

### 🔔 Reminders
- Send a daily reminder at 4:45 PM (before 5 PM recording time)
- Use a cron job or a service like Resend for email alerts

### 🖨️ Print-Friendly Monthly Report
- One-click print view formatted like the old paper tally sheets
- Useful for submitting to the school principal

---

## 🛠️ Troubleshooting

**"Cannot find module '@prisma/client'"**
→ Run `npm run db:generate` to regenerate the Prisma client

**"Connection refused" / database errors**
→ Make sure PostgreSQL is running and your `DATABASE_URL` in `.env` is correct

**"An entry for this date already exists"**
→ Each date can only have one entry. Check the Dashboard to see if it was already submitted.

**Styles not loading**
→ Make sure you ran `npm install` and that `postcss.config.js` exists

**Port 3000 already in use**
→ Run `npm run dev -- -p 3001` to use a different port

---

*Built for the school library. Keep reading! 📖*
