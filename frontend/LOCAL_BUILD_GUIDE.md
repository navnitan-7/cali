# Local Build Guide - Fast APK/IPA Generation

This guide shows you how to build APK and IPA files **locally on your machine** - much faster than EAS cloud builds!

## Prerequisites

### For Android:
1. **Android Studio** - [Download here](https://developer.android.com/studio)
2. **Java JDK 11+** - Usually comes with Android Studio
3. **Android SDK** - Installed via Android Studio

### For iOS (Mac only):
1. **Xcode** - Install from App Store
2. **Xcode Command Line Tools**: `xcode-select --install`
3. **CocoaPods**: `sudo gem install cocoapods`

## Quick Start - Android APK (Fastest Method)

### Step 1: Generate Native Android Project

```bash
cd frontend
npm run prebuild
```

This creates an `android/` folder with a native Android project.

### Step 2: Build APK Locally

**Release APK (for distribution):**
```bash
npm run build:android:local
```

**Debug APK (for testing, faster):**
```bash
npm run build:android:local:debug
```

### Step 3: Find Your APK

The APK will be located at:
- **Release**: `frontend/android/app/build/outputs/apk/release/app-release.apk`
- **Debug**: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

### Step 4: Install on Device

1. Transfer APK to your Android device
2. Enable "Install from Unknown Sources"
3. Open and install

**Build time: 2-5 minutes** (vs 10-15 minutes on EAS!)

## Building iOS IPA Locally (Mac Only)

### Step 1: Generate Native iOS Project

```bash
cd frontend
npm run prebuild
```

This creates an `ios/` folder with a native iOS project.

### Step 2: Install Dependencies

```bash
cd ios
pod install
cd ..
```

### Step 3: Build IPA

**Option A: Using Xcode (Easier)**
1. Open `ios/RepX.xcworkspace` in Xcode
2. Select "Any iOS Device" as target
3. Product → Archive
4. Distribute App → Ad Hoc or Development
5. Export IPA

**Option B: Command Line**
```bash
npm run build:ios:local
```

**Note**: You'll need to create `ios/ExportOptions.plist` first. See below.

### Step 4: Create Export Options (for command line)

Create `frontend/ios/ExportOptions.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>ad-hoc</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
</dict>
</plist>
```

Replace `YOUR_TEAM_ID` with your Apple Developer Team ID.

## Manual Build Steps (If Scripts Don't Work)

### Android APK Manually:

```bash
cd frontend

# Generate native project
npx expo prebuild --clean

# Build APK
cd android
./gradlew assembleRelease

# APK location
# android/app/build/outputs/apk/release/app-release.apk
```

### iOS IPA Manually:

```bash
cd frontend

# Generate native project
npx expo prebuild --clean

# Install pods
cd ios
pod install

# Open in Xcode
open RepX.xcworkspace

# Then use Xcode GUI to Archive and Export
```

## Troubleshooting

### Android Issues

**"gradlew: command not found"**
- Make sure you're in the `android/` directory
- On Windows, use `gradlew.bat` instead of `./gradlew`

**"SDK location not found"**
- Set `ANDROID_HOME` environment variable:
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk  # Mac/Linux
  # or
  set ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk  # Windows
  ```

**Build fails with Java errors**
- Make sure Java JDK 11+ is installed
- Set `JAVA_HOME` environment variable

**"Build failed" with dependency errors**
- Clean and rebuild:
  ```bash
  cd android
  ./gradlew clean
  ./gradlew assembleRelease
  ```

### iOS Issues

**"pod: command not found"**
- Install CocoaPods: `sudo gem install cocoapods`

**"No such module" errors**
- Run `pod install` in the `ios/` directory

**Code signing errors**
- Open project in Xcode
- Go to Signing & Capabilities
- Select your development team
- Or configure in `ios/ExportOptions.plist`

**"Archive failed"**
- Make sure you selected "Any iOS Device" (not simulator)
- Check that all dependencies are installed

### General Issues

**"prebuild failed"**
- Make sure all npm dependencies are installed: `npm install`
- Check that `app.json` is valid

**Build takes too long**
- First build is slower (downloads dependencies)
- Subsequent builds are much faster
- Use debug builds for faster iteration

## Comparison: Local vs EAS Builds

| Feature | Local Build | EAS Build |
|---------|-------------|-----------|
| **Speed** | 2-5 minutes | 10-15 minutes |
| **Setup** | Requires Android Studio/Xcode | Just EAS CLI |
| **Internet** | Only for dependencies | Required |
| **Cost** | Free | Free (with limits) |
| **Platform** | Your machine | Cloud servers |
| **Best for** | Fast iteration, testing | CI/CD, no local setup |

## Tips for Faster Builds

1. **Use Debug builds** for testing (faster than Release)
2. **Keep `android/` and `ios/` folders** after first prebuild (don't delete)
3. **Only run prebuild** when `app.json` changes
4. **Use incremental builds**: `./gradlew assembleRelease` (not clean)

## Clean Build (If Something Goes Wrong)

```bash
# Android
cd frontend/android
./gradlew clean
./gradlew assembleRelease

# iOS
cd frontend/ios
rm -rf build/
pod deintegrate
pod install
# Then rebuild in Xcode
```

## Next Steps

After building locally:
1. Test APK/IPA on your device
2. Share with testers
3. For production, consider EAS builds for proper code signing
4. Submit to app stores when ready

## Quick Reference

```bash
# Generate native projects
npm run prebuild

# Build Android APK (Release)
npm run build:android:local

# Build Android APK (Debug - faster)
npm run build:android:local:debug

# Build iOS IPA (requires Xcode setup)
npm run build:ios:local

# Manual Android build
cd android && ./gradlew assembleRelease

# Manual iOS build (in Xcode)
open ios/RepX.xcworkspace
```

