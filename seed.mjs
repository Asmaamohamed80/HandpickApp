import dotenv from 'dotenv';
import postgres from "postgres";

dotenv.config();

const products = [
  // عطور
  { name: 'عطر الورد الفاخر', category: 'عطور', price: '450.00', rating: '4.8', description: 'عطر فاخر برائحة الورد الطبيعية الراقية', imageUrl: 'https://via.placeholder.com/300x300?text=عطر+الورد' },
  { name: 'عطر العود الأسود', category: 'عطور', price: '550.00', rating: '4.9', description: 'عطر عود أسود فاخر مع مسك طبيعي', imageUrl: 'https://via.placeholder.com/300x300?text=عطر+العود' },
  { name: 'عطر الياسمين الليلي', category: 'عطور', price: '380.00', rating: '4.7', description: 'عطر ياسمين ليلي بنكهة الفانيليا', imageUrl: 'https://via.placeholder.com/300x300?text=عطر+الياسمين' },
  { name: 'عطر الزهور البيضاء', category: 'عطور', price: '320.00', rating: '4.6', description: 'مزيج من الزهور البيضاء النقية', imageUrl: 'https://via.placeholder.com/300x300?text=عطر+الزهور' },
  
  // عناية بالبشرة والجسم
  { name: 'كريم العناية الليلي', category: 'عناية بالبشرة والجسم', price: '180.00', rating: '4.7', description: 'كريم ليلي مغذي بالعسل والزيوت الطبيعية', imageUrl: 'https://via.placeholder.com/300x300?text=كريم+ليلي' },
  { name: 'سيروم الفيتامين C', category: 'عناية بالبشرة والجسم', price: '220.00', rating: '4.8', description: 'سيروم مركز بفيتامين C لتفتيح البشرة', imageUrl: 'https://via.placeholder.com/300x300?text=سيروم+فيتامين' },
  { name: 'قناع الطين الأسود', category: 'عناية بالبشرة والجسم', price: '150.00', rating: '4.5', description: 'قناع تنظيفي عميق بالطين الأسود', imageUrl: 'https://via.placeholder.com/300x300?text=قناع+طين' },
  { name: 'لوشن الجسم المرطب', category: 'عناية بالبشرة والجسم', price: '120.00', rating: '4.6', description: 'لوشن مرطب للجسم برائحة الورد', imageUrl: 'https://via.placeholder.com/300x300?text=لوشن+جسم' },
  
  // منتجات صحية عضوية
  { name: 'زيت جوز الهند العضوي', category: 'منتجات صحية عضوية', price: '95.00', rating: '4.7', description: 'زيت جوز هند عضوي بكر بدون معالجة', imageUrl: 'https://via.placeholder.com/300x300?text=زيت+جوز' },
  { name: 'عسل النحل الطبيعي', category: 'منتجات صحية عضوية', price: '75.00', rating: '4.9', description: 'عسل نحل طبيعي 100% من الخلايا', imageUrl: 'https://via.placeholder.com/300x300?text=عسل+طبيعي' },
  { name: 'مسحوق الكركم العضوي', category: 'منتجات صحية عضوية', price: '55.00', rating: '4.6', description: 'مسحوق كركم عضوي نقي للصحة والجمال', imageUrl: 'https://via.placeholder.com/300x300?text=كركم+عضوي' },
  { name: 'شاي الأعشاب الطبيعي', category: 'منتجات صحية عضوية', price: '45.00', rating: '4.5', description: 'مزيج شاي أعشاب طبيعي للاسترخاء', imageUrl: 'https://via.placeholder.com/300x300?text=شاي+أعشاب' },
  
  // أكسسوارات
  { name: 'فرشاة الوجه الناعمة', category: 'أكسسوارات', price: '85.00', rating: '4.6', description: 'فرشاة وجه ناعمة من الشعر الطبيعي', imageUrl: 'https://via.placeholder.com/300x300?text=فرشاة+وجه' },
  { name: 'مرآة الماكياج المضيئة', category: 'أكسسوارات', price: '120.00', rating: '4.7', description: 'مرآة ماكياج مضيئة بـ LED', imageUrl: 'https://via.placeholder.com/300x300?text=مرآة+مضيئة' },
  { name: 'حقيبة مستحضرات الجمال', category: 'أكسسوارات', price: '95.00', rating: '4.5', description: 'حقيبة تنظيم مستحضرات الجمال', imageUrl: 'https://via.placeholder.com/300x300?text=حقيبة+جمال' },
  { name: 'مجموعة إسفنجات الماكياج', category: 'أكسسوارات', price: '65.00', rating: '4.6', description: 'مجموعة 5 إسفنجات ماكياج احترافية', imageUrl: 'https://via.placeholder.com/300x300?text=إسفنجات' },
  
  // ملابس
  { name: 'روب حمام فاخر', category: 'ملابس', price: '280.00', rating: '4.7', description: 'روب حمام من القطن الفاخر الناعم', imageUrl: 'https://via.placeholder.com/300x300?text=روب+حمام' },
  { name: 'بيجامة حرير طبيعي', category: 'ملابس', price: '320.00', rating: '4.8', description: 'بيجامة من الحرير الطبيعي الخالص', imageUrl: 'https://via.placeholder.com/300x300?text=بيجامة+حرير' },
  { name: 'قفاز الاستحمام الناعم', category: 'ملابس', price: '45.00', rating: '4.5', description: 'قفاز استحمام من الألياف الناعمة', imageUrl: 'https://via.placeholder.com/300x300?text=قفاز+استحمام' },
  { name: 'حزام ستان فاخر', category: 'ملابس', price: '75.00', rating: '4.6', description: 'حزام ستان فاخر للملابس النوم', imageUrl: 'https://via.placeholder.com/300x300?text=حزام+ستان' },

  // ادوات منزليه
  { name: 'طقم مناشف مطبخ قطن', category: 'ادوات منزليه', price: '130.00', rating: '4.6', description: 'طقم مناشف مطبخ قطنية عالية الامتصاص', imageUrl: 'https://via.placeholder.com/300x300?text=مناشف+مطبخ' },
  { name: 'منظم أدراج متعدد', category: 'ادوات منزليه', price: '90.00', rating: '4.5', description: 'منظم عملي للأدراج للحفاظ على الترتيب', imageUrl: 'https://via.placeholder.com/300x300?text=منظم+ادراج' },
  { name: 'عبوة تخزين زجاجية', category: 'ادوات منزليه', price: '110.00', rating: '4.7', description: 'عبوة زجاجية محكمة لتخزين المواد الغذائية', imageUrl: 'https://via.placeholder.com/300x300?text=تخزين+زجاجي' },
  { name: 'ممسحة أرضيات ناعمة', category: 'ادوات منزليه', price: '150.00', rating: '4.6', description: 'ممسحة بيد مريحة لتنظيف سريع وفعال', imageUrl: 'https://via.placeholder.com/300x300?text=ممسحة+ارضيات' },
];

async function seedDatabase() {
  const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("SUPABASE_DATABASE_URL (or DATABASE_URL) is required for seeding");
  }
  const sql = postgres(connectionString, { ssl: "require" });
  
  try {
    console.log('🌱 بدء إضافة المنتجات الوهمية...');
    
    for (const product of products) {
      await sql`
        insert into products ("name", "category", "price", "rating", "description", "imageUrl")
        values (${product.name}, ${product.category}, ${product.price}, ${product.rating}, ${product.description}, ${product.imageUrl})
      `;
      console.log(`✅ تم إضافة: ${product.name}`);
    }
    
    console.log('✨ تم إضافة جميع المنتجات بنجاح!');
  } catch (error) {
    console.error('❌ خطأ في إضافة المنتجات:', error);
  } finally {
    await sql.end();
  }
}

seedDatabase();
