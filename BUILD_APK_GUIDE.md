# Guide: Building RepX as Chrome APK (PWA/TWA)

This guide will help you bundle your frontend as a Chrome APK that can be installed on Android phones. Since the backend is Python-based, it cannot run directly in the browser, so we'll provide options for handling the backend.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Expo CLI** (installed globally or via npx)
3. **Android Studio** (for Android SDK and tools)
4. **Java JDK** (version 11 or higher)
5. **Bubblewrap CLI** (Google's TWA tool) - we'll install this

## Option 1: Backend Hosted Separately (Recommended)

This is the most practical approach. Host your backend on a cloud service (Heroku, Railway, AWS, etc.) and point your frontend to it.

### Step 1: Build the Frontend for Web

```bash
cd frontend
npm install
npm run build:web
```

This will create a `web-build` directory with your production-ready web app.

### Step 2: Install Bubblewrap CLI

```bash
npm install -g @bubblewrap/cli
```

### Step 3: Initialize TWA Project

```bash
cd frontend
bubblewrap init --manifest=https://your-domain.com/manifest.json
```

Or if testing locally, you can use:

```bash
bubblewrap init --manifest=./twa-manifest.json
```

Follow the prompts:
- Package name: `com.repx.app` (or your preferred package name)
- App name: `RepX`
- Launcher name: `RepX`
- Use the default values for other prompts

### Step 4: Update API Configuration

Before building, update your frontend to point to your hosted backend:

1. Create a `.env` file in the `frontend` directory:
```env
EXPO_PUBLIC_API_URL=https://your-backend-url.com
```

2. Or update `frontend/services/apiConfig.ts` to use your production backend URL.

### Step 5: Build the APK

```bash
cd frontend
bubblewrap build
```

This will generate an APK file in the `frontend/android/app/build/outputs/apk/release/` directory.

### Step 6: Install on Your Phone

1. Transfer the APK file to your Android phone
2. Enable "Install from Unknown Sources" in your phone's settings
3. Open the APK file and install it

## Option 2: Local Backend with Network Access

If you want to run the backend locally and access it from your phone:

### Step 1: Start Backend on Your Computer

```bash
cd backend
# Make sure your backend is accessible on your local network
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Step 2: Find Your Computer's IP Address

- **Mac/Linux**: Run `ifconfig` or `ip addr`
- **Windows**: Run `ipconfig`

Look for your local network IP (usually something like `192.168.1.x`)

### Step 3: Update Frontend API Config

Update `frontend/services/apiConfig.ts` to use your computer's IP:

```typescript
return 'http://YOUR_COMPUTER_IP:8000';
```

### Step 4: Build and Install APK

Follow Steps 1-6 from Option 1, but make sure your phone and computer are on the same WiFi network.

## Option 3: Using Expo Build (Alternative)

Expo also supports building web apps that can be packaged as PWAs:

```bash
cd frontend
npx expo export:web
```

Then serve the `web-build` directory and use Chrome's "Add to Home Screen" feature, or use Bubblewrap as described above.

## Troubleshooting

### CORS Issues

If you encounter CORS errors, make sure your backend's CORS middleware allows your frontend domain:

```python
# In backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Service Worker Not Registering

Make sure:
1. You're serving the app over HTTPS (or localhost for development)
2. The `sw.js` file is in the correct location
3. The manifest.json is accessible

### APK Installation Blocked

On Android, you may need to:
1. Enable "Install from Unknown Sources" in Settings
2. Allow installation from the specific source (Chrome, File Manager, etc.)

## Testing the PWA Locally

Before building the APK, test the PWA in Chrome:

1. Build the web version: `npm run build:web`
2. Serve it locally: `npx serve web-build` or use any static file server
3. Open Chrome and navigate to the local server
4. Open DevTools > Application > Manifest to verify PWA setup
5. Use "Add to Home Screen" to test PWA installation

## Production Deployment

For production:

1. **Host Frontend**: Deploy the `web-build` folder to:
   - Netlify
   - Vercel
   - GitHub Pages
   - Firebase Hosting
   - Any static hosting service

2. **Host Backend**: Deploy your FastAPI backend to:
   - Heroku
   - Railway
   - AWS Lambda/API Gateway
   - Google Cloud Run
   - DigitalOcean App Platform

3. **Update API URL**: Point your frontend to the production backend URL

4. **Build APK**: Use Bubblewrap with your production manifest URL

## Additional Resources

- [Bubblewrap Documentation](https://github.com/GoogleChromeLabs/bubblewrap)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [TWA Documentation](https://developer.chrome.com/docs/android/trusted-web-activity/)

## Notes

- The Python backend **cannot** run inside the APK/browser. It must be hosted separately.
- For offline functionality, you can implement client-side caching and sync when online.
- Consider using IndexedDB for local data storage in the PWA.

