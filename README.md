# Smart Product Price Tracker

Track product prices across e-commerce sites and get alerts on price drops. Built with Next.js, Firecrawl, and Supabase.

## Features

- 🔍 Track products from any e-commerce site
- 📊 View price history with interactive charts
- 🔐 Secure Google authentication
- ⚡ Lightning-fast scraping powered by Firecrawl
- 🔄 Automated daily price checks
- 📱 Responsive design with shadcn/ui

## Tech Stack

- **Next.js 14** - React framework with App Router
- **Firecrawl** - Web data extraction API (handles JS rendering, proxies, anti-bot)
- **Supabase** - Database, Authentication, Row Level Security
- **shadcn/ui** - Beautiful UI components
- **Recharts** - Price history charts
- **Tailwind CSS** - Styling

## Prerequisites

- Node.js 18+ installed
- Supabase account
- Firecrawl account
- Google OAuth credentials

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo>
cd price-tracker
npm install
```

### 2. Supabase Setup

1. **Create a new project** at [supabase.com](https://supabase.com)

2. **Run database migrations:**

   - Go to SQL Editor in your Supabase dashboard
   - Copy and run `supabase/migrations/001_schema.sql`
   - Copy and run `supabase/migrations/002_setup_cron.sql`

3. **Enable Google Authentication:**

   - Go to Authentication > Providers
   - Enable Google provider
   - Get OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
   - Add authorized redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`

4. **Get API credentials:**
   - Go to Settings > API
   - Copy your Project URL and anon/public key

### 3. Firecrawl Setup

1. Sign up at [firecrawl.dev](https://firecrawl.dev)
2. Get your API key from the dashboard

### 4. Environment Variables

Create `.env.local` in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
```

### 5. Install shadcn/ui Components

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input dialog badge alert
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. **User adds product**: Paste any e-commerce URL
2. **Firecrawl scrapes**: Extracts product name, price, image instantly
3. **Data stored**: Saved to Supabase with Row Level Security
4. **Daily checks**: Supabase cron job triggers price checks
5. **Price updates**: History tracked and displayed in charts
6. **Alerts**: Future feature - notify on price drops

## Why Firecrawl?

Firecrawl handles the complex parts of web scraping:

- ✅ JavaScript rendering for dynamic sites
- ✅ Rotating proxies to avoid blocks
- ✅ Anti-bot detection bypass
- ✅ Structured data extraction with AI
- ✅ Works across different e-commerce sites

No need to maintain fragile site-specific scrapers!

## Project Structure

```
price-tracker/
├── app/                    # Next.js app directory
│   ├── actions.js         # Server actions
│   ├── page.js            # Home page
│   └── auth/              # Auth callback
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── AddProductForm.js
│   ├── ProductCard.js
│   ├── PriceChart.js
│   └── AuthModal.js
├── utils/
│   └── supabase/         # Supabase clients
│       ├── client.js     # Browser client
│       ├── server.js     # Server client
│       └── middleware.js # Session refresh
├── lib/
│   ├── firecrawl.js      # Firecrawl integration
│   └── utils.js          # Utility functions
└── supabase/
    └── migrations/       # Database schema
```

## Deployment

### Deploy to Vercel

```bash
npm run build
vercel deploy
```

Add environment variables in Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `FIRECRAWL_API_KEY`

Update Google OAuth redirect URI to include your Vercel domain.

## Future Improvements

- [ ] Email alerts on price drops
- [ ] Price drop threshold settings
- [ ] Browser extension

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

MIT

## Support

For issues, please open a GitHub issue or contact support.
