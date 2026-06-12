"use client";

import * as React from "react";
import { Package, Search, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Product } from "@/components/admin/types";
import ProductCard from "@/components/admin/product-card";
import { FLOW_LABELS, getProductFlowKind, type ShopFlowKind } from "@/lib/shop/product-flow";

type ProductsPanelProps = {
  products: Product[];
  onUpdateProduct: (updated: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onEditProduct: (p: Product) => void;
  lang: string;
  t: (key: string) => string;
};

export function ProductsPanel({
  products,
  onUpdateProduct,
  onDeleteProduct,
  onEditProduct,
  lang,
  t,
}: ProductsPanelProps) {
  const [productSearch, setProductSearch] = React.useState("");
  const [flowFilter, setFlowFilter] = React.useState<ShopFlowKind | "all">("all");

  const filteredProducts = React.useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    return products.filter((product) => {
      const flowKind = getProductFlowKind(product);
      if (flowFilter !== "all" && flowKind !== flowFilter) return false;
      if (!query) return true;
      const nameTh = product.name.th.toLowerCase();
      const nameEn = product.name.en?.toLowerCase() ?? "";
      const descTh = product.description?.th.toLowerCase() ?? "";
      const descEn = product.description?.en?.toLowerCase() ?? "";
      const category = product.category?.toLowerCase() ?? "";
      return (
        nameTh.includes(query) ||
        nameEn.includes(query) ||
        descTh.includes(query) ||
        descEn.includes(query) ||
        category.includes(query)
      );
    });
  }, [flowFilter, products, productSearch]);

  const flowTabs = React.useMemo(() => {
    const labels = lang === "th" ? {
      all: "ทั้งหมด",
      bottle: FLOW_LABELS.bottle.th,
      secret: FLOW_LABELS.secret.th,
      bracelet: FLOW_LABELS.bracelet.th,
      charm: FLOW_LABELS.charm.th,
    } : {
      all: "All",
      bottle: FLOW_LABELS.bottle.en,
      secret: FLOW_LABELS.secret.en,
      bracelet: FLOW_LABELS.bracelet.en,
      charm: FLOW_LABELS.charm.en,
    };
    return [
      { value: "all" as const, label: labels.all },
      { value: "bottle" as const, label: labels.bottle },
      { value: "secret" as const, label: labels.secret },
      { value: "bracelet" as const, label: labels.bracelet },
      { value: "charm" as const, label: labels.charm },
    ];
  }, [lang]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header row — title + search */}
      <div className="flex items-center gap-3">
        <h2 className="font-bold text-gray-900 text-sm shrink-0">{t("admin.tab.products")}</h2>
        <div className="flex-1 flex items-center gap-3 rounded-2xl border border-gray-200/60 bg-white px-4 py-3 shadow-2xs focus-within:border-[#85241F] focus-within:ring-2 focus-within:ring-[#85241F]/5 transition-all">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <Input
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder={lang === "th" ? "ค้นหาสินค้า..." : "Search products..."}
            className="flex-1 border-none bg-transparent text-xs text-gray-800 placeholder:text-gray-400 shadow-none focus-visible:ring-0 p-0 h-auto"
          />
          {productSearch && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setProductSearch("")}
              className="text-gray-400 hover:text-gray-600 h-auto w-auto p-0 cursor-pointer"
            >
              <XCircle className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Product grid — full width */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {flowTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFlowFilter(tab.value)}
            className={`h-9 shrink-0 rounded-xl border px-3 text-xs font-black transition-colors ${
              flowFilter === tab.value
                ? "border-[#85241F] bg-[#85241F]/8 text-[#85241F]"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onUpdate={onUpdateProduct}
              onDelete={onDeleteProduct}
              onEdit={onEditProduct}
              t={t}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-3xl py-16 flex flex-col items-center justify-center text-center shadow-2xs">
          <Package className="w-8 h-8 text-gray-300 mb-2" />
          <p className="text-xs text-gray-400 font-semibold">{t("admin.products.empty")}</p>
        </div>
      )}
    </div>
  );
}
