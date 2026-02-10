"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Stagger, staggerItem } from "@/components/motion/Stagger";

const links = [
  {
    href: "/research",
    title: "Research",
    description: "Themes, methods, and long-term research directions."
  },
  {
    href: "/projects",
    title: "Projects",
    description: "Applied and academic projects across AI, biology, and data science."
  },
  {
    href: "/cv",
    title: "Curriculum Vitae",
    description: "Education, experience, technical skills, and awards."
  }
];

export function HomeQuickLinks() {
  return (
    <Stagger className="grid gap-4 md:grid-cols-3">
      {links.map((item) => (
        <motion.div key={item.href} variants={staggerItem}>
          <Link
            href={item.href}
            className="group block rounded-2xl border border-line/70 bg-paper/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card"
          >
            <p className="font-display text-2xl text-ink transition-colors group-hover:text-accent">{item.title}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
          </Link>
        </motion.div>
      ))}
    </Stagger>
  );
}
