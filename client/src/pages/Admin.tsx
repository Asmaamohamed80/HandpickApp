import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";

export default function Admin() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    rating: "4.5",
    description: "",
    imageUrl: "",
  });

  const { data: products, isLoading, refetch } = trpc.products.list.useQuery();
  const { data: brands = [] } = trpc.products.brands.useQuery();
  const { data: categories = [] } = trpc.products.categories.useQuery();
  const createProductMutation = trpc.products.create.useMutation();
  const deleteProductMutation = trpc.products.delete.useMutation();

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.brand || !formData.category || !formData.price) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      await createProductMutation.mutateAsync({
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        price: formData.price,
        rating: formData.rating,
        description: formData.description,
        imageUrl: formData.imageUrl,
      });

      setFormData({
        name: "",
        brand: "",
        category: "",
        price: "",
        rating: "4.5",
        description: "",
        imageUrl: "",
      });
      setShowAddForm(false);
      refetch();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("حدث خطأ في إضافة المنتج");
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (confirm("هل تريد حذف هذا المنتج؟")) {
      try {
        await deleteProductMutation.mutateAsync(productId);
        refetch();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("حدث خطأ في حذف المنتج");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <div className="flex justify-between items-center mb-8 mt-8">
            <h2 className="text-2xl font-bold text-foreground">إدارة المنتجات</h2>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {showAddForm ? "إغلاق النموذج" : "إضافة منتج جديد"}
            </Button>
          </div>

          {/* Add Product Form */}
          {showAddForm && (
            <Card className="mb-8 p-6 bg-card border border-border">
              <h3 className="text-xl font-bold text-foreground mb-6">
                إضافة منتج جديد
              </h3>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-foreground mb-2">
                    اسم المنتج *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-background text-foreground border border-border rounded"
                    placeholder="اسم المنتج"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-foreground mb-2">العلامة التجارية *</label>
                    <input
                      type="text"
                      list="brands-list"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-4 py-2 bg-background text-foreground border border-border rounded"
                      placeholder="مثال: Dior"
                    />
                    <datalist id="brands-list">
                      {brands.map((brand) => (
                        <option key={brand} value={brand} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-foreground mb-2">
                      الفئة *
                    </label>
                    <input
                      type="text"
                      list="categories-list"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-background text-foreground border border-border rounded"
                      placeholder="مثال: عطور"
                    />
                    <datalist id="categories-list">
                      {categories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-foreground mb-2">
                      السعر (جنيه) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-background text-foreground border border-border rounded"
                      placeholder="السعر"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-foreground mb-2">
                    التقييم (من 1 إلى 5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-background text-foreground border border-border rounded"
                  />
                </div>

                <div>
                  <label className="block text-foreground mb-2">
                    الوصف
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-background text-foreground border border-border rounded"
                    rows={3}
                    placeholder="وصف المنتج"
                  />
                </div>

                <div>
                  <label className="block text-foreground mb-2">
                    رابط الصورة
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-background text-foreground border border-border rounded"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={createProductMutation.isPending}
                  >
                    {createProductMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        جاري...
                      </>
                    ) : (
                      "إضافة المنتج"
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="btn-secondary flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Products List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : !products || products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                لا توجد منتجات حالياً
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="p-6 bg-card border border-border flex justify-between items-center"
                >
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-foreground">
                      {product.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {product.brand} - {product.category} - {product.price} جنيه
                    </p>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="btn-secondary flex items-center gap-2 mr-4"
                    disabled={deleteProductMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
