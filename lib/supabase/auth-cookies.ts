type CookieLike = {
  name: string;
};

const supabaseAuthCookiePattern = /^sb-.+-auth-token(?:\.\d+)?$/;

export function hasSupabaseAuthCookie(cookies: readonly CookieLike[]) {
  return cookies.some((cookie) => supabaseAuthCookiePattern.test(cookie.name));
}
