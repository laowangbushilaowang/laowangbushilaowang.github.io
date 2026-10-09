export type Locale = "en" | "zh";
export function localizedPath(path: string, locale: Locale) {
  const clean = path.replace(/^\/zh(?=\/|$)/, "") || "/";
  return locale === "zh" ? `/zh${clean === "/" ? "" : clean}` : clean;
}
export const siteUrl = "https://laowangbushilaowang.github.io";
export function alternates(path: string) {
  return {
    canonical: path,
    languages: {
      en: localizedPath(path, "en"),
      "zh-CN": localizedPath(path, "zh"),
    },
  };
}
