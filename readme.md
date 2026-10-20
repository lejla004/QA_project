# Online Book Store: App + QA Automation

Full-stack bookstore (React, Node/Express, MySQL) built as a QA practice
project, plus the QA assets used to test it: test plan, test cases,
Playwright UI tests (POM), Axios API tests, Postman collection and Jenkinsfile.



## Requirements

Node.js 18+, MySQL 8, MySQL Workbench, VS Code.

## Run the app

**1. Database** (MySQL Workbench: File > Open SQL Script > Execute), in order:
`bookstore/database/schema.sql`, then `bookstore/database/seed.sql`

**2. Backend**

```bash
cd bookstore/backend
   
npm install
npm start
```

Set these in `backend/.env`:

```
DB_USER=root
DB_PASSWORD=your_mysql_password   # empty if root has no password
DB_NAME=bookstore
JWT_SECRET=any_long_random_string # you invent this
```

.

**3. Frontend** 

```bash
cd bookstore/frontend
npm install
npm start
```

Opens at http://localhost:3000

## Credentials

| Role     | Email                  | Password     |
|----------|------------------------|--------------|
| Admin    | admin@bookstore.com    | Admin123!    |
| Customer | customer@bookstore.com | Customer123! |

## API overview

Base URL: `http://localhost:5000/api`


## Run the tests

```bash
cd qa-automation

npm install
npx playwright install chromium
```

