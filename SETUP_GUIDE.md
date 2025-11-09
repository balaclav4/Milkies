# 🚀 Complete Setup Guide - Milkies Tracker

This guide will help you set up **both** the web app and mobile app.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend API Setup](#backend-api-setup)
3. [Web App Setup](#web-app-setup)
4. [Mobile App Setup](#mobile-app-setup)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have:

### For Backend API:
- ✅ Python 3.8 or later
- ✅ pip (Python package manager)

### For Web App:
- ✅ Node.js 16 or later
- ✅ npm or yarn

### For Mobile App:
- ✅ Node.js 16 or later
- ✅ Expo Go app on your phone
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## Backend API Setup

The API server must be running for both web and mobile apps to work.

### Step 1: Install Python Dependencies

```bash
cd /home/user/Milkies
pip3 install flask flask-cors
```

### Step 2: Start the API Server

```bash
python3 api_server.py
```

You should see:
```
🚀 Starting Milk Tracker API Server
📍 URL: http://localhost:5000
```

### Step 3: Verify API is Running

Open a new terminal and test:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "message": "Milk Tracker API is running"
}
```

✅ **API Setup Complete!**

---

## Web App Setup

### Step 1: Navigate to Web Directory

```bash
cd /home/user/Milkies/web
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Next.js (React framework)
- Recharts (for charts)
- Lucide React (icons)
- Tailwind CSS (styling)

### Step 3: Start Development Server

```bash
npm run dev
```

### Step 4: Open in Browser

Visit: **http://localhost:3000**

You should see the Milkies tracker interface!

### Step 5: Test the Web App

1. Click "Pumping" tab
2. Add a new pump session
3. Check the statistics update
4. View charts in the comparison tab

✅ **Web App Setup Complete!**

---

## Mobile App Setup

### Step 1: Navigate to Mobile Directory

```bash
cd /home/user/Milkies/mobile
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Expo SDK
- React Native Paper (UI components)
- React Navigation
- Chart Kit
- And other dependencies

### Step 3: Start Expo Development Server

```bash
npm start
```

You'll see a QR code in your terminal.

### Step 4: Install Expo Go on Your Phone

**iPhone:**
1. Open App Store
2. Search "Expo Go"
3. Install the app

**Android:**
1. Open Google Play Store
2. Search "Expo Go"
3. Install the app

### Step 5: Open App on Your Phone

**iPhone:**
1. Open Camera app
2. Point at the QR code
3. Tap the notification to open in Expo Go

**Android:**
1. Open Expo Go app
2. Tap "Scan QR Code"
3. Scan the QR code from your terminal

### Step 6: Configure API Connection

⚠️ **IMPORTANT:** You must use your computer's IP address, NOT localhost!

**Find Your Computer's IP:**

**On Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Linux:**
```bash
hostname -I | awk '{print $1}'
```

**On Windows:**
```bash
ipconfig
```

Look for IPv4 Address (usually 192.168.x.x or 10.0.x.x)

**In the Mobile App:**
1. Tap **Settings** tab (bottom right)
2. Enter API URL: `http://YOUR_IP:5000/api`
   - Example: `http://192.168.1.100:5000/api`
3. Tap **Test Connection**
4. Should say "Connected to API server" ✅
5. Tap **Save URL**

### Step 7: Test the Mobile App

1. Go to **Pumping** tab
2. Add a pump session using the + button
3. Check **Stats** tab for charts
4. Try **Feeding** tab

✅ **Mobile App Setup Complete!**

---

## 🎯 Quick Test Checklist

Use this checklist to verify everything is working:

### Backend API ✅
- [ ] API server is running (`python3 api_server.py`)
- [ ] Health check passes (`curl http://localhost:5000/api/health`)
- [ ] Can view pumping data in browser

### Web App ✅
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)
- [ ] Can open http://localhost:3000
- [ ] Can add pump session
- [ ] Charts display correctly

### Mobile App ✅
- [ ] Dependencies installed
- [ ] Expo server running (`npm start`)
- [ ] Expo Go installed on phone
- [ ] App opens via QR code
- [ ] API URL configured with computer's IP
- [ ] Connection test passes
- [ ] Can add and view data

---

## 🌍 Deployment

### Deploy Web App to Vercel

```bash
cd /home/user/Milkies/web

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to Git repository: Yes
# - Build command: npm run build
# - Output directory: .next
```

**Set Environment Variables in Vercel:**
1. Go to your Vercel project settings
2. Add `NEXT_PUBLIC_API_URL`
3. Set value to your production API URL

### Deploy Web App to Netlify

```bash
cd /home/user/Milkies/web

# Build
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod

# Follow prompts
```

### Deploy Backend API

**Option 1: Render.com (Recommended)**
1. Push code to GitHub
2. Go to render.com
3. Create new Web Service
4. Connect your repository
5. Build command: `pip install -r requirements.txt`
6. Start command: `python api_server.py`

**Option 2: Heroku**
```bash
# Create Procfile
echo "web: python api_server.py" > Procfile

# Deploy
heroku create milkies-api
git push heroku main
```

### Build Mobile App for Production

```bash
cd /home/user/Milkies/mobile

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS (requires Apple Developer account)
eas build --platform ios
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to API" (Mobile)

**Solution:**
1. Make sure you're using your computer's **IP address**, not `localhost`
2. Ensure phone and computer are on the **same WiFi network**
3. Check firewall allows port 5000
4. Test API: `curl http://YOUR_IP:5000/api/health`

### Issue: "Failed to fetch" (Web)

**Solution:**
1. Check API server is running
2. Clear Next.js cache: `rm -rf .next && npm run dev`
3. Check browser console for errors
4. Verify `next.config.js` proxy configuration

### Issue: "Module not found" errors

**Solution:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Expo QR code won't scan

**Solution:**
1. Use `npm start` then press `w` to open in web browser
2. Or manually enter the URL shown in terminal in Expo Go app
3. Make sure Expo Go app is up to date

### Issue: Data not syncing between web and mobile

**Solution:**
1. Both apps must connect to the **same API server**
2. Check API URLs in both apps
3. Refresh/pull to refresh in both apps
4. Check API server logs for errors

---

## 🎓 Usage Tips

### For Best Experience:

1. **Keep API Server Running**
   - Use `screen` or `tmux` to keep it running in background
   - Or set up as a system service

2. **Use Both Apps Together**
   - Mobile for quick tracking on-the-go
   - Web for detailed analysis and charts

3. **Enable Notifications (Mobile)**
   - Go to Settings → Enable Notifications
   - Set pump reminder schedule

4. **Export Data Regularly**
   - Use Export button to backup your data
   - Keep backups in cloud storage

5. **Monitor Trends**
   - Check Stats tab daily
   - Watch for supply changes
   - Track progress over time

---

## 📊 What Each App Does Best

### Web App 👍
- ✅ Large screen for detailed charts
- ✅ Easy data entry with keyboard
- ✅ Share screen with healthcare provider
- ✅ Print or export reports

### Mobile App 👍
- ✅ Quick logging while pumping
- ✅ Push notifications
- ✅ Track anywhere
- ✅ Offline support

**Use Both!** They sync automatically through the API.

---

## 🆘 Still Having Issues?

1. **Check Logs:**
   - API: Look at terminal running `api_server.py`
   - Web: Check browser console (F12)
   - Mobile: Shake device → Show Developer Menu → Debug

2. **Verify Versions:**
   ```bash
   python3 --version  # Should be 3.8+
   node --version     # Should be 16+
   npm --version      # Should be 8+
   ```

3. **Test Each Component:**
   - API: `curl http://localhost:5000/api/health`
   - Web: Visit http://localhost:3000
   - Mobile: Check Settings → Test Connection

4. **Read Detailed Docs:**
   - `web/README.md` - Web app specific
   - `mobile/README.md` - Mobile app specific
   - `PROJECT_COMPLETE.md` - Full system docs

---

## 🎉 You're All Set!

You now have:
- ✅ Backend API running
- ✅ Web app accessible at http://localhost:3000
- ✅ Mobile app on your phone
- ✅ Both apps connected and syncing

**Start tracking your breastfeeding journey! 🍼**

---

**Questions?** Check the individual README files in each directory.

**Built with ❤️ for breastfeeding parents**
