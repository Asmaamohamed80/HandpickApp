export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

export const PRODUCT_CATEGORIES = [
  "عطور",
  "عناية بالبشرة والجسم",
  "منتجات صحية عضوية",
  "أكسسوارات",
  "ملابس",
  "ادوات منزليه",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const CATEGORY_NAV_ITEMS: ReadonlyArray<{ slug: string; label: ProductCategory }> = [
  { slug: "perfumes", label: "عطور" },
  { slug: "skin-body-care", label: "عناية بالبشرة والجسم" },
  { slug: "organic-health", label: "منتجات صحية عضوية" },
  { slug: "accessories", label: "أكسسوارات" },
  { slug: "clothing", label: "ملابس" },
  { slug: "home-tools", label: "ادوات منزليه" },
];

export function categoryToSlug(category: string): string {
  return encodeURIComponent(category.trim().toLowerCase().replace(/\s+/g, "-"));
}
