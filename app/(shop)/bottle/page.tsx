import { redirect } from "next/navigation";
import { listStoreProducts } from "@/lib/backend/products/product-service";
import { findFlowProduct } from "@/lib/shop/product-flow";

export const dynamic = "force-dynamic";

export default async function BottleEntryPage() {
  const products = await listStoreProducts();
  const bottle = findFlowProduct(products, "bottle");

  if (bottle) {
    redirect(`/products/${bottle.id}`);
  }

  redirect("/home");
}
