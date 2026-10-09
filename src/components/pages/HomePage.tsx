import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Tag } from "@/components/ui/Tag";
import { LocalizedNode, LocalizedText } from "@/components/i18n/LocalizedText";
import { getAllPosts } from "@/lib/blog";
import { localizedPath, type Locale } from "@/lib/locale";
import { siteProfile } from "@/content/site";

export function Home({ locale }: { locale: Locale }) {
  const posts = getAllPosts(locale);
  return (
    <Container className="py-6 md:py-12">
      <section className="grid items-start gap-5 border-b border-line pb-7 md:gap-8 md:pb-10 md:grid-cols-[240px_minmax(0,1fr)]">
        <div className="mx-auto w-full max-w-[170px] overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_10px_26px_-20px_rgba(47,93,140,0.45)] sm:max-w-[220px] md:mx-0">
          <Image
            src="/wbh.webp"
            alt="Bohan Wang"
            width={360}
            height={480}
            className="h-auto w-full object-cover"
            priority
          />
        </div>

        <div className="min-w-0 space-y-3 md:space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
            <LocalizedText en="Personal Homepage" zh="个人主页" />
          </p>
          <h1 className="font-display text-3xl leading-tight text-accent sm:text-4xl md:text-5xl">
            {siteProfile.name}{" "}
            <span className="block text-xl text-muted sm:text-2xl md:text-3xl">
              ({siteProfile.bilingualName})
            </span>
          </h1>
          <p className="text-sm text-ink/90 sm:text-base md:text-lg">
            <LocalizedText
              en={siteProfile.tagline}
              zh={siteProfile.taglineZh ?? siteProfile.tagline}
            />
          </p>
          <p className="max-w-3xl text-sm leading-relaxed text-muted">
            <LocalizedText
              en="I work on machine learning and biological data at Guangzhou Laboratory. I also build personal AI tools with Codex."
              zh="我在广州实验室做机器学习和生物数据相关工作，也用 Codex 做自己的 AI 工具。"
            />
          </p>
          <div className="flex flex-wrap gap-2">
            <Tag>Machine Learning</Tag>
            <Tag>AI Agents</Tag>
            <Tag>Computational Biology</Tag>
          </div>
          <div className="grid gap-2 rounded-xl border border-line bg-paper/85 p-3 text-xs sm:p-4 sm:text-sm md:grid-cols-2">
            <p>
              <span className="font-semibold text-accent">
                <LocalizedText en="Current:" zh="当前职位：" />
              </span>{" "}
              <LocalizedText
                en={siteProfile.currentRole.title}
                zh={
                  siteProfile.currentRole.titleZh ??
                  siteProfile.currentRole.title
                }
              />
            </p>
            <p>
              <span className="font-semibold text-accent">
                <LocalizedText en="Institution:" zh="机构：" />
              </span>{" "}
              <LocalizedText
                en={siteProfile.currentRole.institution}
                zh={
                  siteProfile.currentRole.institutionZh ??
                  siteProfile.currentRole.institution
                }
              />
            </p>
            <p>
              <span className="font-semibold text-accent">
                <LocalizedText en="Location:" zh="地点：" />
              </span>{" "}
              <LocalizedText
                en={siteProfile.location}
                zh={siteProfile.locationZh ?? siteProfile.location}
              />
            </p>
            <p>
              <span className="font-semibold text-accent">
                <LocalizedText en="Email:" zh="邮箱：" />
              </span>{" "}
              {siteProfile.emailDisplay}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 text-sm font-semibold text-accent">
            <Link
              href={localizedPath("/research", locale)}
              className="hover:underline"
            >
              <LocalizedText en="Research" zh="研究" />
            </Link>
            <Link
              href={localizedPath("/projects", locale)}
              className="hover:underline"
            >
              <LocalizedText en="Projects" zh="项目" />
            </Link>
            <Link
              href={localizedPath("/blog", locale)}
              className="hover:underline"
            >
              <LocalizedText en="Blog" zh="博客" />
            </Link>
            <Link
              href={localizedPath("/contact", locale)}
              className="hover:underline"
            >
              <LocalizedText en="Contact" zh="联系" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 py-7 md:gap-8 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:py-10">
        <article className="rounded-xl border border-line bg-paper/85 p-4 sm:p-5">
          <h2 className="font-display text-2xl text-accent sm:text-[1.75rem] md:text-3xl">
            <LocalizedText en="About" zh="关于我" />
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted sm:text-base">
            <p>
              <LocalizedNode
                en={
                  <>
                    I am currently an{" "}
                    <strong className="font-semibold text-accent">
                      AI Algorithm Engineer
                    </strong>{" "}
                    at{" "}
                    <strong className="font-semibold text-accent">
                      Guangzhou Laboratory
                    </strong>
                    , mainly working on{" "}
                    <strong className="font-semibold text-accent">
                      data-centric machine learning
                    </strong>{" "}
                    and biological data algorithms.
                  </>
                }
                zh={
                  <>
                    我目前在
                    <strong className="font-semibold text-accent">
                      广州实验室
                    </strong>
                    担任 <em className="italic">AI 算法工程师</em>，主要从事{" "}
                    <strong className="font-semibold text-accent">
                      数据驱动机器学习
                    </strong>{" "}
                    与生物数据算法研究。
                  </>
                }
              />
            </p>
            <p>
              <LocalizedNode
                en={
                  <>
                    I completed my MSc in Data Science at{" "}
                    <strong className="font-semibold text-accent">
                      Boston University (2025)
                    </strong>
                    . Before that, I received a bachelor&apos;s degree in Data
                    Science from{" "}
                    <strong className="font-semibold text-accent">
                      HKBU (Zhuhai) - BNBU
                    </strong>
                    , and studied sociology for two years during my
                    undergraduate years.
                  </>
                }
                zh={
                  <>
                    我于{" "}
                    <strong className="font-semibold text-accent">
                      波士顿大学（2025）
                    </strong>{" "}
                    完成数据科学硕士学位，此前在
                    <strong className="font-semibold text-accent">
                      HKBU（珠海）- BNBU
                    </strong>{" "}
                    获得数据科学学士学位，本科时学习过两年社会学。
                  </>
                }
              />
            </p>
            <p>
              <LocalizedNode
                en={
                  <>
                    I enjoy working on concrete problems, from research
                    experiments to small tools I use myself. This site collects
                    those projects and what I learned while building them.
                  </>
                }
                zh={
                  <>
                    我喜欢做具体的东西，从研究实验到自己用的小工具。这里记录这些项目，以及做的过程中遇到的问题和学到的东西。
                  </>
                }
              />
            </p>
            <p className="italic text-accent">
              <LocalizedText
                en="Each person must complete their own individuation."
                zh="Each person must complete their own individuation."
              />
            </p>
          </div>
        </article>

        <article className="rounded-xl border border-line bg-paper/85 p-4 sm:p-5">
          <h3 className="font-display text-xl text-accent sm:text-2xl">
            <LocalizedText en="Beyond Research" zh="兴趣爱好" />
          </h3>
          <p className="mt-2 text-sm text-muted">
            <LocalizedText en="Outside work:" zh="工作之外：" />
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {siteProfile.hobbies?.map((hobby, idx) => (
              <Tag key={hobby}>
                <LocalizedText
                  en={hobby}
                  zh={siteProfile.hobbiesZh?.[idx] ?? hobby}
                />
              </Tag>
            ))}
          </div>
        </article>
      </section>
      <section className="border-t border-line pt-7 pb-4">
        <h2 className="font-display text-2xl text-accent">
          <LocalizedText en="Recent writing" zh="最近写的文章" />
        </h2>
        {posts.slice(0, 3).map((post) => (
          <article
            key={post.slug}
            className="mt-4 rounded-xl border border-line bg-paper/85 p-4"
          >
            <Link
              href={localizedPath(`/blog/${post.slug}`, locale)}
              className="font-display text-xl text-accent hover:underline"
            >
              {post.title}
            </Link>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {post.excerpt}
            </p>
          </article>
        ))}
      </section>
    </Container>
  );
}
