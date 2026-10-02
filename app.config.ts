// app.config.ts
import type { ExpoConfig } from "expo/config";

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  name: "封心 AI",
  slug: "fengxin-ai",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "fengxin",
  userInterfaceStyle: "automatic",

  ios: {
    supportsTablet: true,
    bundleIdentifier: "fengxin.jjshs",
  },

  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#000000",
    },
    package: "fengxin.jjshs",
    permissions: [
      "android.permission.RECORD_AUDIO",
      "android.permission.MODIFY_AUDIO_SETTINGS",
    ],
  },

  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  plugins: [
    "expo-asset",
    "expo-router",
    "expo-sqlite",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#000000",
      },
    ],
    "expo-audio",
    "expo-font",
    "expo-web-browser",
    "expo-secure-store",
    "expo-localization",
    [
      "expo-build-properties",
      {
        android: {
          // You don't have ProGuard enabled right now, so this is optional.
          // Keep it commented until/if you turn minify on.
          // extraProguardRules: `
          // # llama.rn
          // -keep class com.rnllama.** { *; }
          // `,
        },
      },
    ],
    [
      "llama.rn",
      {
        enableEntitlements: true,
        entitlementsProfile: "production",
        forceCxx20: true,
        enableOpenCLAndHexagon: true
      },
    ],
    [
      "expo-speech-recognition",
      {
        microphonePermission: "允许 $(PRODUCT_NAME) 使用麦克风。",
        speechRecognitionPermission: "允许 $(PRODUCT_NAME) 使用语音识别。",
        androidSpeechServicePackages: ["com.google.android.googlequicksearchbox", "com.google.android.tts"]
      }
    ],
    // Keeps the release signing, ABI splits and version code logic reproducible
    // across `expo prebuild --clean`.
    "./plugins/maid-android",
  ],

  experiments: {
    typedRoutes: true,
  },
});