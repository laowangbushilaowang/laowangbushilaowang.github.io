import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Tag } from "@/components/ui/Tag";
import { LocalizedNode, LocalizedText } from "@/components/i18n/LocalizedText";
import { siteProfile } from "@/content/site";

export default function HomePage() {
  return (
    <Container className="py-6 md:py-12">
      <section className="grid items-start gap-5 border-b border-line pb-7 md:gap-8 md:pb-10 md:grid-cols-[240px_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-[170px] overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_10px_26px_-20px_rgba(47,93,140,0.45)] sm:max-w-[220px] md:mx-0">
          <Image src="/wbh.jpg" alt="Bohan Wang" width={360} height={480} className="h-auto w-full object-cover" priority />
        </div>

        <div className="min-w-0 space-y-3 md:space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
            <LocalizedText en="Academic Profile" zh="学术主页" />
          </p>
          <h1 className="font-display text-3xl leading-tight text-accent sm:text-4xl md:text-5xl">
            {siteProfile.name} <span className="block text-xl text-muted sm:text-2xl md:text-3xl">({siteProfile.bilingualName})</span>
          </h1>
          <p className="text-sm text-ink/90 sm:text-base md:text-lg">
            <LocalizedText en={siteProfile.tagline} zh={siteProfile.taglineZh ?? siteProfile.tagline} />
          </p>
          <p className="max-w-3xl text-sm leading-relaxed text-muted">
            <LocalizedNode
              en={
                <>
                  I focus on <strong className="font-semibold text-accent">data-centric machine learning</strong> and{" "}
                  <strong className="font-semibold text-accent">interdisciplinary AI applications</strong>, prioritizing{" "}
                  <em className="italic">AI</em> and <em className="italic">robotics</em> while expanding work in <em className="italic">biology</em> and{" "}
                  <em className="italic">medical vision</em>, and also exploring{" "}
                  <strong className="font-semibold text-accent">AI-agent workflows</strong>.
                </>
              }
              zh={
                <>
                  我聚焦<strong className="font-semibold text-accent">数据驱动机器学习</strong> 与
                  <strong className="font-semibold text-accent">跨领域 AI 应用</strong>，重点在 <em className="italic">人工智能</em> 与{" "}
                  <em className="italic">机器人</em>，并拓展 <em className="italic">生物方向</em> 与 <em className="italic">医疗视觉</em> 的领域应用，同时探索
                  <strong className="font-semibold text-accent">AI Agent 工作流</strong>。
                </>
              }
            />
          </p>

          <div className="flex flex-wrap gap-2">
            <Tag>
              <LocalizedText en="Early-Career Researcher" zh="早期研究者" />
            </Tag>
            <Tag>
              <LocalizedText en="Data-Centric ML" zh="数据驱动机器学习" />
            </Tag>
            <Tag>
              <LocalizedText en="AI Agents x Domains" zh="AI Agent x 跨领域" />
            </Tag>
            <Tag>
              <LocalizedText en="Medical Vision + Robotics" zh="医疗视觉 + 机器人" />
            </Tag>
          </div>

          <div className="grid gap-2 rounded-xl border border-line bg-paper/85 p-3 text-xs sm:p-4 sm:text-sm md:grid-cols-2">
            <p>
              <span className="font-semibold text-accent">
                <LocalizedText en="Current:" zh="当前职位：" />
              </span>{" "}
              <LocalizedText en={siteProfile.currentRole.title} zh={siteProfile.currentRole.titleZh ?? siteProfile.currentRole.title} />
            </p>
            <p>
              <span className="font-semibold text-accent">
                <LocalizedText en="Institution:" zh="机构：" />
              </span>{" "}
              <LocalizedText en={siteProfile.currentRole.institution} zh={siteProfile.currentRole.institutionZh ?? siteProfile.currentRole.institution} />
            </p>
            <p>
              <span className="font-semibold text-accent">
                <LocalizedText en="Location:" zh="地点：" />
              </span>{" "}
              <LocalizedText en={siteProfile.location} zh={siteProfile.locationZh ?? siteProfile.location} />
            </p>
            <p>
              <span className="font-semibold text-accent">
                <LocalizedText en="Email:" zh="邮箱：" />
              </span>{" "}
              {siteProfile.emailDisplay}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 text-sm font-semibold text-accent">
            <Link href="/research" className="hover:underline">
              <LocalizedText en="Research" zh="研究" />
            </Link>
            <Link href="/projects" className="hover:underline">
              <LocalizedText en="Projects" zh="项目" />
            </Link>
            <Link href="/contact" className="hover:underline">
              <LocalizedText en="Contact" zh="联系" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 border-b border-line py-7 md:gap-8 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:py-10">
        <article className="rounded-xl border border-line bg-paper/85 p-4 sm:p-5">
          <h2 className="font-display text-2xl text-accent sm:text-[1.75rem] md:text-3xl">
            <LocalizedText en="About" zh="关于我" />
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted sm:text-base">
            <p>
              <LocalizedNode
                en={
                  <>
                    {siteProfile.name} is an early-career <em className="italic">{siteProfile.currentRole.title.toLowerCase()}</em> at{" "}
                    <strong className="font-semibold text-accent">{siteProfile.currentRole.institution}</strong>, working on{" "}
                    <strong className="font-semibold text-accent">data-centric machine learning</strong> for high-dimensional biological data.
                  </>
                }
                zh={
                  <>
                    {siteProfile.name} 目前在
                    <strong className="font-semibold text-accent">{siteProfile.currentRole.institutionZh ?? siteProfile.currentRole.institution}</strong>
                    担任 <em className="italic">{siteProfile.currentRole.titleZh ?? siteProfile.currentRole.title}</em>，
                    主要从事 <strong className="font-semibold text-accent">数据驱动机器学习</strong> 与生物高维数据研究。
                  </>
                }
              />
            </p>
            <p>
              <LocalizedNode
                en={
                  <>
                    I completed an MSc in Data Science at <strong className="font-semibold text-accent">Boston University (2025)</strong>, after a BSc (Hons) at{" "}
                    <strong className="font-semibold text-accent">HKBU-UIC</strong>. My work prioritizes <em className="italic">AI</em> and{" "}
                    <em className="italic">robotics</em>, while expanding domain applications in <em className="italic">biology</em> and <em className="italic">medical vision</em>.
                  </>
                }
                zh={
                  <>
                    我于 <strong className="font-semibold text-accent">波士顿大学（2025）</strong> 完成数据科学硕士学位，此前在
                    <strong className="font-semibold text-accent">HKBU-UIC</strong> 获得学士学位。当前聚焦
                    <em className="italic">人工智能</em> 与 <em className="italic">机器人</em>，并拓展
                    <em className="italic">生物方向</em> 与 <em className="italic">医疗视觉</em> 的领域应用。
                  </>
                }
              />
            </p>
          </div>
        </article>

        <article className="rounded-xl border border-line bg-paper/85 p-4 sm:p-5">
          <h3 className="font-display text-xl text-accent sm:text-2xl">
            <LocalizedText en="Beyond Research" zh="兴趣爱好" />
          </h3>
          <p className="mt-2 text-sm text-muted">
            <LocalizedText en="Sports, music, and games that keep me curious and creative." zh="运动、音乐和游戏让我保持好奇与创造力。" />
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {siteProfile.hobbies?.map((hobby, idx) => (
              <Tag key={hobby}>
                <LocalizedText en={hobby} zh={siteProfile.hobbiesZh?.[idx] ?? hobby} />
              </Tag>
            ))}
          </div>
        </article>
      </section>
    </Container>
  );
}
