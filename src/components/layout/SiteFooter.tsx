import { LocalizedText } from "@/components/i18n/LocalizedText";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-[rgba(248,250,253,0.7)] py-6">
      <div className="mx-auto max-w-6xl px-5 text-sm text-muted md:px-8">
        <p>
          <span className="font-semibold text-accent">© {new Date().getFullYear()} Bohan Wang.</span>{" "}
          <LocalizedText en="Simple academic portfolio." zh="简洁学术主页。" />
        </p>
      </div>
    </footer>
  );
}
