# 🍼 Milkies - Complete Breastfeeding & Pumping Tracker

A comprehensive breastfeeding and pumping tracking system with both **mobile app** and **web interface**, backed by a robust REST API.

## 🎯 Overview

Milkies helps breastfeeding parents track pumping sessions and baby feeding to optimize milk supply, build freezer stash, and gain insights into feeding patterns.

### What's Included

✅ **Mobile App** (React Native + Expo)
- Native iOS and Android application
- Push notifications for pump reminders
- Offline support with automatic sync
- Beautiful Material Design UI
- Interactive charts and statistics

✅ **Web Interface** (React)
- Responsive web dashboard
- Real-time data visualization
- Supply vs demand analysis
- Export functionality

✅ **REST API Backend** (Flask + SQLite)
- 12 RESTful endpoints
- Automatic statistics calculation
- Data persistence and migration
- CORS enabled for web/mobile access

✅ **Complete Documentation**
- Quick start guides
- API reference
- Deployment instructions
- Troubleshooting guides

## 📦 Project Structure

```
Milkies/
├── mobile/                          # React Native mobile app
│   ├── App.js                      # Main app entry
│   ├── src/
│   │   ├── screens/                # App screens
│   │   │   ├── PumpingScreen.js
│   │   │   ├── FeedingScreen.js
│   │   │   ├── StatsScreen.js
│   │   │   └── SettingsScreen.js
│   │   └── services/               # API & services
│   │       ├── api.js
│   │       ├── notifications.js
│   │       └── offline.js
│   └── README.md                   # Mobile app docs
│
├── api_server.py                   # Flask REST API
├── milk-supply-tracker-with-api.jsx # React web interface
├── schema.sql                      # Database schema
├── test_api.py                     # API tests
├── GETTING_STARTED.txt            # Quick start guide
└── PROJECT_COMPLETE.md            # Full documentation
```

## 🚀 Quick Start

### 1. Start the Backend API

```bash
# Install Python dependencies (if needed)
pip install flask flask-cors

# Start the API server
python3 api_server.py
```

The API will run on `http://localhost:5000`

### 2. Use the Mobile App

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start Expo development server
npm start
```

Then:
1. Scan QR code with Expo Go app
2. Configure API URL in Settings (use your computer's IP)
3. Start tracking!

### 3. Or Use the Web Interface

Open `milk-supply-tracker-with-api.jsx` in your React development environment or integrate it into a Next.js/Create React App project.

## 📱 Mobile App Features

### Core Features
- 📊 **Real-time Statistics** - Average output, trends, supply analysis
- 📈 **Interactive Charts** - Line and bar charts for visualizing data
- ⏰ **Smart Reminders** - Scheduled pump notifications
- 💾 **Offline Mode** - Cache data and sync when online
- 🎨 **Beautiful UI** - Material Design 3 with React Native Paper
- 🔄 **Pull to Refresh** - Easy data updates

### Screens

**Pumping Screen**
- Track pumping sessions
- View today's progress
- See recent entries
- Monitor trends

**Feeding Screen**
- Log baby feedings
- Track bottle and nursing
- Monitor intake patterns
- Compare to averages

**Statistics Screen**
- 30-day summary stats
- Supply vs intake comparison
- Freezer stash calculations
- Data export

**Settings Screen**
- Configure API connection
- Enable notifications
- Set reminder schedules
- Manage cache

## 🔌 API Endpoints

### Pumping
- `GET /api/pumping` - Get all pumping sessions
- `POST /api/pumping` - Add new session
- `PUT /api/pumping/:id` - Update session
- `DELETE /api/pumping/:id` - Delete session

### Feeding
- `GET /api/feeding` - Get all feedings
- `POST /api/feeding` - Add new feeding
- `PUT /api/feeding/:id` - Update feeding
- `DELETE /api/feeding/:id` - Delete feeding

### Statistics
- `GET /api/stats/daily` - Daily statistics
- `GET /api/stats/summary` - Summary stats
- `GET /api/stats/today` - Today's stats

### Utility
- `GET /api/health` - Health check
- `GET /api/export` - Export all data

## 📊 Your Data

The system comes with sample data showing:
- **12 days** of pumping data
- **6 days** of baby feeding data
- Average: **33.1 oz/day** pumped
- Average: **27.5 oz/day** consumed
- **5.6 oz/day** surplus for freezer stash

## 🎯 Key Statistics Tracked

### Pumping Metrics
- Daily total output
- Average per session
- 7-day rolling average
- Trend analysis (last 3 vs previous 3 days)
- Total sessions count
- Best/worst days

### Feeding Metrics
- Daily intake
- Bottle vs nursing breakdown
- Average consumption
- Growth patterns
- Feeding frequency

### Supply Analysis
- Supply vs demand comparison
- Daily surplus/deficit
- Freezer stash accumulation
- Optimal pump times
- Production trends

## 💡 Usage Tips

### For Best Results

1. **Track Consistently**
   - Log every pump and feeding
   - Enable notifications as reminders
   - Review daily statistics

2. **Monitor Trends**
   - Check 7-day average weekly
   - Watch for supply changes
   - Note factors affecting production

3. **Optimize Supply**
   - Aim for 3-5 oz daily surplus
   - Add pumps if supply drops
   - Track nursing sessions too

4. **Data Management**
   - Export data regularly
   - Review monthly trends
   - Share with healthcare providers

## 🛠️ Development

### Technology Stack

**Mobile App:**
- React Native 0.73
- Expo ~50.0
- React Native Paper 5.x
- React Navigation 6.x
- Chart Kit for visualizations
- AsyncStorage for caching
- Expo Notifications

**Backend:**
- Python 3.x
- Flask web framework
- SQLite database
- CORS enabled

**Web Interface:**
- React 18
- Recharts for graphs
- Tailwind CSS
- Lucide icons

### Running Tests

```bash
# Test the API
python3 test_api.py

