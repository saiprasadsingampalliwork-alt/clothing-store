import { ProductView } from "@/components/product-view";
import { RemoteProduct } from "@/components/remote-product";
import { getProduct, products, toProduct, type Product } from "@/lib/catalog";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

// Ask the API first so drafts and archived pieces are not rendered for shoppers.
// The built-in catalog is only a fallback when the API cannot be reached.
async function fetchProduct(slug: string): Promise<Product | undefined> {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";
  try {
    const res = await fetch(`${apiUrl}/catalog/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return undefined;
    const data = await res.json();
    return data?.product ? toProduct(data.product) : undefined;
  } catch {
    return getProduct(slug);
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return { title: "Product" };
  const firstPhoto = product.photos?.[0]?.src;
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: firstPhoto ? [firstPhoto] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return <RemoteProduct slug={slug} />;
  return <ProductView product={product} />;
}
