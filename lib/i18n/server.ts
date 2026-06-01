import { cookies } from "next/headers";
import { defaultLocale, isLocale, localeCookieName } from "./config";

export async function getLocale() {
  const cookieStore = await cookies();
  const locale = cookieStore.get(localeCookieName)?.value;
  return isLocale(locale) ? locale : defaultLocale;
}
