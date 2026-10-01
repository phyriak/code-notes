# Code Notes

A personal technical knowledge base for writing, organizing, and reading programming notes.

The application is intentionally simple:

* **Frontend:** React + Vite
* **Backend:** Node.js + Express
* **Database:** PostgreSQL
* **Database driver:** `pg`
* **Containerization:** Docker Compose
* **Deployment target:** Hetzner
* **Deployment:** planned through GitHub Actions

The project is designed primarily as a learning project and a practical place to store technical knowledge.

---

## 1. Architecture

```text
                         Code Notes
                              │
             ┌────────────────┴────────────────┐
             │                                 │
        React Frontend                    Node.js Backend
          Vite                              Express
             │                                 │
             │ HTTP / REST                    │
             └───────────────┬─────────────────┘
                             │
                             ▼
                        PostgreSQL
                         code_notes
```

### Local ports

| Component    |    Host | Container |
| ------------ | ------: | --------: |
| React / Vite |  `5173` |         — |
| Backend      |  `3100` |    `3000` |
| PostgreSQL   | `55432` |    `5432` |

The PostgreSQL host port is `55432` to avoid conflicts with other PostgreSQL installations.

The backend communicates with PostgreSQL through the Docker Compose service name:

```text
postgres:5432
```

It does **not** use `localhost:55432` from inside the container.

---

# 2. Project structure

```text
code-notes/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Article.jsx
│   │   │   └── NewArticle.jsx
│   │   ├── data/
│   │   │   └── articles.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   └── db.js
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── package-lock.json
│
├── docker-compose.yml
├── .env
├── .gitignore
└── README.md
```

---

# 3. Frontend

The frontend is a React application created with Vite.

Current functionality includes:

* displaying articles
* article details
* article categories
* Markdown rendering
* creating a new article UI
* Markdown editor
* live Markdown preview
* React Router navigation

The frontend currently uses React state and local data for some functionality. It will progressively be connected to the backend API.

## Frontend dependencies

Important dependencies include:

* React
* React Router
* `react-markdown`
* `remark-gfm`
* Vite
* ESLint

---

# 4. Backend

The backend is a Node.js application using Express.

Current backend responsibilities:

* expose REST API endpoints
* accept JSON requests
* communicate with PostgreSQL
* provide article data to the frontend

Backend dependencies:

```text
express
cors
dotenv
pg
```

Development dependency:

```text
nodemon
```

---

# 5. Backend scripts

Run these commands from:

```text
code-notes/backend
```

### Start normally

```bash
npm start
```

Runs:

```text
node src/server.js
```

### Development mode

```bash
npm run dev
```

Runs:

```text
nodemon src/server.js
```

Nodemon automatically restarts the backend when source files change.

---

# 6. Frontend scripts

Run these commands from:

```text
code-notes/frontend
```

### Development server

```bash
npm run dev
```

Vite normally starts the frontend at:

```text
http://localhost:5173
```

### Production build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

# 7. PostgreSQL

Code Notes uses a **separate PostgreSQL instance/container**.

It does not use the PostgreSQL database belonging to the other application running on the server.

Docker Compose creates:

```text
Database: code_notes
User:     code_notes
```

PostgreSQL is persisted using a Docker volume:

```text
code_notes_postgres_data
```

This means rebuilding the containers does not delete the database.

---

# 8. Docker Compose

The main Docker Compose file is located at:

```text
code-notes/docker-compose.yml
```

Current configuration:

```yaml
services:
  postgres:
    image: postgres:17
    container_name: code-notes-postgres
    restart: unless-stopped

    environment:
      POSTGRES_DB: code_notes
      POSTGRES_USER: code_notes
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}

    volumes:
      - code_notes_postgres_data:/var/lib/postgresql/data

    ports:
      - "55432:5432"

  backend:
    build:
      context: ./backend
    container_name: code-notes-backend
    restart: unless-stopped

    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: code_notes
      DB_USER: code_notes
      DB_PASSWORD: ${POSTGRES_PASSWORD}

    depends_on:
      - postgres

    ports:
      - "3100:3000"

volumes:
  code_notes_postgres_data:
```

---

# 9. Environment variables

Create:

```text
.env
```

in the project root:

```env
POSTGRES_PASSWORD=code_notes_dev
```

The `.env` file must **not be committed to Git**.

It should be included in `.gitignore`:

```gitignore
.env
node_modules/
```

For production, the database password should be provided securely through the deployment environment rather than committed to the repository.

---

# 10. Start the Docker backend + database

From the project root:

```text
code-notes/
```

run:

```bash
docker compose up -d --build
```

Check running containers:

```bash
docker compose ps
```

Expected containers:

```text
code-notes-postgres
code-notes-backend
```

View backend logs:

```bash
docker compose logs backend
```

Follow logs:

```bash
docker compose logs -f backend
```

---

# 11. Stop Docker containers

To stop and remove the containers:

```bash
docker compose down
```

The PostgreSQL volume is preserved.

To stop containers without removing them:

```bash
docker compose stop
```

### Important

Do not use:

```bash
docker compose down -v
```

unless you intentionally want to remove the PostgreSQL volume and its data.

---

# 12. Database initialization

The current `articles` table was created manually using PostgreSQL.

Connect to the database:

```bash
docker exec -it code-notes-postgres psql -U code_notes -d code_notes
```

Then create the table:

```sql
CREATE TABLE articles (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Verify the table:

```sql
\dt
```

Expected:

```text
articles
```

Exit PostgreSQL:

```sql
\q
```

---

# 13. Articles table

Current schema:

| Column        | Type           | Description              |
| ------------- | -------------- | ------------------------ |
| `id`          | `BIGSERIAL`    | Primary key              |
| `title`       | `VARCHAR(255)` | Article title            |
| `category`    | `VARCHAR(100)` | Article category         |
| `description` | `TEXT`         | Short description        |
| `content`     | `TEXT`         | Markdown article content |
| `created_at`  | `TIMESTAMP`    | Creation timestamp       |
| `updated_at`  | `TIMESTAMP`    | Last update timestamp    |

The `content` column stores the article as Markdown.

This keeps the database simple and allows the frontend to render Markdown using `react-markdown`.

---

# 14. Database connection

The backend uses the PostgreSQL `pg` package.

`backend/src/db.j


docker compose up -d --build
docker compose up -d --build



curl -X POST http://localhost:3100/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "HashMap internals",
    "category": "Java",
    "description": "How HashMap works internally",
    "content": "# HashMap\n\nHashMap stores key-value pairs."
  }'


  enter postgres container

  docker exec -it code-notes-postgres psql -U code_notes -d code_notes
