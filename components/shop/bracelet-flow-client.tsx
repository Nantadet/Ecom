"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowRight, Gift, Gem, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/client/language-context";
import {
  findFlowProduct,
  flowProductHref,
  flowProductImage,
  type ShopFlowKind,
} from "@/lib/shop/product-flow";

type ProductOption = {
  label: string;
  imageUrl?: string;
  stock?: number;
};

type LocalizedText = {
  th: string;
  en?: string;
};

type DisplayProduct = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  stock: number;
  shippingFirstItem: number;
  shippingAdditionalItem: number;
  category: string;
  options: ProductOption[];
  imageUrl?: string;
  imageUrls?: string[];
};

type BraceletFlowClientProps = {
  products: DisplayProduct[];
};

const STEP_COPY: Array<{
  kind: Exclude<ShopFlowKind, "bottle" | "other">;
  icon: React.ElementType;
  title: { th: string; en: string };
  subtitle: { th: string; en: string };
  fallback: string;
}> = [
  {
    kind: "secret",
    icon: Gift,
    title: { th: "Secret Set", en: "Secret Set" },
    subtitle: { th: "กล่องสุ่มแฟชั่นพร้อมโปรโมชันพิเศษ", en: "A mystery gift set with a special surprise" },
    fallback: "/bracelets",
  },
  {
    kind: "bracelet",
    icon: Gem,
    title: { th: "สร้อยข้อมือพร้อมตัวเรือน", en: "Bracelet Chain" },
    subtitle: { th: "สร้อยสแตนเลสสีเงิน ใส่ได้ทุกวัน ไม่แพ้ง่าย", en: "Silver-tone stainless bracelet for daily wear" },
    fallback: "/bracelets",
  },
  {
    kind: "charm",
    icon: Sparkles,
    title: { th: "เลือกซื้อ Charm", en: "Choose Charms" },
    subtitle: { th: "เพิ่มความน่ารักในแบบของคุณ", en: "Build a bracelet that feels like you" },
    fallback: "/bracelets",
  },
];

function StepCard({
  href,
  image,
  step,
  icon: Icon,
  title,
  subtitle,
  cta,
  warm,
}: {
  href: string;
  image: string;
  step: number;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  cta: string;
  warm: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative block min-h-[158px] overflow-hidden rounded-[22px] border border-white shadow-[0_14px_38px_rgba(15,23,42,0.08)] transition-transform active:scale-[0.985] sm:min-h-[210px]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
      <div className={`absolute inset-0 ${warm ? "bg-[linear-gradient(90deg,rgba(255,250,244,.96),rgba(255,250,244,.65)_50%,rgba(255,250,244,.1))]" : "bg-[linear-gradient(90deg,rgba(244,249,255,.96),rgba(244,249,255,.66)_50%,rgba(244,249,255,.1))]"}`} />
      <div className="relative z-10 flex min-h-[158px] flex-col justify-center px-6 py-5 sm:min-h-[210px] sm:px-8">
        <div className="mb-3 flex items-center gap-3">
          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${warm ? "bg-[#d6b58f] text-white" : "bg-[#b4cce7] text-white"}`}>
            {step}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 text-[#12396b] shadow-sm">
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <h1 className="max-w-[58%] text-2xl font-black leading-tight text-[#0b2a55] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-[54%] text-xs font-bold leading-snug text-[#163b68]/80 sm:text-sm">
          {subtitle}
        </p>
        <span className={`mt-4 inline-flex h-9 w-fit items-center gap-2 rounded-xl px-4 text-xs font-black text-white shadow-lg transition-transform group-hover:translate-x-1 ${warm ? "bg-[#73513d]" : "bg-[#102f5c]"}`}>
          {cta}
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

export function BraceletFlowClient({ products }: BraceletFlowClientProps) {
  const { lang } = useLanguage();

  const cards = React.useMemo(() => STEP_COPY.map((step) => {
    const product = findFlowProduct(products, step.kind);
    return {
      ...step,
      product,
      href: flowProductHref(product, step.fallback),
      image: flowProductImage(product, step.kind),
    };
  }), [products]);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-3 py-4 pb-10 sm:gap-4 sm:px-5 lg:py-8">
        {cards.map((card, index) => (
          <StepCard
            key={card.kind}
            href={card.href}
            image={card.image}
            step={index + 1}
            icon={card.icon}
            title={card.title[lang] || card.title.th}
            subtitle={card.subtitle[lang] || card.subtitle.th}
            cta={lang === "th" ? "เลือกชม" : "View"}
            warm={card.kind === "charm"}
          />
        ))}
      </div>
    </main>
  );
}
