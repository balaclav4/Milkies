# 🍼 Milkies - Breastfeeding & Pumping Mobile App

A comprehensive React Native mobile application for tracking breastfeeding and pumping sessions, built with Expo.

## 📱 Features

### Core Functionality
- ✅ Track pumping sessions with date, time, and amount
- ✅ Track baby feeding sessions with nursing indicator
- ✅ Real-time statistics and analytics
- ✅ Beautiful charts and visualizations
- ✅ Supply vs intake comparison
- ✅ Trend analysis and insights

### Mobile-Specific Features
- 📱 Native iOS and Android support
- 🔔 Push notifications for pump reminders
- 💾 Offline data caching
- 📊 Interactive charts and graphs
- 🎨 Material Design 3 UI (React Native Paper)
- 🔄 Pull-to-refresh functionality
- ⚡ Fast and responsive

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v16 or later)
   ```bash
   node --version  # Should be 16+
   ```

2. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

3. **Expo Go App** on your phone
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

4. **Backend API Running**
   - The Flask API server must be running (see main README)
   - Note your computer's local IP address

### Installation

1. **Navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Open on your device**
   - Scan the QR code with Expo Go app (Android)
   - Scan the QR code with Camera app (iOS)

## ⚙️ Configuration

### API Server Setup

The app needs to connect to your Flask API backend.

#### Finding Your Computer's IP Address

**On macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
```

Look for your local IP (usually starts with 192.168.x.x or 10.0.x.x)

#### Configure the API URL

1. Open the app
2. Go to **Settings** tab
3. Enter your API URL in this format:
   ```
   http://YOUR_IP_ADDRESS:5000/api
   ```
   Example: `http://192.168.1.100:5000/api`

4. Tap **Test Connection** to verify
5. Tap **Save URL** to save the configuration

### Enable Notifications (Optional)

1. Go to **Settings** tab
2. Enable **Notifications**
3. Grant permission when prompted
4. Enable **Pump Reminders**
5. Set your preferred reminder interval

## 📂 Project Structure

```
mobile/
├── App.js                          # Main app entry point
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── babel.config.js                 # Babel configuration
│
├── src/
│   ├── screens/                    # App screens
│   │   ├── PumpingScreen.js       # Pumping tracking
│   │   ├── FeedingScreen.js       # Baby feeding tracking
│   │   ├── StatsScreen.js         # Statistics & charts
│   │   └── SettingsScreen.js      # App settings
│   │
│   └── services/                   # Business logic
│       ├── api.js                 # API client service
│       ├── notifications.js       # Notification service
│       └── offline.js             # Offline support
│
└── assets/                         # Images and icons
```

## 🎨 App Screens

### 1. Pumping Screen
- View today's pumping progress
- See key statistics (average, trend, total days)
- Add new pump sessions
- View and delete recent entries
- Pull to refresh data

### 2. Feeding Screen
- Track baby's intake
- Monitor feeding patterns
- Add feedings with nursing indicator
- Compare intake to average
- Delete entries

### 3. Statistics Screen
- View 30-day summary statistics
- Interactive line and bar charts
- Supply vs intake analysis
- Freezer stash calculations
- Export data functionality

### 4. Settings Screen
- Configure API server URL
- Test API connection
- Enable/disable notifications
- Set pump reminder schedules
- Clear local cache
- View app information

## 🔔 Notifications

The app supports intelligent notifications:

### Pump Reminders
- Scheduled at regular intervals
- Default times: 6am, 9am, 12pm, 3pm, 6pm, 9pm
- Customizable reminder frequency

### Smart Alerts
- Daily goal achievement notifications
- Low supply alerts
- Milestone celebrations (100oz, 500oz, 1000oz, etc.)

## 💾 Offline Support

The app includes robust offline capabilities:

- **Automatic caching** of API responses
- **Offline queue** for pending operations
- **Auto-sync** when connection restored
- **24-hour cache validity**
- Manual cache clearing in Settings

## 📊 Data & Privacy

- All data is stored on your Flask API server
- Local caching for offline access
- No data sent to third parties
- Export your data anytime
- Complete data ownership

## 🛠️ Development

### Running in Development

```bash
# Start Expo dev server
npm start

# Run on Android emulator
npm run android

# Run on iOS simulator (macOS only)
npm run ios

# Run in web browser
npm run web
```

### Building for Production

#### Android (APK)

```bash
# Build APK
expo build:android

# Or build App Bundle for Google Play
expo build:android -t app-bundle
```