# Test mobile app
cd mobile
npm test
```

### Building for Production

#### Mobile App

```bash
cd mobile

# Using Expo classic build
expo build:android
expo build:ios

# Or using EAS Build (recommended)
eas build --platform android
eas build --platform ios
```

#### Backend API

```bash
# Use Gunicorn for production
gunicorn -w 4 -b 0.0.0.0:5000 api_server:app
```

## 🚀 Deployment

### Mobile App
- Deploy via Expo Application Services (EAS)
- Publish to App Store and Google Play
- Or share via Expo Go for testing

### Backend API
- **Render.com** (recommended) - Free tier available
- **Heroku** - Easy deployment
- **AWS/GCP** - Scalable options
- **DigitalOcean** - VPS option

### Database
- SQLite (included, perfect for single user)
- PostgreSQL (for production/multi-user)
- MySQL (alternative option)

## 📚 Documentation

- **mobile/README.md** - Comprehensive mobile app guide
- **GETTING_STARTED.txt** - Quick start instructions
- **PROJECT_COMPLETE.md** - Full project documentation
- **schema.sql** - Database structure
- **API inline docs** - See api_server.py

## 🐛 Troubleshooting

### Mobile App Can't Connect

1. Use your computer's **IP address**, not `localhost`
2. Ensure phone and computer on **same WiFi**
3. Check **firewall** allows port 5000
4. Test API: `http://YOUR_IP:5000/api/health`

### Data Not Syncing

1. Check API server is running
2. Test connection in Settings
3. Check network connectivity
4. Review app logs
5. Clear cache and retry

### Notifications Not Working

1. Grant permissions in device settings
2. Enable in app Settings
3. Check Expo Go notification permissions
4. Restart app after enabling

## 🔒 Security & Privacy

- All data stored locally on your server
- No third-party data sharing
- Complete data ownership
- Export data anytime
- Optional authentication (add JWT)

## 🎓 Learning Resources

- **React Native**: https://reactnative.dev
- **Expo**: https://docs.expo.dev
- **Flask**: https://flask.palletsprojects.com
- **React Native Paper**: https://callstack.github.io/react-native-paper

## 🗺️ Roadmap

### Version 2.0 (Next)
- [ ] User authentication (JWT)
- [ ] Multi-user support
- [ ] Cloud sync option
- [ ] Apple Watch / Wear OS
- [ ] Widget support

### Version 3.0 (Future)
- [ ] AI-powered insights
- [ ] Smart pump integration
- [ ] Healthcare provider portal
- [ ] Predictive analytics
- [ ] Community features

## 💰 Cost

### Free Tier
- Expo Go for development: **Free**
- Render.com backend: **Free tier available**
- SQLite database: **Free**
- **Total: $0/month**

### Production
- Expo EAS Build: ~$29/month
- Render.com Pro: $25/month
- Domain: ~$12/year
- **Total: ~$55/month** (supports 10,000+ users)

## 🤝 Contributing

This is a personal project, but feel free to:
- Fork and customize
- Report issues
- Suggest features
- Share improvements

## 📄 License

Personal use project. Feel free to modify and extend for your needs.

## 🙏 Acknowledgments

Built for breastfeeding parents everywhere who are working hard to provide for their babies.

Special thanks to:
- The React Native community
- Expo team for amazing tools
- Flask community
- All the open source contributors

## 📞 Support

- Check troubleshooting sections in documentation
- Review API logs for errors
- Test API connection in mobile Settings
- Ensure you're running latest versions

## 🎉 Success Stories

Your data shows:
- ✅ Consistent tracking over 12 days
- ✅ Healthy 5.6 oz/day surplus
- ✅ Excellent supply above baby's needs
- ✅ Building a strong freezer stash

Keep up the great work! 🎊

---

**Built with ❤️ for breastfeeding parents**

Version 1.0.0 • November 2025

Get started now:
```bash
# Terminal 1: Start backend
python3 api_server.py

# Terminal 2: Start mobile app
cd mobile && npm start
```

Happy tracking! 🍼
