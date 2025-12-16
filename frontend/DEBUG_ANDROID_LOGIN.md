# Debugging Android Login Issues

## Quick Fix Applied

I've made the following changes to fix Android login issues:

1. **Enabled Cleartext Traffic** - Android 9+ blocks HTTP by default. Added `usesCleartextTraffic: true` to `app.json`
2. **Added Debug Screen** - Created a debug screen to test connectivity
3. **Improved Error Messages** - Login errors now show more details

## How to Debug Login Failures

### Method 1: Check Console Logs

When login fails, check the console/logcat for these messages:

```
[API Config] Using API Base URL: http://api.vyzify.com (Platform: android)
[Login] Attempting login...
[AuthService] Attempting login for: <username>
[API Request] POST /auth/login
[AuthService] Login failed: <error details>
```

### Method 2: Use Debug Screen

1. When login fails, tap "Debug Info" button
2. Or navigate to `/debug` route directly
3. Tap "Test Connection" to see detailed connectivity info

### Method 3: Check Logcat (Android Studio)

```bash
# Connect your device/emulator
adb logcat | grep -E "(API|Login|Auth|Network)"
```

## Common Issues and Solutions

### Issue 1: Network Error / Cannot Connect

**Symptoms:**
- Error message: "Cannot connect to the server"
- Network Error in logs

**Solutions:**
1. **Check Backend is Running**
   ```bash
   curl http://api.vyzify.com/
   # Should return: {"message":"Hello, World!"}
   ```

2. **Check API URL in App**
   - Open debug screen (`/debug`)
   - Verify API Base URL is correct
   - Should be: `http://api.vyzify.com`

3. **Check Android Network Security**
   - Ensure `usesCleartextTraffic: true` is in `app.json` (already added)
   - Rebuild the app after changing `app.json`

4. **Check Device Internet**
   - Ensure device has internet connection
   - Try opening `http://api.vyzify.com/` in device browser

### Issue 2: 401 Unauthorized

**Symptoms:**
- Error: "Invalid username or password"
- Status code: 401

**Solutions:**
1. Verify credentials are correct
2. Check backend logs for authentication errors
3. Ensure backend is accepting requests from your IP

### Issue 3: Timeout

**Symptoms:**
- Request times out after 30 seconds
- No response from server

**Solutions:**
1. Check backend server is responsive
2. Check firewall/network blocking port 8000
3. Try increasing timeout in `apiConfig.ts` (currently 30000ms)

### Issue 4: CORS Errors

**Symptoms:**
- CORS error in logs
- Request blocked by browser/network

**Solutions:**
1. Backend should allow all origins (check `backend/main.py`)
2. For Android native app, CORS shouldn't be an issue
3. If using web version, ensure CORS is configured

## Step-by-Step Debugging

### Step 1: Verify Backend is Accessible

```bash
# From your computer
curl http://api.vyzify.com/

# From Android device browser
# Open Chrome and navigate to: http://api.vyzify.com/
```

### Step 2: Check App Configuration

1. Open the app
2. Navigate to Debug screen (`/debug`)
3. Check "Network Configuration" section
4. Verify API Base URL is `http://api.vyzify.com`

### Step 3: Test Connection

1. In Debug screen, tap "Test Connection"
2. Review the test results:
   - Health check should succeed
   - Login endpoint should be reachable (401 is OK)

### Step 4: Check Logs

Look for these patterns in logs:

**Good (Connection Working):**
```
[API Request] POST /auth/login
[API Response] 200 /auth/login
[AuthService] Login successful
```

**Bad (Network Issue):**
```
[API Request] POST /auth/login
Network Error
[AuthService] Login failed: Network Error
```

**Bad (Auth Issue):**
```
[API Request] POST /auth/login
[API Response] 401 /auth/login
[AuthService] Login failed: Invalid credentials
```

## Rebuilding After Config Changes

After changing `app.json`, you MUST rebuild:

```bash
# If using local build
cd frontend
npm run prebuild
npm run build:android:local

# If using EAS
eas build --platform android --profile preview
```

**Important:** Just restarting the app won't pick up `app.json` changes. You need a full rebuild.

## Testing Checklist

- [ ] Backend is running and accessible
- [ ] API URL is correct in debug screen
- [ ] Device has internet connection
- [ ] App has INTERNET permission (already in app.json)
- [ ] Cleartext traffic is enabled (already in app.json)
- [ ] App was rebuilt after config changes
- [ ] Console logs show detailed error messages

## Getting More Help

If login still fails after these steps:

1. **Capture Full Logs:**
   ```bash
   adb logcat > login_debug.log
   # Try to login
   # Stop logcat (Ctrl+C)
   # Review login_debug.log
   ```

2. **Check Backend Logs:**
   - Look at backend server logs
   - See if requests are reaching the server
   - Check for any errors in backend

3. **Test with curl:**
   ```bash
   curl -X POST http://api.vyzify.com/auth/login \
     -H "Content-Type: application/json" \
     -d '{"name":"your_username","password":"your_password"}'
   ```

4. **Share Debug Info:**
   - Screenshot of debug screen
   - Console logs
   - Backend logs
   - Error message from login screen

## Quick Test Commands

```bash
# Test backend health
curl http://api.vyzify.com/

# Test login endpoint (will fail with 401, but confirms endpoint exists)
curl -X POST http://api.vyzify.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"test","password":"test"}'

# Check Android logs
adb logcat | grep -i "api\|login\|auth\|network"
```