#### iOS (IPA)

```bash
# Build for iOS
expo build:ios
```

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## 📦 Dependencies

### Core Dependencies
- **expo** - Universal React Native platform
- **react-native** - Mobile framework
- **react-native-paper** - Material Design components
- **@react-navigation** - Navigation library

### Data & Charts
- **axios** - HTTP client
- **react-native-chart-kit** - Charts and graphs
- **date-fns** - Date manipulation

### Storage & Notifications
- **@react-native-async-storage/async-storage** - Local storage
- **expo-notifications** - Push notifications
- **@react-native-community/netinfo** - Network status

## 🐛 Troubleshooting

### Cannot Connect to API

1. **Check API server is running**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Verify you're using IP address, not localhost**
   - ❌ Wrong: `http://localhost:5000/api`
   - ✅ Correct: `http://192.168.1.100:5000/api`

3. **Ensure phone and computer on same WiFi network**

4. **Check firewall settings**
   - Allow incoming connections on port 5000
   - Temporarily disable firewall to test

### App Won't Start

1. **Clear cache and restart**
   ```bash
   expo start -c
   ```

2. **Reinstall dependencies**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Update Expo CLI**
   ```bash
   npm install -g expo-cli@latest
   ```

### Notifications Not Working

1. **Check permissions in device settings**
2. **Ensure notifications enabled in app Settings**
3. **Restart the app after enabling**
4. **Check Expo Go app notification permissions**

### Charts Not Displaying

1. **Ensure you have data tracked**
2. **Pull to refresh the screen**
3. **Check API connection in Settings**
4. **Verify data exists in backend**

## 🔄 Syncing with Backend

### Starting the Backend

Before using the mobile app, start the Flask API:

```bash
# In the main project directory
python3 api_server.py
```

The API should be running on `http://0.0.0.0:5000`

### Data Flow

1. Mobile app → API server → SQLite database
2. All data persists on the server
3. Mobile app caches data locally
4. Automatic sync when online

## 📱 Platform-Specific Notes

### iOS
- Requires iOS 13.0 or later
- Notification permissions must be granted
- Camera access needed for QR code scanning

### Android
- Requires Android 5.0 or later
- Notification channel automatically created
- Background notification support

## 🚀 Deployment Options

### 1. Expo Go (Testing)
- Use Expo Go app for development
- Easy sharing via QR code
- No build required

### 2. Standalone App (Production)

#### Option A: Classic Build
```bash
expo build:android
expo build:ios
```

#### Option B: EAS Build (Recommended)
```bash
eas build --platform android
eas build --platform ios
```

### 3. Publishing Updates

After building, you can publish JavaScript updates:

```bash
expo publish
```

Users will automatically receive updates without reinstalling.

## 🎯 Next Steps

### Immediate
- [ ] Connect to your API server
- [ ] Add your first pump session
- [ ] Enable notifications
- [ ] Explore the statistics

### This Week
- [ ] Track consistently for 7 days
- [ ] Review your trends
- [ ] Customize notification schedule
- [ ] Export your data for backup

### Future Enhancements
- [ ] Widget support
- [ ] Apple Watch / Wear OS app
- [ ] Integration with smart breast pumps
- [ ] Sharing with healthcare providers
- [ ] Multi-user/family support

## 💡 Tips for Best Results

1. **Track Consistently**
   - Log every pump and feeding session
   - Use notifications as reminders
   - Review stats daily

2. **Monitor Trends**
   - Check your 7-day average weekly
   - Watch for supply dips
   - Celebrate milestones

3. **Optimize Supply**
   - Aim for 3-5 oz daily surplus
   - Track nursing sessions too
   - Note factors affecting supply

4. **Data Management**
   - Export data weekly
   - Keep backups
   - Clear cache monthly

## 🆘 Getting Help

### Resources
- **Expo Documentation**: https://docs.expo.dev
- **React Native Paper**: https://callstack.github.io/react-native-paper
- **React Navigation**: https://reactnavigation.org

### Support
- Check troubleshooting section above
- Review API server logs
- Test API connection in Settings
- Ensure latest Expo Go version

## 📄 License

This project is built for personal use. Feel free to customize and extend!

## 🙏 Credits

Built with:
- React Native & Expo
- React Native Paper (Material Design)
- React Navigation
- Chart Kit
- Love and caffeine ☕

---

**Built with ❤️ for breastfeeding parents**

Version 1.0.0 • November 2025
