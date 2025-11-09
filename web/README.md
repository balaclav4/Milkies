# 🌐 Milkies Web App

A Next.js web application for tracking breastfeeding and pumping sessions.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- API server running (see main README)

### Installation

```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

## ⚙️ Configuration

### API Connection

The app connects to your Flask API backend. For local development:

1. Make sure the API server is running:
   ```bash
   cd /home/user/Milkies
   python3 api_server.py
   ```

2. The Next.js app will automatically proxy `/api` requests to `http://localhost:5000/api`

### Environment Variables

Create `.env.local` for custom configuration:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📦 Build for Production

```bash
# Create production build
npm run build

# Run production server
npm start
```

## 🌍 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Configure Environment Variables:**
   - Go to your Vercel dashboard
   - Add `NEXT_PUBLIC_API_URL` with your production API URL
   - Redeploy

### Deploy to Netlify

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod --dir=.next
   ```

### Deploy with Docker

```bash
# Build Docker image
docker build -t milkies-web .

# Run container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://your-api-url milkies-web
```

## 📁 Project Structure

```
web/
├── components/
│   └── MilkSupplyTracker.jsx    # Main tracker component
├── pages/
│   ├── _app.js                  # App wrapper
│   ├── _document.js             # Document template
│   └── index.js                 # Home page
├── public/                      # Static files
├── styles/
│   └── globals.css              # Global styles with Tailwind
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS config
└── package.json                 # Dependencies
```

## 🎨 Features

- ✅ Track pumping sessions
- ✅ Track baby feedings
- ✅ Real-time statistics
- ✅ Interactive charts (Recharts)
- ✅ Responsive design (Tailwind CSS)
- ✅ Export data
- ✅ Server-side rendering with Next.js
- ✅ Optimized for production

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Hot Reload

Changes to components and pages will auto-reload in development mode.

## 🐛 Troubleshooting

### "Failed to fetch" errors

1. Check API server is running:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. Verify Next.js proxy configuration in `next.config.js`

3. Check browser console for CORS errors

### Build errors

1. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run build
   ```

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```

## 🚀 Production Deployment Checklist

- [ ] Set `NEXT_PUBLIC_API_URL` environment variable
- [ ] Build and test locally (`npm run build && npm start`)
- [ ] Configure CORS on API server for your domain
- [ ] Set up SSL/HTTPS
- [ ] Configure CDN (automatic with Vercel/Netlify)
- [ ] Set up monitoring
- [ ] Configure backups

## 📊 Performance

- Server-side rendering for fast initial load
- Automatic code splitting
- Optimized images and fonts
- Static generation where possible

## 🔒 Security

- Environment variables for sensitive config
- HTTPS in production
- API requests proxied through Next.js
- No sensitive data in client code

## 📱 Mobile Responsive

The web app is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones

## 🆘 Support

For issues specific to the web app:
1. Check this README
2. Review Next.js documentation
3. Check the main project README

---

**Built with Next.js, React, and Tailwind CSS**
