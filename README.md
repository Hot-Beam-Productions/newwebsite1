# Hot Beam Productions — Website

Denver-based event production company website built with Next.js and Sanity CMS.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion
- **CMS:** Sanity.io (headless)
- **Icons:** Lucide React
- **Forms:** React Hook Form

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Sanity CMS

1. Go to [sanity.io/manage](https://www.sanity.io/manage) and create a new project
2. Copy your **Project ID**
3. Open `.env.local` and replace `your_project_id_here` with your actual Project ID:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

4. In your Sanity project settings, add `http://localhost:3000` to the CORS origins

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

### 4. Open the Admin Dashboard

Navigate to [http://localhost:3000/studio](http://localhost:3000/studio) to access the Sanity Studio admin panel. From here you can:

- **Upload project photos** — Go to "Project" and create entries with images, descriptions, and service tags
- **Manage rental inventory** — Go to "Rental Item" to add/edit gear with pricing, specs, and categories
- **Edit home page content** — Go to "Home Page" to change the hero text, upload a background video, etc.

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Home page
│   ├── layout.tsx        # Root layout (Navbar + Footer)
│   ├── globals.css       # Design system & custom CSS
│   ├── work/             # Portfolio page
│   ├── rentals/          # Gear rental catalog
│   ├── about/            # About page
│   ├── contact/          # Quote request form
│   └── studio/           # Embedded Sanity Studio (admin)
├── components/
│   ├── navbar.tsx         # Sticky glassmorphism navbar
│   ├── footer.tsx         # Site footer
│   ├── glow-button.tsx    # Button with glow hover effect
│   └── section-heading.tsx # Animated section headers
└── lib/
    └── utils.ts           # cn() utility (clsx + tailwind-merge)

sanity/
├── schemas/
│   ├── project.ts        # Portfolio project schema
│   ├── rental-item.ts    # Rental inventory schema
│   ├── home-page.ts      # Home page content schema
│   └── index.ts          # Schema exports
├── lib/
│   ├── client.ts         # Sanity client
│   ├── image.ts          # Image URL builder
│   └── queries.ts        # GROQ queries
└── env.ts                # Environment variables
```

## Content Management (For the Client)

### Adding a Portfolio Project

1. Go to `/studio` in your browser
2. Click "Project" in the sidebar
3. Click the "+" button to create a new project
4. Fill in: Title, Main Image, Gallery photos, Client Name, Service Tags, Description
5. Click "Publish"

### Adding Rental Equipment

1. Go to `/studio`
2. Click "Rental Item"
3. Click "+" to add a new item
4. Fill in: Name, Category, Image, Daily Rate, Brand, Specs, Description
5. Click "Publish"

### Editing the Home Page

1. Go to `/studio`
2. Click "Home Page"
3. Edit the hero headline, subheadline, or upload a new background video
4. Click "Publish"

## Deployment

Deploy on [Vercel](https://vercel.com) — add the same environment variables from `.env.local` to your Vercel project settings.
