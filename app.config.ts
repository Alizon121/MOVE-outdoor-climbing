import fs from 'node:fs';

import type { ExpoConfig } from 'expo/config';

// Firebase config files are downloaded from the Firebase console and kept out of git.
// They are only wired in when present so the project builds before Firebase is connected.
const googleServicesFile = fs.existsSync('./google-services.json')
  ? './google-services.json'
  : undefined;
const googleServiceInfoPlist = fs.existsSync('./GoogleService-Info.plist')
  ? './GoogleService-Info.plist'
  : undefined;

const config: ExpoConfig = {
  name: 'MOVE',
  slug: 'move',
  scheme: 'move',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    // TODO: replace with your final bundle identifier before the first store build.
    bundleIdentifier: 'com.move.climbing',
    icon: './assets/expo.icon',
    googleServicesFile: googleServiceInfoPlist,
  },
  android: {
    // TODO: replace with your final package name before the first store build.
    package: 'com.move.climbing',
    googleServicesFile,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    'expo-dev-client',
    'expo-sqlite',
    'expo-localization',
    [
      'expo-build-properties',
      {
        // Required by React Native Firebase on iOS.
        ios: { useFrameworks: 'static' },
      },
    ],
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
    '@maplibre/maplibre-react-native',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
