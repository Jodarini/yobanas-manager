# Stock It (Yobanas Manager)

**Stock It** (also known as Yobanas Manager) is a mobile-first SaaS solution designed specifically for fashion retailers in Colombia to manage inventory, track sales, and analyze product performance. Built with a modern full-stack architecture, it empowers entrepreneurs to scale from simple inventory tracking to full business analytics with integrated payment processing.

## Tech Stack

This project leverages a cutting-edge, type-safe stack for maximum performance and developer productivity:

| Category | Technology |
| :--- | :--- |
| **Framework** | **Nuxt 4** & Vue 3 (Composition API)  |
| **Language** | **TypeScript**  |
| **Styling & UI** | **Tailwind CSS**, **shadcn-vue**, and Lucide Icons  |
| **Database** | **PostgreSQL** with **Supabase** (Row-Level Security)  |
| **ORM** | **Drizzle ORM** |
| **State/Tables** | **Pinia** and **TanStack Table**  |
| **Payments** | **Wompi** (for Colombian market) |
| **Deployment** | **Vercel**  |

## Core Features

- **Advanced Inventory Management:** Track stock levels with support for product variants such as size and color.
- **Sales & Analytics:** Monitor best-sellers and overall revenue through a dedicated analytics dashboard.
- **Multi-tenant Security:** Utilizes Supabase Row-Level Security (RLS) to ensure data isolation between different retail accounts.
- **Subscription Tiers:** Integrated business model featuring Free, Entrepreneur, and Company plans with automated payment webhooks.
- **Soft Deletes:** Maintain data integrity and historical sales records even when products are removed from the active catalog.
- **Mobile-First Design:** Optimized for high-speed usage on mobile devices, perfect for on-the-floor retail management.

## Getting Started

### Prerequisites
- Node.js (Latest LTS)
- Supabase CLI
- Docker (for local Supabase development)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jodarini/yobanas-manager.git
   cd yobanas-manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   Create a `.env` file based on the provided configuration:
   ```bash
   NUXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NUXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
   DATABASE_URL=your_postgresql_connection_string
   ```

4. **Initialize local database & Drizzle:**
   ```bash
   npx supabase start
   npx drizzle-kit push
   npm run seed # Runs the custom db/seed.ts script [conversation_history:11]
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

## Project Structure

- `db/`: Database schemas defined with Drizzle and seeding scripts.
- `composables/`: Shared logic for state management and form handling.
- `components/ui/`: High-quality accessible components built with **shadcn-vue**.
- `server/api/`: Nitro server routes for handling webhooks (Wompi) and complex DB operations.
