"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Droplets,
  Gem,
  Gift,
  Leaf,
  Minus,
  PackageCheck,
  Pencil,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Snowflake,
  Sparkles,
  Truck,
} from "lucide-react";
import { useCart } from "@/lib/client/cart";
import { useCartFly } from "@/lib/client/cart-fly";
import { vibrateTap } from "@/lib/client/haptics";
import { useLanguage } from "@/lib/client/language-context";
import {
  FLOW_ASSETS,
  flowProductImage,
  getProductFlowKind,
  type ShopFlowKind,
} from "@/lib/shop/product-flow";

export type LocalizedText = {
  th: string;
  en?: string;
};

export type ProductOption = {
  label: string;
  imageUrl?: string;
  stock?: number;
};

export type ProductDetailProduct = {
  id: string;
  name: LocalizedText;
  slug?: string;
  description?: LocalizedText;
  price: number;
  stock: number;
  category?: string;
  options?: ProductOption[];
  imageUrl?: string;
  imageUrls?: string[];
  shippingFirstItem?: number;
  shippingAdditionalItem?: number;
  remoteShippingFirstItem?: number;
  remoteShippingAdditionalItem?: number;
  islandShippingFirstItem?: number;
  islandShippingAdditionalItem?: number;
};

type Lang = "th" | "en";

type Feature = {
  icon: React.ElementType;
  title: Record<Lang, string>;
  caption: Record<Lang, string>;
};

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const FEATURES: Record<Exclude<ShopFlowKind, "other">, Feature[]> = {
  bottle: [
    {
      icon: Leaf,
      title: { th: "วัสดุปลอดภัย", en: "Safe material" },
      caption: { th: "Tritan BPA Free", en: "Tritan BPA Free" },
    },
    {
      icon: Snowflake,
      title: { th: "เก็บความเย็น", en: "Cool carry" },
      caption: { th: "ได้นาน 12 ชม.", en: "Up to 12 hours" },
    },
    {
      icon: Droplets,
      title: { th: "พกพาสะดวก", en: "Daily friendly" },
      caption: { th: "น้ำหนักเบา", en: "Lightweight" },
    },
  ],
  secret: [
    {
      icon: Sparkles,
      title: { th: "ของเซอร์ไพรส์", en: "Surprise pick" },
      caption: { th: "ลุ้นไอเท็มพิเศษ", en: "Mystery inside" },
    },
    {
      icon: ShieldCheck,
      title: { th: "ของแท้", en: "Curated set" },
      caption: { th: "คุณภาพพรีเมียม", en: "Premium quality" },
    },
    {
      icon: Gift,
      title: { th: "แพ็กเกจดี", en: "Gift ready" },
      caption: { th: "พร้อมมอบ", en: "Ready to gift" },
    },
  ],
  bracelet: [
    {
      icon: Sparkles,
      title: { th: "สแตนเลส", en: "Stainless steel" },
      caption: { th: "สีเงินเงางาม", en: "Polished silver" },
    },
    {
      icon: ShieldCheck,
      title: { th: "ใส่ง่าย", en: "Comfort wear" },
      caption: { th: "ไม่แพ้ง่าย", en: "Gentle feel" },
    },
    {
      icon: Gem,
      title: { th: "ปรับแต่งได้", en: "Customizable" },
      caption: { th: "ใส่ Charm เพิ่ม", en: "Add charms" },
    },
  ],
  charm: [
    {
      icon: Sparkles,
      title: { th: "หลายสไตล์", en: "Many styles" },
      caption: { th: "เลือกได้ตามใจ", en: "Pick your mood" },
    },
    {
      icon: ShieldCheck,
      title: { th: "อะไหล่แน่น", en: "Secure clip" },
      caption: { th: "ใช้งานง่าย", en: "Easy to attach" },
    },
    {
      icon: Gem,
      title: { th: "เข้าชุด", en: "Mix & match" },
      caption: { th: "คู่สร้อยเงิน", en: "For bracelets" },
    },
  ],
};

function money(value: number) {
  return currencyFormatter.format(value);
}

function text(value: LocalizedText | undefined, lang: Lang, fallback = "") {
  if (!value) return fallback;
  return value[lang] || value.th || value.en || fallback;
}

