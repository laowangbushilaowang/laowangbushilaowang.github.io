import { LocalizedText } from "@/components/i18n/LocalizedText";

export function SiteFooter() {
  return (
    <footer className="border-t border-line py-6">
      <div className="mx-auto max-w-6xl px-5 text-sm text-muted md:px-8">
        <p>
          © {new Date().getFullYear()} Bohan Wang. <LocalizedText en="Simple academic portfolio." zh="简洁学术主页。" />
        </p>
      </div>
    </footer>
  );
}
