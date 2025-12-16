# Build Guide: Creating APK and IPA Files

This guide will help you build native Android APK and iOS IPA files for the RepX app using Expo Application Services (EAS Build).

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Expo CLI** - Install globally: `npm install -g expo-cli eas-cli`
3. **Expo Account** - Sign up at [expo.dev](https://expo.dev) (free account works)
4. **For iOS builds**: Apple Developer Account ($99/year) - Required for device installation
5. **For Android builds**: No special account needed for APK installation

## Initial Setup

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo

```bash
cd frontend
eas login
```

Enter your Expo account credentials. If you don't have an account, create one at [expo.dev](https://expo.dev).

### 3. Configure the Project

The project is already configured with:
- `eas.json` - Build configuration
- `app.json` - App metadata with package names
- Build scripts in `package.json`

## Building Android APK

### Option 1: Build APK for Testing (Preview Profile)

```bash
cd frontend
npm run build:android
```

Or directly:
```bash
eas build --platform android --profile preview
```

This will:
- Build an APK file (not AAB)
- Allow installation on any Android device
- Take about 10-15 minutes

### Option 2: Build Production APK

```bash
npm run build:android:prod
```

Or:
```bash
eas build --platform android --profile production
```

### Download the APK

1. After the build completes, you'll get a URL
2. Visit the URL in your browser or use: `eas build:list`
3. Download the APK file
4. Transfer to your Android device and install

### Installing on Android

1. Enable "Install from Unknown Sources" in Android Settings
2. Transfer the APK to your device
3. Open the APK file and tap "Install"

## Building iOS IPA

### Prerequisites for iOS

1. **Apple Developer Account** ($99/year)
2. **Apple ID** for code signing

### Build iOS IPA

```bash
cd frontend
npm run build:ios
```

Or:
```bash
eas build --platform ios --profile preview
```

**Note**: The first iOS build will require:
- Apple Developer account credentials
- Code signing setup (EAS will guide you)

### Download the IPA

1. After build completes, download from the provided URL
2. Or use: `eas build:list`

### Installing on iOS

**Option 1: TestFlight (Recommended)**
- Upload IPA to App Store Connect
- Distribute via TestFlight
- Users install via TestFlight app

**Option 2: Direct Installation (Requires Apple Developer Account)**
- Use Xcode or Apple Configurator
- Or use tools like AltStore/Cydia Impactor (for development)

**Option 3: Ad-Hoc Distribution**
- Configure device UDIDs in Apple Developer Portal
- Build with ad-hoc provisioning profile
- Install via iTunes or Apple Configurator

## Building Both Platforms

To build for both Android and iOS:

```bash
npm run build:all
```

Or:
```bash
eas build --platform all --profile preview
```

## Build Profiles Explained

### Preview Profile
- **Android**: Generates APK (installable on any device)
- **iOS**: Generates IPA (requires Apple Developer account)
- Best for: Testing and distribution outside app stores

### Production Profile
- **Android**: Generates APK or AAB (for Play Store)
- **iOS**: Generates IPA (for App Store)
- Best for: App store submission

## Environment Variables

The app is configured to use the backend at `http://api.vyzify.com` by default.

To override, create a `.env` file in the `frontend` directory:

```env
EXPO_PUBLIC_API_URL=http://api.vyzify.com
```

## Build Status

Check build status:
```bash
eas build:list
```

View build details:
```bash
eas build:view [BUILD_ID]
```

## Troubleshooting

### Android Build Issues

1. **Build fails with "No credentials"**
   - Run `eas credentials` to set up Android credentials
   - EAS can auto-generate keystore if needed

2. **APK won't install**
   - Check Android version compatibility
   - Ensure "Unknown Sources" is enabled
   - Try a different device

### iOS Build Issues

1. **"No Apple Developer account"**
   - You need a paid Apple Developer account ($99/year)
   - Sign up at [developer.apple.com](https://developer.apple.com)

2. **Code signing errors**
   - Run `eas credentials` to configure iOS credentials
   - EAS can manage certificates automatically

3. **IPA won't install**
   - Ensure device UDID is registered (for ad-hoc)
   - Use TestFlight for easier distribution
   - Check iOS version compatibility

### General Issues

1. **Build times out**
   - EAS builds typically take 10-20 minutes
   - Check build status: `eas build:list`

2. **"Not logged in"**
   - Run `eas login` again

3. **Build configuration errors**
   - Verify `eas.json` is valid JSON
   - Check `app.json` for required fields

## Local Development Builds (Advanced)

If you want to build locally instead of using EAS:

### Android (Requires Android Studio)
```bash
npx expo prebuild
cd android
./gradlew assembleRelease
```

### iOS (Requires Xcode and Mac)
```bash
npx expo prebuild
cd ios
xcodebuild -workspace RepX.xcworkspace -scheme RepX -configuration Release
```

**Note**: Local builds are more complex and require full native development setup.

## Quick Reference

```bash
# Login
eas login

# Build Android APK
npm run build:android

# Build iOS IPA
npm run build:ios

# Build both
npm run build:all

# Check builds
eas build:list

# Download build
eas build:download [BUILD_ID]
```

## Next Steps

After building:
1. Test the APK/IPA on physical devices
2. For production: Submit to app stores
3. Monitor app performance and crashes
4. Update version in `app.json` for new builds

## Support

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Forums](https://forums.expo.dev/)
- [EAS Build Status](https://status.expo.dev/)

