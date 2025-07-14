
<!-- Banner -->
<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=28&pause=1000&color=1A56DB&center=true&vCenter=true&width=600&lines=InventSmart+AI+%F0%9F%A7%A0+%7C+AI-Powered+Inventory+%26+Sales+Manager"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.3.3-black?logo=nextdotjs&style=for-the-badge"/>
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&style=for-the-badge&logoColor=black"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.3.3-38BDF8?logo=tailwindcss&style=for-the-badge"/>
  <img src="https://img.shields.io/badge/AI_Gemini-Google-4285F4?logo=google&style=for-the-badge"/>
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&style=for-the-badge"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge"/>
</p>

---

# 🚀 InventSmart AI

> <span style="font-size:1.2em;">✨ <b>AI-Powered Inventory & Sales Management System</b> ✨</span>

InventSmart AI is a modern, full-stack inventory and sales management platform supercharged with AI analytics and natural language querying. Track products, manage sales, generate beautiful reports, and get instant insights with the power of Google Gemini AI.

---

## 🌟 Features

- 📊 **Dashboard** — Real-time revenue, inventory value, sales, and low stock alerts
- 📦 **Inventory Management** — Add, edit, delete, and view products with live stock tracking
- 🛒 **Sales Management** — Record, view, and manage sales transactions
- 🤖 **AI Query Console** — Ask natural language questions and get instant, AI-generated insights and SQL
- 📈 **Reports** — Generate and download detailed sales/inventory reports (PDF/CSV)
- 🛠️ **Settings** — Customize company info, currency, notifications, backup, and more
- 🔔 **Notifications** — Low stock and important event alerts
- 🌗 **Theme Support** — Light, dark, and system themes
- 💾 **Data Backup & Restore** — Export/import your database for safety and migration

---

## 🛠️ Tech Stack

| Frontend | Backend | AI | Data | UI/UX |
|:--------:|:-------:|:--:|:----:|:-----:|
| ![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react) <br> ![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?logo=nextdotjs) <br> ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.3.3-38BDF8?logo=tailwindcss) | ![Next.js API](https://img.shields.io/badge/API-Next.js-informational?logo=nextdotjs) <br> ![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql) | ![Gemini](https://img.shields.io/badge/AI-Gemini-4285F4?logo=google) <br> ![Zod](https://img.shields.io/badge/Validation-Zod-8E44AD?logo=zod) | ![Recharts](https://img.shields.io/badge/Charts-Recharts-FF6384?logo=recharts) <br> ![html2pdf.js](https://img.shields.io/badge/PDF-html2pdf.js-FFB300?logo=adobeacrobatreader) | ![Radix UI](https://img.shields.io/badge/Radix_UI-1.2.0-FF61A6?logo=radixui) <br> ![Lucide](https://img.shields.io/badge/Icons-Lucide-1E293B?logo=lucide) |

---

## 🗄️ Database Schema

<details>
<summary><b>Click to expand</b></summary>

### <kbd>products</kbd>
| Field       | Type         | Description                       |
|-------------|--------------|-----------------------------------|
| id          | VARCHAR(36)  | Primary Key                       |
| name        | VARCHAR(255) | Product name (unique)             |
| description | TEXT         | Product description               |
| category    | VARCHAR(100) | Product category                  |
| price       | DECIMAL(10,2)| Unit price                        |
| stock       | INT          | Current stock                     |
| minStock    | INT          | Minimum stock for alerts          |
| supplier    | VARCHAR(255) | Supplier name                     |
| createdAt   | DATETIME     | Creation timestamp                |
| updatedAt   | DATETIME     | Last update timestamp             |

### <kbd>sales</kbd>
| Field       | Type         | Description                       |
|-------------|--------------|-----------------------------------|
| id          | VARCHAR(36)  | Primary Key                       |
| productId   | VARCHAR(36)  | Foreign Key to products           |
| productName | VARCHAR(255) | Product name                      |
| quantity    | INT          | Quantity sold                     |
| price       | DECIMAL(10,2)| Unit price at sale                |
| total       | DECIMAL(10,2)| Total sale amount                 |
| date        | DATETIME     | Sale date                         |
| customer    | VARCHAR(255) | Customer name (default: Anonymous)|

### <kbd>settings</kbd>
| Field         | Type         | Description                       |
|---------------|--------------|-----------------------------------|
| id            | VARCHAR(36)  | Primary Key                       |
| setting_key   | VARCHAR(255) | Unique key                        |
| value         | TEXT         | Value                             |
| type          | VARCHAR(50)  | Data type                         |
| description   | TEXT         | Description                       |
| isEncrypted   | BOOLEAN      | Is value encrypted?               |
| createdAt     | DATETIME     | Creation timestamp                |
| updatedAt     | DATETIME     | Last update timestamp             |

</details>

---

## 🚦 Quick Start

```sh
# 1. Clone the repo
$ git clone <repo-url>
$ cd Ai_Inventory

# 2. Install dependencies
$ npm install

# 3. Configure environment variables
$ cp .env.example .env
# Edit .env with your MySQL & Google API credentials

# 4. Run the app
$ npm run dev
# Visit http://localhost:3000
```

---

## 🧠 AI Query Console

> 🤖 <b>Ask questions like:</b>
> - What are our top 5 selling products?
> - Which products are running low on stock?
> - Show me the total sales for this month.

- The AI will analyze your data, generate insights, and even provide SQL queries for data modifications.
- Responses are formatted with tables, lists, and markdown for clarity.

---



## 📂 Project Structure

```text
app/
  api/           # API routes (AI, DB)
  inventory/     # Inventory management UI
  sales/         # Sales management UI
  query/         # AI query console
  reports/       # Reporting UI
  settings/      # Settings UI
components/      # Reusable UI components
lib/             # Data fetching, context, types, utils
hooks/           # Custom React hooks
public/          # Static assets
```

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Made By Rivalcoder