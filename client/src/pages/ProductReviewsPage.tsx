import { useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2, Star } from "lucide-react";
import { useLocation, useRoute } from "wouter";

export default function ProductReviewsPage() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/products/:id");
  const productId = Number(params?.id);
  const [formData, setFormData] = useState({
    reviewerName: "",
    reviewerEmail: "",
    rating: "5.0",
    comment: "",
  });

  const { data: product, isLoading: productLoading } = trpc.products.getById.useQuery(productId, {
    enabled: Boolean(match && Number.isFinite(productId)),
  });
  const reviewsQuery = trpc.products.reviews.list.useQuery(productId, {
    enabled: Boolean(match && Number.isFinite(productId)),
  });
  const createReviewMutation = trpc.products.reviews.create.useMutation({
    onSuccess: () => {
      reviewsQuery.refetch();
      setFormData({ reviewerName: "", reviewerEmail: "", rating: "5.0", comment: "" });
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.reviewerName || !formData.comment) {
      alert("يرجى إدخال الاسم والمراجعة.");
      return;
    }

    await createReviewMutation.mutateAsync({
      productId,
      reviewerName: formData.reviewerName,
      reviewerEmail: formData.reviewerEmail || undefined,
      rating: formData.rating,
      comment: formData.comment,
    });
  };

  if (!Number.isFinite(productId)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-10">
        <div className="container">
          <Button className="btn-secondary mb-6" onClick={() => navigate("/")}>
            العودة للرئيسية
          </Button>

          {productLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : !product ? (
            <div className="text-center py-12 text-muted-foreground">المنتج غير موجود</div>
          ) : (
            <Card className="p-6 border border-border">
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              <p className="text-muted-foreground mb-1">العلامة التجارية: {product.brand}</p>
              <p className="text-muted-foreground mb-4">القسم: {product.category}</p>
              <p className="text-foreground">{product.description}</p>
            </Card>
          )}
        </div>
      </section>

      <section className="pb-12">
        <div className="container grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border border-border">
            <h3 className="text-xl font-bold mb-4">أضف مراجعتك</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="w-full px-3 py-2 bg-background text-foreground border border-border rounded"
                placeholder="الاسم"
                value={formData.reviewerName}
                onChange={(e) => setFormData({ ...formData, reviewerName: e.target.value })}
              />
              <input
                className="w-full px-3 py-2 bg-background text-foreground border border-border rounded"
                placeholder="البريد الإلكتروني (اختياري)"
                type="email"
                value={formData.reviewerEmail}
                onChange={(e) => setFormData({ ...formData, reviewerEmail: e.target.value })}
              />
              <input
                className="w-full px-3 py-2 bg-background text-foreground border border-border rounded"
                placeholder="التقييم من 1 إلى 5"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              />
              <textarea
                className="w-full px-3 py-2 bg-background text-foreground border border-border rounded"
                rows={4}
                placeholder="اكتب تجربتك مع المنتج"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              />
              <Button type="submit" className="btn-primary w-full" disabled={createReviewMutation.isPending}>
                {createReviewMutation.isPending ? "جاري الإرسال..." : "إرسال المراجعة"}
              </Button>
            </form>
          </Card>

          <Card className="p-6 border border-border">
            <h3 className="text-xl font-bold mb-4">مراجعات العملاء</h3>
            {reviewsQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : !reviewsQuery.data || reviewsQuery.data.length === 0 ? (
              <p className="text-muted-foreground">لا توجد مراجعات بعد.</p>
            ) : (
              <div className="space-y-4">
                {reviewsQuery.data.map((review) => (
                  <div key={review.id} className="p-4 rounded border border-border bg-secondary/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{review.reviewerName}</p>
                      <div className="flex items-center gap-1 text-accent">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span>{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
