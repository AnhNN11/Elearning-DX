"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { isLocale, localeCookieName, type Locale } from "./config";

export async function setLocaleAction(locale: Locale) {
  if (!isLocale(locale)) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, locale, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
