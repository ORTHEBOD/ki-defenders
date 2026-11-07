#!/usr/bin/env bash
# Builds the Android app on GitHub Actions (needs Node, Java 17 and the Android SDK).
# Output: out/ki-defenders.apk (install on a phone) and out/ki-defenders.aab (for Google Play).
# Signing key comes from the ANDROID_KEYSTORE_B64 / ANDROID_KEYSTORE_PASS secrets (or a test key if missing).
set -euo pipefail
cd "$(dirname "$0")"
VERSION_CODE="${GITHUB_RUN_NUMBER:-1}"
VERSION_NAME="1.0.${VERSION_CODE}"

# The game files go inside the app, so it works with no internet
rm -rf www out && mkdir -p www out
cp -r ../../index.html ../../manifest.webmanifest ../../lib ../../fonts ../../icons ../../src ../../art www/

npm install --no-audit --no-fund
npx cap add android

# Landscape only, full screen, version number
sed -i 's/android:name=".MainActivity"/android:name=".MainActivity"\n            android:screenOrientation="sensorLandscape"/' android/app/src/main/AndroidManifest.xml
sed -i '/<style name="AppTheme.NoActionBar"/a\        <item name="android:windowFullscreen">true</item>' android/app/src/main/res/values/styles.xml
sed -i "s/versionCode 1$/versionCode ${VERSION_CODE}/; s/versionName \"1.0\"/versionName \"${VERSION_NAME}\"/" android/app/build.gradle

# App icon and splash from the game's icon
mkdir -p assets
cp ../../icons/icon-512.png assets/icon-only.png
cp ../../icons/icon-512.png assets/icon-foreground.png
npx --yes @capacitor/assets@3 generate --android --assetPath assets \
  --iconBackgroundColor '#1b1442' --splashBackgroundColor '#07090f' || echo "Icon step skipped"

npx cap sync android
cd android
./gradlew --no-daemon assembleRelease bundleRelease

# Sign with the project's key (the same key every time, so new versions install over old ones).
# Until that key is added as a GitHub secret, a one-time test key is used instead.
if [ -n "${ANDROID_KEYSTORE_B64:-}" ]; then
  echo "$ANDROID_KEYSTORE_B64" | base64 -d > ../keystore.p12
else
  echo "No signing key secret yet: using a one-time test key"
  ANDROID_KEYSTORE_PASS="$(openssl rand -hex 16)"
  export ANDROID_KEYSTORE_PASS
  keytool -genkeypair -keystore ../keystore.p12 -storetype PKCS12 -alias kidefenders -keyalg RSA -keysize 2048     -validity 10000 -storepass "$ANDROID_KEYSTORE_PASS" -dname "CN=Ki Defenders Test"
fi
BT="$ANDROID_HOME/build-tools/$(ls "$ANDROID_HOME/build-tools" | sort -V | tail -1)"
"$BT/zipalign" -f -p 4 app/build/outputs/apk/release/app-release-unsigned.apk ../out/aligned.apk
"$BT/apksigner" sign --ks ../keystore.p12 --ks-type PKCS12 --ks-pass env:ANDROID_KEYSTORE_PASS \
  --out ../out/ki-defenders.apk ../out/aligned.apk
jarsigner -keystore ../keystore.p12 -storetype PKCS12 -storepass "$ANDROID_KEYSTORE_PASS" \
  -signedjar ../out/ki-defenders.aab app/build/outputs/bundle/release/app-release.aab kidefenders
rm -f ../keystore.p12 ../out/aligned.apk
"$BT/apksigner" verify ../out/ki-defenders.apk
echo "Built Ki Defenders ${VERSION_NAME}"
