# 🍼 Milkies - Complete Breastfeeding & Pumping Tracker

A comprehensive system for tracking breastfeeding and pumping with **web app**, **mobile app**, and **REST API backend**.

## 🎯 What You Get

✅ **Web App** (Next.js) - Browser-based interface for desktop/laptop  
✅ **Mobile App** (React Native + Expo) - Native iOS & Android app  
✅ **REST API** (Flask + SQLite) - Backend server for data storage  

Both apps sync through the same API backend!

---

## 🚀 Quick Start

**📖 Full Setup Guide:** See [SETUP_GUIDE.md](SETUP_GUIDE.md) for complete step-by-step instructions.

### 1. Start the API Server

```bash
cd /home/user/Milkies
pip3 install flask flask-cors
python3 api_server.py
```

### 2. Choose Your Interface

**🌐 Web App** (for desktop/laptop):
```bash
cd web
npm install
npm run dev
```
Open http://localhost:3000

**📱 Mobile App** (for phone):
```bash
cd mobile
npm install
npm start
```
Then scan QR code with Expo Go app

**💡 Use Both!** They work together seamlessly.

---

## 📦 Project Structure

```
Milkies/
├── web/                    # Next.js web application
│   ├── components/        # React components
│   ├── pages/            # Next.js pages
│   └── README.md         # Web app docs
│
├── mobile/                # React Native mobile app
│   ├── src/
│   │   ├── screens/      # App screens
│   │   └── services/     # API & services
│   └── README.md         # Mobile app docs
│
├── api_server.py         # Flask REST API
├── schema.sql           # Database schema
├── SETUP_GUIDE.md       # Complete setup guide ⭐
└── PROJECT_COMPLETE.md  # Full documentation
```

---

## ✨ Features

### Web App
- 📊 Large screen charts and visualizations
- 💻 Desktop-optimized interface
- 📈 Detailed analytics
- 🖨️ Easy printing and exports

### Mobile App
- 📱 Native iOS & Android
- 🔔 Push notifications for pump reminders
- 💾 Offline support with auto-sync
- 🎨 Material Design UI

### Both Apps
- Track pumping sessions
- Track baby feedings
- Real-time statistics
- Trend analysis
- Export data
- Supply vs intake comparison

---

## 🔌 API Endpoints

- `GET/POST/PUT/DELETE /api/pumping` - Pumping sessions
- `GET/POST/PUT/DELETE /api/feeding` - Baby feedings
- `GET /api/stats/daily` - Daily statistics
- `GET /api/stats/summary` - Summary stats
- `GET /api/stats/today` - Today's stats
- `GET /api/export` - Export all data

---

## 🌍 Deployment

### Web App
- **Vercel** (recommended): `vercel`
- **Netlify**: `netlify deploy`
- **Docker**: See web/README.md

### Mobile App
- **Expo EAS**: `eas build`
- **App Store/Play Store**: See mobile/README.md

### Backend API
- **Render.com** (recommended)
- **Heroku**
- **AWS/GCP**

---

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup instructions ⭐
- **[web/README.md](web/README.md)** - Web app specific docs
- **[mobile/README.md](mobile/README.md)** - Mobile app specific docs
- **[PROJECT_COMPLETE.md](PROJECT_COMPLETE.md)** - Full project documentation

---

## 🐛 Troubleshooting

**Web app won't load:**
- Check API server is running
- Visit http://localhost:3000
- Check browser console (F12)

**Mobile app "Page not found":**
- Use your computer's IP address, NOT `localhost`
- Example: `http://192.168.1.100:5000/api`
- Phone and computer must be on same WiFi
- Configure in Settings tab

**"Cannot connect to API":**
- Verify API is running: `curl http://localhost:5000/api/health`
- Check firewall allows port 5000
- See [SETUP_GUIDE.md](SETUP_GUIDE.md) troubleshooting section

---

## 💡 Usage Tips

1. **Start with the web app** to see it working quickly
2. **Set up mobile app** for on-the-go tracking
3. **Enable notifications** in mobile Settings for pump reminders
4. **Export data regularly** for backups
5. **Monitor trends** in the Stats tab

---

## 🛠️ Technology Stack

**Web:** Next.js, React, Recharts, Tailwind CSS  
**Mobile:** React Native, Expo, React Native Paper  
**Backend:** Python, Flask, SQLite  

---

## 📊 Sample Data

The system includes sample tracking data showing:
- 12 days of pumping sessions
- 6 days of baby feeding
- Average 33.1 oz/day pumped
- 5.6 oz/day surplus for freezer stash

---

## 🎉 Get Started Now!

```bash
# Terminal 1: Start backend
cd /home/user/Milkies
python3 api_server.py

# Terminal 2: Start web app
cd /home/user/Milkies/web
npm install && npm run dev

# Terminal 3: Start mobile app
cd /home/user/Milkies/mobile
npm install && npm start
```

**Then:**
- Web: Visit http://localhost:3000
- Mobile: Scan QR with Expo Go app

---

**Built with ❤️ for breastfeeding parents**

Version 1.0.0 • November 2025
