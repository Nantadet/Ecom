export type ShopFlowKind = "bottle" | "secret" | "bracelet" | "charm" | "other";

export type FlowProductLike = {
  id: string;
  slug?: string;
  category?: string;
  name?: {
    th?: string;
    en?: string;
  };
  imageUrl?: string;
  imageUrls?: string[];
};

export const FLOW_ASSETS: Record<Exclude<ShopFlowKind, "other">, string> = {
  bottle: "/images/bottle.jpg",
  secret: "/images/secret-set.png",
  bracelet: "/images/bracelet-hero.png",
  charm: "/images/charm-grid.png",
};

export const FLOW_LABELS: Record<Exclude<ShopFlowKind, "other">, { th: string; en: string }> = {
  bottle: { th: "ขวดน้ำ", en: "Bottle" },
  secret: { th: "Secret Set", en: "Secret Set" },
  bracelet: { th: "สร้อยข้อมือ", en: "Bracelet" },
  charm: { th: "Charm", en: "Charm" },
};

function compact(value: string) {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

export function normalizeFlowCategory(value?: string): ShopFlowKind {
  const text = compact(value ?? "");
  if (!text) return "other";

  if (
    text.includes("bottle") ||
    text.includes("waterbottle") ||
    text.includes("tumbler") ||
    text.includes("cup") ||
    text.includes("drinkware") ||
    text.includes("ขวด") ||
    text.includes("แก้ว")
  ) {
    return "bottle";
  }

  if (text.includes("secret") || text.includes("mystery") || text.includes("surprise")) {
    return "secret";
  }

  if (text.includes("bracelet") || text.includes("chain") || text.includes("สร้อย")) {
    return "bracelet";
  }

  if (text.includes("charm") || text.includes("pendant") || text.includes("จี้")) {
    return "charm";
  }

  return "other";
}

export function getProductFlowKind(product: FlowProductLike): ShopFlowKind {
  const categoryKind = normalizeFlowCategory(product.category);
  if (categoryKind !== "other") return categoryKind;

  const nameText = [product.name?.th, product.name?.en, product.slug].filter(Boolean).join(" ");
  return normalizeFlowCategory(nameText);
}

export function findFlowProduct<T extends FlowProductLike>(products: T[], kind: Exclude<ShopFlowKind, "other">) {
  return products.find((product) => getProductFlowKind(product) === kind);
}

export function flowProductImage(product: FlowProductLike | undefined, kind: Exclude<ShopFlowKind, "other">) {
  return product?.imageUrls?.[0] || product?.imageUrl || FLOW_ASSETS[kind];
}

export function flowProductHref(product: FlowProductLike | undefined, fallback: string) {
  return product ? `/products/${product.id}` : fallback;
}