function isKnownFlow(kind: ShopFlowKind): kind is Exclude<ShopFlowKind, "other"> {
  return kind !== "other";
}

function productMainImage(product: ProductDetailProduct, kind: ShopFlowKind, option?: ProductOption) {
  if (option?.imageUrl) return option.imageUrl;
  if (isKnownFlow(kind)) return flowProductImage(product, kind);
  return product.imageUrls?.[0] || product.imageUrl || FLOW_ASSETS.bottle;
}

function DetailShell({
  children,
  toast,
}: {
  children: React.ReactNode;
  toast: { kind: "added" | "alert"; text: string } | null;
}) {
  return (
    <main className="min-h-screen bg-white">
      <div className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${toast ? "opacity-100" : "opacity-0"}`}>
        <div className="mx-6 flex max-w-sm items-center gap-3 rounded-2xl bg-slate-950/92 px-5 py-4 text-white shadow-xl">
          {toast?.kind === "alert"
            ? <AlertCircle className="h-5 w-5 shrink-0 text-amber-300" />
            : <ShoppingCart className="h-5 w-5 shrink-0 text-emerald-300" />}
          <span className="text-sm font-bold">{toast?.text}</span>
        </div>
      </div>
      {children}
    </main>
  );
}

function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#0b2a55] shadow-md backdrop-blur-sm transition-transform active:scale-95"
      aria-label="Back"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}

function FeatureGrid({ kind, lang }: { kind: Exclude<ShopFlowKind, "other">; lang: Lang }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {FEATURES[kind].map((feature) => {
        const Icon = feature.icon;
        return (
          <div key={feature.title.th} className="rounded-2xl border border-[#dbeafe] bg-white/82 px-2.5 py-3 text-center shadow-sm">
            <Icon className="mx-auto h-5 w-5 text-[#0f4f9c]" />
            <p className="mt-2 text-[11px] font-black leading-tight text-[#0b2a55]">{feature.title[lang]}</p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-[#5c789a]">{feature.caption[lang]}</p>
          </div>
        );
      })}
    </div>
  );
}

function QuantityStepper({
  value,
  max,
  disabled,
  onChange,
}: {
  value: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-2 py-1.5 shadow-sm">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 text-gray-700 transition-transform active:scale-95"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-6 text-center text-sm font-black text-gray-900">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#102f5c] text-white transition-transform active:scale-95 disabled:bg-gray-200 disabled:text-gray-400"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function CharmOptionGrid({
  options,
  selectedLabel,
  productStock,
  price,
  lang,
  onSelect,
}: {
  options: ProductOption[];
  selectedLabel: string;
  productStock: number;
  price: number;
  lang: Lang;
  onSelect: (label: string) => void;
}) {
  const [filter, setFilter] = React.useState<"all" | "lock" | "dangling">("all");

  const visibleOptions = React.useMemo(() => {
    if (filter === "all") return options;
    return options.filter((option) => {
      const label = option.label.toLowerCase();
      const isLock = label.includes("lock") || label.includes("ล็อก");
      return filter === "lock" ? isLock : !isLock;
    });
  }, [filter, options]);

  const filters = [
    { value: "all" as const, label: lang === "th" ? "ทั้งหมด" : "All" },
    { value: "lock" as const, label: lang === "th" ? "ที่ล็อก" : "Lock" },
    { value: "dangling" as const, label: lang === "th" ? "ที่ห้อย" : "Dangling" },
  ];

  return (
    <section className="rounded-[24px] bg-white px-4 py-5 shadow-[0_12px_36px_rgba(15,23,42,0.08)] sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-lg font-black text-[#0b2a55]">{lang === "th" ? "เลือกซื้อ Charm" : "Choose Charms"}</h1>
        <ArrowLeft className="h-4 w-4 rotate-180 text-[#0b2a55]" />
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`h-12 rounded-2xl border text-xs font-black transition-colors ${
              filter === item.value
                ? "border-[#2b62d9] bg-[#eef5ff] text-[#123a7b]"
                : "border-gray-100 bg-gray-50 text-gray-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 lg:grid-cols-5">
        {visibleOptions.map((option) => {
          const optionStock = option.stock ?? productStock;
          const selected = option.label === selectedLabel;
          const out = optionStock < 1;
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => onSelect(option.label)}
              disabled={out}
              className={`group relative min-w-0 rounded-2xl p-1 text-left transition-all active:scale-[0.98] disabled:opacity-45 ${
                selected ? "bg-[#eef5ff] ring-2 ring-[#2b62d9]" : "hover:bg-gray-50"
              }`}
            >
              <span className="absolute right-0.5 top-0.5 z-10 flex h-5 w-5 items-center justify-center rounded-md bg-[#102f5c] text-white shadow-sm">
                {selected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </span>
              <span className="block aspect-square overflow-hidden rounded-xl bg-gray-50">
                {option.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={option.imageUrl} alt={option.label} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    <Gem className="h-8 w-8 text-gray-300" />
                  </span>
                )}
              </span>
              <span className="mt-2 block truncate text-[11px] font-black text-[#0b2a55]">{option.label}</span>
              <span className="mt-0.5 block text-[10px] font-black text-[#12396b]">
                {out ? (lang === "th" ? "หมด" : "Sold") : money(price)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function ProductDetailView({ product }: { product: ProductDetailProduct }) {
  const router = useRouter();
  const { addItem, items } = useCart();
  const { flyToCart } = useCartFly();
  const { lang } = useLanguage();
  const detailLang = lang as Lang;
  const addButtonRef = React.useRef<HTMLButtonElement>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const kind = getProductFlowKind(product);
  const visualKind = isKnownFlow(kind) ? kind : "bracelet";
  const options = product.options ?? [];
  const [selectedOptionLabel, setSelectedOptionLabel] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);
  const [personalizing, setPersonalizing] = React.useState(false);
  const [stickerName, setStickerName] = React.useState("");
  const [toast, setToast] = React.useState<{ kind: "added" | "alert"; text: string } | null>(null);

  const selectedOption = options.find((option) => option.label === selectedOptionLabel);
  const selectedOptionStock = selectedOption ? (selectedOption.stock ?? product.stock) : product.stock;
  const hasOptions = options.length > 0;
  const mustSelectOption = hasOptions && !selectedOption;
  const selectedOutOfStock = Boolean(selectedOption && selectedOptionStock < 1);
  const outOfStock = hasOptions
    ? options.every((option) => (option.stock ?? product.stock) < 1)
    : product.stock < 1;

  const mainImage = productMainImage(product, kind, selectedOption);
  const stickerText = stickerName.trim();
  const cartOptionLabel = hasOptions
    ? selectedOption?.label ?? ""
    : stickerText
      ? `สติ๊กเกอร์ชื่อ: ${stickerText}`
      : "";
  const cartQty = React.useMemo(
    () => items
      .filter((item) => {
        if (item.productId !== product.id) return false;
        if (!hasOptions) return true;
        return (item.selectedOption ?? "") === cartOptionLabel;
      })
      .reduce((sum, item) => sum + item.quantity, 0),
    [cartOptionLabel, hasOptions, items, product.id],
  );
  const remainingStock = selectedOptionStock - cartQty;

  function showToast(kind: "added" | "alert", text: string) {
    setToast({ kind, text });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  function selectOption(label: string) {
    const next = options.find((option) => option.label === label);
    if (!next || (next.stock ?? product.stock) < 1) return;
    setSelectedOptionLabel(label);
    setQuantity((current) => Math.min(current, next.stock ?? product.stock));
  }

  function handleAddToCart(source?: HTMLElement | null) {
    vibrateTap();

    if (mustSelectOption) {
      showToast("alert", detailLang === "th" ? "กรุณาเลือกตัวเลือกก่อน" : "Please choose an option first");
      return false;
    }

    if (outOfStock || selectedOutOfStock) {
      showToast("alert", detailLang === "th" ? "สินค้าหมดแล้ว" : "Out of stock");
      return false;
    }

    if (remainingStock <= 0) {
      showToast("alert", detailLang === "th" ? `เพิ่มไม่ได้แล้ว เหลือในสต็อก ${selectedOptionStock} ชิ้น` : `Only ${selectedOptionStock} left`);
      return false;
    }

    const addCount = Math.min(quantity, remainingStock);
    for (let i = 0; i < addCount; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: selectedOptionStock,
        shippingFirstItem: product.shippingFirstItem ?? 0,
        shippingAdditionalItem: product.shippingAdditionalItem ?? 0,
        remoteShippingFirstItem: product.remoteShippingFirstItem ?? 0,
        remoteShippingAdditionalItem: product.remoteShippingAdditionalItem ?? 0,
        islandShippingFirstItem: product.islandShippingFirstItem ?? 0,
        islandShippingAdditionalItem: product.islandShippingAdditionalItem ?? 0,
        imageUrl: selectedOption?.imageUrl || mainImage,
        selectedOption: cartOptionLabel || undefined,
      });
    }

    const flySource = source ?? addButtonRef.current;
    if (flySource) flyToCart(flySource, selectedOption?.imageUrl || mainImage);
    showToast("added", detailLang === "th" ? `เพิ่มลงตะกร้าแล้ว ${addCount} ชิ้น` : `Added ${addCount} item${addCount > 1 ? "s" : ""}`);
    return true;
  }

  function handleBuyNow() {
    if (!handleAddToCart()) return;
    router.push("/cart?selectAll=1");
  }

  if (visualKind === "charm" && options.length > 0) {
    return (
      <DetailShell toast={toast}>
        <div className="relative mx-auto max-w-6xl px-3 py-4 pb-28 sm:px-5 lg:py-8">
          <BackButton />
          <div className="pt-12">
            <CharmOptionGrid
              options={options}
              selectedLabel={selectedOptionLabel}
              productStock={product.stock}
              price={product.price}
              lang={detailLang}
              onSelect={selectOption}
            />
          </div>
        </div>
        <ActionBar
          total={product.price * quantity}
          quantity={quantity}
          maxQuantity={Math.max(1, selectedOptionStock)}
          disabled={outOfStock || mustSelectOption || selectedOutOfStock}
          lang={detailLang}
          addButtonRef={addButtonRef}
          onQuantityChange={setQuantity}
          onAdd={handleAddToCart}
          onBuy={handleBuyNow}
        />
      </DetailShell>
    );
  }

  return (
    <DetailShell toast={toast}>
      <div className="relative mx-auto max-w-6xl px-3 py-4 pb-32 sm:px-5 lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(380px,0.85fr)] lg:gap-7 lg:py-8">
        <BackButton />

        <section className={`relative min-h-[430px] overflow-hidden rounded-[28px] border border-white shadow-[0_18px_54px_rgba(15,23,42,0.10)] ${
          visualKind === "bottle"
            ? "bg-[linear-gradient(135deg,#e5f5ff_0%,#f7fbff_52%,#d6ecff_100%)]"
            : "bg-[linear-gradient(135deg,#f7fbff_0%,#ffffff_48%,#e9f5ff_100%)]"
        }`}>
          <div className="absolute -left-16 bottom-0 h-36 w-56 rounded-full bg-white/70 blur-3xl" />
          <div className="absolute -right-10 top-2 h-32 w-32 rounded-full bg-[#91d6b0]/25 blur-2xl" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(0deg,rgba(255,255,255,.88),rgba(255,255,255,0))]" />

          <div className="relative z-10 flex min-h-[430px] flex-col px-6 pb-7 pt-16 sm:px-8 lg:min-h-[560px]">
            <div className="max-w-[52%]">
              <p className="text-sm font-black text-[#24649d]">{visualKind === "bottle" ? "HLLC Bottle" : "HLLC Jewelry"}</p>
              <h1 className="mt-2 text-[clamp(2.5rem,10vw,5rem)] font-black leading-[0.9] tracking-normal text-[#0b2a55]">
                {visualKind === "bottle" ? (detailLang === "th" ? "ขวดน้ำ" : "Bottle") : text(product.name, detailLang)}
              </h1>
              {visualKind === "bottle" ? (
                <p className="mt-3 text-base font-bold leading-tight text-[#183a62]">
                  {detailLang === "th" ? "พกพาสะดวก ดีไซน์สวย ใช้งานง่าย" : "Fresh design for every day"}
                </p>
              ) : null}
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainImage}
              alt={text(product.name, detailLang)}
              className={`absolute object-contain drop-shadow-[0_22px_30px_rgba(15,23,42,0.18)] ${
                visualKind === "bottle"
                  ? "bottom-8 right-[5%] h-[78%] w-[54%]"
                  : "inset-x-0 bottom-5 mx-auto h-[70%] w-[86%] rounded-[24px] object-cover"
              }`}
            />

            <div className="relative z-20 mt-auto">
              <FeatureGrid kind={visualKind} lang={detailLang} />
            </div>
          </div>
        </section>

        <section className="mt-4 flex flex-col gap-4 lg:mt-0">
          <div className="rounded-[24px] border border-gray-100 bg-white px-5 py-5 shadow-[0_12px_36px_rgba(15,23,42,0.07)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-[#7aa4ce]">{visualKind === "secret" ? "Mystery" : visualKind === "bracelet" ? "Bracelet" : "Product"}</p>
                <h2 className="mt-1 text-2xl font-black leading-tight text-[#0b2a55]">{text(product.name, detailLang)}</h2>
              </div>
              <span className="rounded-2xl bg-[#edf6ff] px-3 py-2 text-sm font-black text-[#0b2a55]">{money(product.price)}</span>
            </div>

            {text(product.description, detailLang) ? (
              <p className="mt-4 text-sm font-semibold leading-relaxed text-[#55677c]">
                {text(product.description, detailLang)}
              </p>
            ) : null}
          </div>

          {visualKind === "bottle" ? (
            <div className="rounded-[24px] border border-[#dbeafe] bg-[#f7fbff] px-5 py-5 shadow-sm">
              {!personalizing ? (
                <button
                  type="button"
                  onClick={() => setPersonalizing(true)}
                  className="flex h-13 w-full items-center justify-center gap-3 rounded-2xl bg-[#102f5c] text-sm font-black text-white shadow-lg shadow-[#102f5c]/15 transition-transform active:scale-[0.98]"
                >
                  <Plus className="h-5 w-5" />
                  {detailLang === "th" ? "เพิ่มสติกเกอร์ชื่อ" : "Add name sticker"}
                </button>
              ) : (
                <div>
                  <div className="mb-4 text-center">
                    <p className="text-xl font-black leading-tight text-[#0b2a55]">
                      {detailLang === "th" ? "เพิ่มความเป็นตัวคุณ" : "Make it yours"}
                    </p>
                    <p className="text-sm font-black text-[#0b2a55]">
                      {detailLang === "th" ? "ลงบนขวดน้ำ" : "on your bottle"}
                    </p>
                  </div>
                  <label className="grid gap-2">
                    <span className="text-xs font-black text-[#0b2a55]">{detailLang === "th" ? "ใส่ชื่อของคุณ" : "Your name"}</span>
                    <div className="relative">
                      <Pencil className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2c68a0]" />
                      <input
                        value={stickerName}
                        onChange={(event) => setStickerName(event.target.value.slice(0, 12))}
                        placeholder={detailLang === "th" ? "ใส่ชื่อ (ไม่เกิน 12 ตัวอักษร)" : "Name, up to 12 characters"}
                        className="h-12 w-full rounded-2xl border border-[#c7dff6] bg-white pl-10 pr-12 text-sm font-bold text-[#0b2a55] outline-none transition-colors placeholder:text-[#9bb6d0] focus:border-[#2b62d9]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-[#9bb6d0]">{stickerName.length}/12</span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          ) : null}

          {hasOptions ? (
            <div className="rounded-[24px] border border-gray-100 bg-white px-5 py-5 shadow-sm">
              <p className="mb-3 text-sm font-black text-[#0b2a55]">{detailLang === "th" ? "ตัวเลือกสินค้า" : "Options"}</p>
              <div className="grid grid-cols-2 gap-2">
                {options.map((option) => {
                  const selected = selectedOptionLabel === option.label;
                  const optionStock = option.stock ?? product.stock;
                  const optionOut = optionStock < 1;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => selectOption(option.label)}
                      disabled={optionOut}
                      className={`flex min-h-16 items-center gap-2 rounded-2xl border p-2 text-left transition-all disabled:opacity-50 ${
                        selected ? "border-[#2b62d9] bg-[#eef5ff]" : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      {option.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={option.imageUrl} alt={option.label} className="h-11 w-11 rounded-xl object-cover" />
                      ) : (
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
                          <Gem className="h-5 w-5 text-gray-300" />
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-black text-[#0b2a55]">{option.label}</span>
                        <span className="mt-0.5 block text-[10px] font-bold text-[#7891ac]">{optionOut ? "Sold out" : `${optionStock} pcs`}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="rounded-[24px] border border-gray-100 bg-[#f8fbff] px-5 py-5 shadow-sm">
            <p className="mb-3 text-sm font-black text-[#0b2a55]">{detailLang === "th" ? "รายละเอียดสินค้า" : "Details"}</p>
            <ul className="space-y-2 text-sm font-semibold leading-relaxed text-[#52657b]">
              <li className="flex gap-2"><PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2b62d9]" />{detailLang === "th" ? "พร้อมจัดส่งและแพ็กอย่างดี" : "Packed carefully and ready to ship"}</li>
              <li className="flex gap-2"><Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#2b62d9]" />{detailLang === "th" ? "รองรับจัดส่งและรับเองที่ร้าน" : "Delivery and pickup are available"}</li>
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2b62d9]" />{detailLang === "th" ? "ตรวจสอบออเดอร์ได้จากหน้าโปรไฟล์" : "Track your order from the profile page"}</li>
            </ul>
          </div>
        </section>
      </div>

      <ActionBar
        total={product.price * quantity}
        quantity={quantity}
        maxQuantity={Math.max(1, selectedOptionStock)}
        disabled={outOfStock || mustSelectOption || selectedOutOfStock}
        lang={detailLang}
        addButtonRef={addButtonRef}
        onQuantityChange={setQuantity}
        onAdd={handleAddToCart}
        onBuy={handleBuyNow}
      />
    </DetailShell>
  );
}

function ActionBar({
  total,
  quantity,
  maxQuantity,
  disabled,
  lang,
  addButtonRef,
  onQuantityChange,
  onAdd,
  onBuy,
}: {
  total: number;
  quantity: number;
  maxQuantity: number;
  disabled?: boolean;
  lang: Lang;
  addButtonRef: React.RefObject<HTMLButtonElement | null>;
  onQuantityChange: (value: number) => void;
  onAdd: (source?: HTMLElement | null) => boolean;
  onBuy: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-100 bg-white/96 px-3 py-3 shadow-[0_-14px_34px_rgba(15,23,42,0.08)] backdrop-blur-md lg:px-[calc(14rem+1.25rem)] xl:px-[calc(16rem+1.25rem)]">
      <div className="mx-auto flex max-w-6xl items-center gap-2 sm:gap-3">
        <div className="hidden sm:block">
          <QuantityStepper value={quantity} max={maxQuantity} disabled={disabled} onChange={onQuantityChange} />
        </div>
        <div className="mr-auto min-w-18">
          <p className="text-[10px] font-black text-gray-400">{lang === "th" ? "ราคารวม" : "Total"}</p>
          <p className="text-sm font-black text-[#102f5c] sm:text-base">{money(total)}</p>
        </div>
        <button
          ref={addButtonRef}
          type="button"
          onClick={(event) => onAdd(event.currentTarget)}
          disabled={disabled}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-[#ff3b30] bg-white text-sm font-black text-[#ff3b30] shadow-sm transition-transform active:scale-[0.98] disabled:border-gray-200 disabled:text-gray-300"
        >
          <Gift className="h-5 w-5" />
          {lang === "th" ? "ใส่ตะกร้า" : "Add"}
        </button>
        <button
          type="button"
          onClick={onBuy}
          disabled={disabled}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#102f5c] text-sm font-black text-white shadow-lg shadow-[#102f5c]/15 transition-transform active:scale-[0.98] disabled:bg-gray-300"
        >
          <ShoppingCart className="h-5 w-5" />
          {lang === "th" ? "ซื้อเลย" : "Buy now"}
        </button>
      </div>
    </div>
  );
}
