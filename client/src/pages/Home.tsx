import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Star } from "lucide-react";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { categoryToSlug } from "@shared/const";

export default function Home() {
  const [, navigate] = useLocation();
  const { data: products, isLoading } = trpc.products.list.useQuery();
  const { data: categories = [] } = trpc.products.categories.useQuery();
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [formData, setFormData] = useState({ email: "", governorate: "", whatsappNumber: "" });
  const createOrderMutation = trpc.orders.create.useMutation();

  const governorates: string[] = [
    "القاهرة",
    "الإسكندرية",
    "الجيزة",
    "القليوبية",
    "المنوفية",
    "الشرقية",
    "الدقهلية",
    "كفر الشيخ",
    "الغربية",
    "المنيا",
    "بني سويف",
    "الفيوم",
    "أسيوط",
    "سوهاج",
    "قنا",
    "الأقصر",
    "أسوان",
    "البحر الأحمر",
    "مطروح",
    "شمال سيناء",
    "جنوب سيناء",
  ];

  const handleOrderSubmit = async (productId: number) => {
    if (!formData.email || !formData.governorate || !formData.whatsappNumber) {
      alert("يرجى ملء جميع الحقول");
      return;
    }

    try {
      const product = products?.find((p) => p.id === productId);
      if (!product) return;

      await createOrderMutation.mutateAsync({
        userEmail: formData.email,
        governorate: formData.governorate,
        productId,
        whatsappNumber: formData.whatsappNumber,
      });

      const message = `مرحباً Handpick_منتقى بعناية 🌿\nأريد طلب المنتج: ${product.name}\n\nالعميل: ${formData.email}\nالمحافظة: ${formData.governorate}\nالسعر: ${product.price} جنيه`;
      const whatsappUrl = `https://wa.me/201551561398?text=${encodeURIComponent(message)}`;
      window.location.href = whatsappUrl;

      setFormData({ email: "", governorate: "", whatsappNumber: "" });
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("حدث خطأ في إنشاء الطلب");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-12 bg-secondary/40 border-b border-border">
        <div className="container text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            عطور وعناية بالبشرة فاخرة
          </h2>
          <p className="text-xl text-muted-foreground">
            اختر من مجموعتنا الفاخرة من العطور ومنتجات العناية بالبشرة الطبيعية
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6">
        <div className="container">
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">الأقسام</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card
                key={category}
                className="p-5 border border-border hover:border-accent/50 transition-colors bg-card"
              >
                <h4 className="text-lg font-semibold text-foreground mb-3">{category}</h4>
                <Button
                  className="btn-primary w-full"
                  onClick={() => navigate(`/categories/${categoryToSlug(category)}`)}
                >
                  عرض منتجات القسم
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
            منتجاتنا
          </h3>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : !products || products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                لا توجد منتجات متاحة حالياً
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="product-card">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="product-image"
                    />
                  )}
                  <div className="product-content">
                    <h4 className="product-name">{product.name}</h4>
                    <p className="text-sm font-medium text-foreground/80 mb-1">
                      العلامة التجارية: {product.brand}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.category}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span className="product-rating">{product.rating}</span>
                    </div>
                    <p className="product-price">
                      {product.price} جنيه
                    </p>
                    <p className="product-description">
                      {product.description}
                    </p>

                    {selectedProduct === product.id ? (
                      <div className="space-y-3 mt-4 p-4 bg-secondary/30 rounded border border-border">
                        <input
                          type="email"
                          placeholder="بريدك الإلكتروني"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              email: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-background text-foreground border border-border rounded"
                        />
                        <select
                          value={formData.governorate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              governorate: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-background text-foreground border border-border rounded"
                        >
                          <option value="">اختر المحافظة</option>
                          {governorates.map((gov) => (
                            <option key={gov} value={gov}>
                              {gov}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          placeholder="رقم الواتس (مثال: 201001234567)"
                          value={formData.whatsappNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              whatsappNumber: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-background text-foreground border border-border rounded"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              handleOrderSubmit(product.id)
                            }
                            className="btn-primary flex-1"
                            disabled={createOrderMutation.isPending}
                          >
                            {createOrderMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                جاري...
                              </>
                            ) : (
                              "تأكيد الطلب"
                            )}
                          </Button>
                          <Button
                            onClick={() => setSelectedProduct(null)}
                            className="btn-secondary flex-1"
                          >
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <Button
                          onClick={() => setSelectedProduct(product.id)}
                          className="btn-primary w-full"
                        >
                          طلب الآن
                        </Button>
                        <Button
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="btn-secondary w-full"
                        >
                          مراجعات المنتج
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-12">
        <div className="container text-center text-muted-foreground">
          <p>© 2026 Handpick_منتقى بعناية. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
