"use client";

import {
  initializeAnalytics,
  isSupported,
  logEvent,
  type Analytics,
} from "firebase/analytics";
import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

let analyticsPromise: Promise<Analytics | null> | null = null;

export async function initializeFirebaseAnalytics() {
  if (typeof window === "undefined") {
    return null;
  }

  if (analyticsPromise) {
    return analyticsPromise;
  }

  analyticsPromise = createFirebaseAnalytics();
  return analyticsPromise;
}

async function createFirebaseAnalytics() {
  const supported = await isSupported();
  if (!supported) {
    return null;
  }

  return initializeAnalytics(getFirebaseApp(), {
    config: {
      send_page_view: false,
    },
  });
}

export async function trackFirebasePageView(pathname: string) {
  const analytics = await initializeFirebaseAnalytics();

  if (!analytics || typeof window === "undefined") {
    return;
  }

  logEvent(analytics, "page_view", {
    page_location: window.location.href,
    page_path: pathname,
    page_title: document.title,
  });
}
