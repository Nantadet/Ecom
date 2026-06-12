import { listStoreProducts } from "@/lib/backend/products/product-service";
import { BraceletFlowClient } from "@/components/shop/bracelet-flow-client";

export const dynamic = "force-dynamic";

type ProductOption = {
  label: string;
  imageUrl?: string;
  stock?: number;
};

type LocalizedText = {
  th: string;
  en?: string;
};

type ApiProduct = {
  id: string;
  name: LocalizedText;
  description?: LocalizedText;
  price: number;
  stock: number;
  shippingFirstItem?: number;
  shippingAdditionalItem?: number;
  category?: string;
  options?: Array<string | ProductOption>;
  imageUrl?: string;
  imageUrls?: string[];
  active: boolean;
};

function normalizeOptions(options?: Array<string | ProductOption>) {
  if (!Array.isArray(options)) return [];

  return options
    .map((option) => {
      if (typeof option === "string") return { label: option.trim(), imageUrl: "" };
      return {
        label: option.label?.trim() ?? "",
        imageUrl: option.imageUrl?.trim() ?? "",
        stock: option.stock,
      };
    })
    .filter((option) => option.label);
}

function apiToDisplay(product: ApiProduct) {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? { th: "" },
    price: Number(product.price ?? 0),
    stock: Number(product.stock ?? 0),
    shippingFirstItem: Number(product.shippingFirstItem ?? 0),
    shippingAdditionalItem: Number(product.shippingAdditionalItem ?? 0),
    category: product.category ?? "",
    options: normalizeOptions(product.options),
    imageUrl: product.imageUrl,
    imageUrls: product.imageUrls,
  };
}

export default async function BraceletsPage() {
  const products = await listStoreProducts();
  const displayProducts = products
    .filter((product) => product.active !== false)
    .map((product) => apiToDisplay(product as unknown as ApiProduct));

  return <BraceletFlowClient products={displayProducts} />;
}
