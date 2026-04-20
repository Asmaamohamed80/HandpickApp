import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Star } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { CATEGORY_NAV_ITEMS } from "@shared/const";

export default function CategoryPage() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/categories/:slug");
  const selectedCategory = CATEGORY_NAV_ITEMS.find((item) => item.slug === params?.slug);

  const { data: products, isLoading } = trpc.products.list.useQuery(
    selectedCategory ? { category: selectedCategory.label } : undefined,
    { enabled: Boolean(match && selectedCategory) }
  );
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

      const message = `مرحباً ريحانة 🌿\nأريد طلب المنتج: ${product.name}\n\nالعميل: ${formData.email}\nالمحافظة: ${formData.governorate}\nالسعر: ${product.price} جنيه`;
      const whatsappUrl = `https://wa.me/201551561398?text=${encodeURIComponent(message)}`;
      window.location.href = whatsappUrl;

      setFormData({ email: "", governorate: "", whatsappNumber: "" });
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("حدث خطأ في إنشاء الطلب");
    }
  };

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="py-12">
          <div className="container text-center">
            <h2 className="text-3xl font-bold text-foreground mb-3">القسم غير موجود</h2>
            <p className="text-muted-foreground mb-6">اختر قسمًا متاحًا من الصفحة الرئيسية.</p>
            <Button className="btn-primary" onClick={() => navigate("/")}>
              العودة للرئيسية
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-10 bg-gradient-to-b from-accent/10 to-transparent">
        <div className="container">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                <Link href="/" className="hover:text-accent transition-colors">
                  الرئيسية
                </Link>{" "}
                / {selectedCategory.label}
              </p>
              <h2 className="text-3xl font-bold text-foreground">قسم {selectedCategory.label}</h2>
            </div>
            <Button className="btn-secondary" onClick={() => navigate("/")}>
              كل الأقسام
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : !products || products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">لا توجد منتجات متاحة في هذا القسم حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="product-card">
                  {product.imageUrl && (
                    <img src={product.imageUrl} alt={product.name} className="product-image" />
                  )}
                  <div className="product-content">
                    <h4 className="product-name">{product.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span className="product-rating">{product.rating}</span>
                    </div>
                    <p className="product-price">{product.price} جنيه</p>
                    <p className="product-description">{product.description}</p>

                    {selectedProduct === product.id ? (
                      <div className="space-y-3 mt-4 p-4 bg-card rounded border border-accent">
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
                          className="w-full px-3 py-2 bg-background text-foreground border border-accent rounded"
                        />
                        <select
                          value={formData.governorate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              governorate: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-background text-foreground border border-accent rounded"
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
                          className="w-full px-3 py-2 bg-background text-foreground border border-accent rounded"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleOrderSubmit(product.id)}
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
                      <Button
                        onClick={() => setSelectedProduct(product.id)}
                        className="btn-primary w-full mt-4"
                      >
                        طلب الآن
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
