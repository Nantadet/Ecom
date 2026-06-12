"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowRight, Droplets, Gem, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/client/language-context";
import { findFlowProduct, flowProductImage } from "@/lib/shop/product-flow";

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

type HomeClientProps = {
  products: DisplayProduct[];
};

function BottleBackdrop() {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#dff3ff_0%,#f5fbff_48%,#cfe8ff_100%)]" />
      <div className="absolute -left-8 bottom-0 h-24 w-40 rounded-full bg-white/70 blur-2xl" />
      <div className="absolute -right-10 -top-8 h-28 w-28 rounded-full bg-[#7fc7a4]/25 blur-2xl" />
      <div className="absolute right-4 top-5 h-14 w-24 rotate-12 rounded-full border-t border-[#3a7e64]/25" />
      <div className="absolute bottom-0 left-0 h-20 w-full bg-[linear-gradient(0deg,rgba(255,255,255,.78),rgba(255,255,255,0))]" />
    </>
  );
}

function JewelryBackdrop() {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#f9efe8_0%,#fff9f4_42%,#e8f5ff_100%)]" />
      <div className="absolute -left-10 top-6 h-28 w-28 rounded-full bg-[#73513d]/10 blur-2xl" />
      <div className="absolute right-0 bottom-0 h-24 w-32 rounded-full bg-[#9bd2ff]/25 blur-2xl" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(0deg,rgba(255,255,255,.84),rgba(255,255,255,0))]" />
    </>
  );
}

function EntryCard({
  href,
  title,
  subtitle,
  cta,
  image,
  tone,
}: {
  href: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  tone: "bottle" | "jewelry";
}) {
  const isBottle = tone === "bottle";

  return (
    <Link
      href={href}
      className={`group relative block min-h-[212px] overflow-hidden rounded-[24px] border border-white shadow-[0_16px_44px_rgba(15,23,42,0.08)] transition-transform active:scale-[0.985] sm:min-h-[260px] ${
        isBottle ? "text-[#0b2a55]" : "text-[#5a3e2b]"
      }`}
    >
      {isBottle ? <BottleBackdrop /> : <JewelryBackdrop />}

      <div className="relative z-10 flex h-full min-h-[212px] items-center px-8 py-7 sm:min-h-[260px] sm:px-10">
        <div className="max-w-[48%]">
          <div
            className={`mb-3 flex h-9 w-9 items-center justify-center rounded-2xl ${
              isBottle ? "bg-white/80 text-[#12396b]" : "bg-white/80 text-[#73513d]"
            } shadow-sm`}
          >
            {isBottle ? <Droplets className="h-5 w-5" /> : <Gem className="h-5 w-5" />}
          </div>
          <h1 className="text-[clamp(2.25rem,9vw,4.25rem)] font-black leading-[0.9] tracking-normal">
            {title}
          </h1>
          <p className="mt-3 max-w-44 text-sm font-bold leading-snug sm:text-base">
            {subtitle}
          </p>
          <span
            className={`mt-4 inline-flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-black text-white shadow-lg transition-transform group-hover:translate-x-1 ${
              isBottle ? "bg-[#102f5c]" : "bg-[#73513d]"
            }`}
          >
            {cta}
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        className={`absolute z-10 object-contain drop-shadow-[0_18px_24px_rgba(15,23,42,0.14)] transition-transform duration-500 group-hover:scale-[1.03] ${
          isBottle
            ? "right-[-7%] bottom-[-5%] h-[104%] w-[58%] sm:right-[4%] sm:h-[96%]"
            : "left-0 top-0 h-full w-full object-cover opacity-95"
        }`}
      />
      {!isBottle && (
        <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(255,255,255,.90),rgba(255,255,255,.55)_48%,rgba(255,255,255,.08))]" />
      )}
      {!isBottle && (
        <Sparkles className="absolute right-7 top-7 z-20 h-6 w-6 text-[#73513d]/45" />
      )}
    </Link>
  );
}

export function HomeClient({ products }: HomeClientProps) {
  const { lang } = useLanguage();
  const bottle = React.useMemo(() => findFlowProduct(products, "bottle"), [products]);
  const bracelet = React.useMemo(() => findFlowProduct(products, "bracelet"), [products]);

  void bracelet;

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-4 pb-10 sm:gap-5 sm:px-5 lg:py-8">
        <EntryCard
          href="/bottle"
          title={lang === "th" ? "ขวดน้ำ" : "Bottle"}
          subtitle={lang === "th" ? "พกพาสะดวก ดีไซน์สวย ใช้งานง่าย" : "Carry comfort with a fresh daily design"}
          cta={lang === "th" ? "ช้อปเลย" : "Shop now"}
          image={flowProductImage(bottle, "bottle")}
          tone="bottle"
        />

        <EntryCard
          href="/bracelets"
          title={lang === "th" ? "สร้อยข้อมือ" : "Bracelet"}
          subtitle={lang === "th" ? "พร้อม Charm เติมความน่ารักให้ทุกวันพิเศษของคุณ" : "Add charm to every little moment"}
          cta={lang === "th" ? "ช้อปเลย" : "Shop now"}
          image="/images/charm-grid.png"
          tone="jewelry"
        />
      </div>
    </main>
  );
}
