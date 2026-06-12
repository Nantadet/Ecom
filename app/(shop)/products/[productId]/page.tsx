import { notFound } from "next/navigation";
import {
  ProductDetailView,
  type ProductDetailProduct,
} from "@/components/shop/product-detail-view";
import { listStoreProducts } from "@/lib/backend/products/product-service";

// Always read fresh products so admin edits show up immediately (no build cache).
export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;
  const products = await listStoreProducts();
  const product = products.find((item) => item.id === productId);

  if (!product) {
    notFound();
  }

  const detailProduct: ProductDetailProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    category: product.category,
    options: product.options,
    imageUrl: product.imageUrl,
    shippingFirstItem: product.shippingFirstItem,
    shippingAdditionalItem: product.shippingAdditionalItem,
    remoteShippingFirstItem: product.remoteShippingFirstItem,
    remoteShippingAdditionalItem: product.remoteShippingAdditionalItem,
    islandShippingFirstItem: product.islandShippingFirstItem,
    islandShippingAdditionalItem: product.islandShippingAdditionalItem,
    imageUrls: product.imageUrls,
  };

  return <ProductDetailView product={detailProduct} />;
}
