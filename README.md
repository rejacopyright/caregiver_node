# Prisma + Node.js + SQLite Starter Project

A simple and lightweight backend starter using **Node.js**, **Prisma ORM**, and **SQLite**.  
This setup is ideal for rapid prototyping, small-scale apps, or educational purposes.

## 🚀 Features

- **SQLite** — Lightweight and file-based relational database
- **Prisma ORM** — Type-safe database access and schema management
- **Node.js** — Flexible backend runtime
- **Seed support** — Populate your database with sample data
- **Prisma Studio** — (Optional) visual database browser

---

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
yarn install
```

### 2. Generate Prisma Client

Generate Prisma client based on your schema.

```bash
npx prisma generate
```

### 3. Push Database Schema

Apply the Prisma schema to the SQLite database.

```bash
yarn push
```

### 4. Seed the Database

Populate your database with initial data.

```bash
yarn seed
```

### 5. (Optional) Open Prisma Studio

Use Prisma Studio to explore and manage your database visually.

```bash
npx prisma studio
```

---

## 🧩 Environment Variables

Create a `.env` file in the project root with the following contents:

```env
PORT=4000
DATABASE_URL="file:../../sqlite.db"
```

> ⚠️ Ensure the database file path is correct relative to your project structure.

---

## 🏃 Running the Server

After setup, start your application (example):

```bash
yarn dev
```

Your API should now be running on:

```
http://localhost:4000
```

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Node.js Docs](https://nodejs.org/en/docs/)

---

**Author:** _Your Name_  
**License:** MIT
