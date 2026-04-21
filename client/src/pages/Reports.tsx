import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp } from "lucide-react";
import { Header } from "@/components/Header";

export default function Reports() {
  const { data: reportData, isLoading } = trpc.reports.getSummary.useQuery();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <section className="py-12 mt-8">
        <div className="container">
          <h1 className="text-3xl font-bold text-foreground mb-8">التقارير والإحصائيات</h1>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Orders */}
                <Card className="p-6 bg-card border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground mb-2">إجمالي الطلبات</p>
                      <h3 className="text-4xl font-bold text-accent">
                        {reportData?.totalOrders || 0}
                      </h3>
                    </div>
                    <TrendingUp className="w-12 h-12 text-accent opacity-50" />
                  </div>
                </Card>

                {/* Top Governorate */}
                <Card className="p-6 bg-card border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground mb-2">
                        المحافظة الأكثر طلباً
                      </p>
                      <h3 className="text-2xl font-bold text-accent">
                        {reportData?.topGovernorate?.name || "لا توجد بيانات"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {reportData?.topGovernorate?.count || 0} طلب
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Governorates Statistics */}
              <Card className="p-6 bg-card border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  إحصائيات الطلبات حسب المحافظة
                </h2>
                {Object.keys(reportData?.byGovernorate || {}).length === 0 ? (
                  <p className="text-muted-foreground">لا توجد بيانات</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(reportData?.byGovernorate || {})
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([governorate, count]) => (
                        <div
                          key={governorate}
                          className="flex items-center justify-between p-4 bg-secondary/20 rounded border border-border"
                        >
                          <span className="text-foreground font-medium">
                            {governorate}
                          </span>
                          <div className="flex items-center gap-4">
                            <div className="w-32 bg-accent/20 rounded-full h-2">
                              <div
                                className="bg-accent h-2 rounded-full"
                                style={{
                                  width: `${
                                    ((count as number) /
                                      Math.max(
                                        ...(Object.values(
                                          reportData?.byGovernorate || {}
                                        ) as number[])
                                      )) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="text-accent font-bold min-w-12 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </Card>

              {/* Recent Orders */}
              <Card className="p-6 bg-card border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  آخر 10 طلبات
                </h2>
                {!reportData?.recentOrders || reportData.recentOrders.length === 0 ? (
                  <p className="text-muted-foreground">لا توجد طلبات</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-right p-4 text-foreground font-bold">
                            البريد الإلكتروني
                          </th>
                          <th className="text-right p-4 text-foreground font-bold">
                            المحافظة
                          </th>
                          <th className="text-right p-4 text-foreground font-bold">
                            رقم الواتس
                          </th>
                          <th className="text-right p-4 text-foreground font-bold">
                            رقم المنتج
                          </th>
                          <th className="text-right p-4 text-foreground font-bold">
                            التاريخ
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.recentOrders.map((order, index) => (
                          <tr
                            key={index}
                            className="border-b border-border hover:bg-secondary/30 transition-colors"
                          >
                            <td className="p-4 text-foreground">
                              {order.userEmail}
                            </td>
                            <td className="p-4 text-foreground">
                              {order.governorate}
                            </td>
                            <td className="p-4 text-foreground">
                              {(order as any).whatsappNumber || 'N/A'}
                            </td>
                            <td className="p-4 text-foreground">
                              {order.productId}
                            </td>
                            <td className="p-4 text-muted-foreground text-sm">
                              {formatDate(order.createdAt as any)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
