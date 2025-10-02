/*
  Demo static data and in-memory state for full offline demo mode.
*/
import type {
  Product,
  Category,
  Ingredient,
  ProductIngredient,
  ProductTag,
  HeroSection,
  AboutSection,
  ContactInfo,
  FeaturedProduct,
  Review,
  SiteConfig,
  Order,
  CreateOrderData,
  AdminStats,
  UserStats,
} from './api';

export const delay = (ms = 300) => new Promise(res => setTimeout(res, ms));

// Seed helpers
let idCounter = 1000;
const nextId = () => ++idCounter;

// Base entities
export const categories: Category[] = [
  { id: 1, name: 'Hamburguesas', icon: '🍔', products_count: 3 },
  { id: 2, name: 'Pizzas', icon: '🍕', products_count: 2 },
  { id: 3, name: 'Bebidas', icon: '🥤', products_count: 2 },
];

// In-place removal helpers (to avoid reassigning imported arrays from other modules)
export function removeProductInPlace(id: number | string): boolean {
  const before = products.length;
  for (let i = products.length - 1; i >= 0; i--) {
    if (String(products[i].id) === String(id)) products.splice(i, 1);
  }
  return products.length < before;
}

export function removeCategoryInPlace(id: number | string): boolean {
  const before = categories.length;
  for (let i = categories.length - 1; i >= 0; i--) {
    if (String(categories[i].id) === String(id)) categories.splice(i, 1);
  }
  return categories.length < before;
}

export function removeTagInPlace(id: number | string): boolean {
  const before = tags.length;
  for (let i = tags.length - 1; i >= 0; i--) {
    if (String(tags[i].id) === String(id)) tags.splice(i, 1);
  }
  return tags.length < before;
}

export function removeIngredientInPlace(id: number | string): boolean {
  const before = ingredients.length;
  for (let i = ingredients.length - 1; i >= 0; i--) {
    if (String(ingredients[i].id) === String(id)) ingredients.splice(i, 1);
  }
  return ingredients.length < before;
}

export const tags: ProductTag[] = [
  { id: 1, name: 'Popular' },
  { id: 2, name: 'Nuevo' },
  { id: 3, name: 'Promo' },
];

export const ingredients: Ingredient[] = [
  { id: 1, name: 'Queso Extra', is_active: true },
  { id: 2, name: 'Tocino', is_active: true },
  { id: 3, name: 'Palta', is_active: true },
  { id: 4, name: 'Tomate', is_active: true },
  { id: 5, name: 'Cebolla', is_active: true },
];

const pi = (ingredientId: number, extra_cost = 1000, def = true): ProductIngredient => ({
  ingredient: ingredients.find(i => i.id === ingredientId)!,
  default_included: def,
  extra_cost,
  is_active: true,
});

export const products: Product[] = [
  {
    id: 1,
    name: 'Burger Clásica',
    description: 'Carne 120g, queso, tomate y lechuga.',
    price: 4990,
    category: 1,
    category_name: 'Hamburguesas',
    category_icon: '🍔',
    image: '',
    image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop',
    is_active: true,
    tags: [tags[0]],
    product_ingredients: [pi(1, 800), pi(2, 1200, false), pi(4, 0), pi(5, 0)],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Burger Tocino',
    description: 'Carne doble, queso y tocino crujiente.',
    price: 6990,
    category: 1,
    category_name: 'Hamburguesas',
    category_icon: '🍔',
    image: '',
    image_url: 'https://images.unsplash.com/photo-1550317138-10000687a72b?q=80&w=1200&auto=format&fit=crop',
    is_active: true,
    tags: [tags[0], tags[2]],
    product_ingredients: [pi(1, 800), pi(2, 1200), pi(4, 0)],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Pizza Margarita',
    description: 'Mozzarella, tomate y albahaca.',
    price: 8990,
    category: 2,
    category_name: 'Pizzas',
    category_icon: '🍕',
    image: '',
    image_url: 'https://images.pexels.com/photos/4109129/pexels-photo-4109129.jpeg?auto=compress&cs=tinysrgb&w=1200',
    is_active: true,
    tags: [tags[1]],
    product_ingredients: [pi(1, 1000), pi(4, 0)],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Pizza Pepperoni',
    description: 'La clásica favorita.',
    price: 9990,
    category: 2,
    category_name: 'Pizzas',
    category_icon: '🍕',
    image: '',
    image_url: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=1200',
    is_active: true,
    tags: [tags[0]],
    product_ingredients: [pi(1, 1000), pi(4, 0)],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'Bebida Cola 350ml',
    description: 'Bien fría',
    price: 1200,
    category: 3,
    category_name: 'Bebidas',
    category_icon: '🥤',
    image: '',
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1200&auto=format&fit=crop',
    is_active: true,
    tags: [],
    product_ingredients: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export let hero: HeroSection = {
  id: 1,
  title: 'Comida rápida que enamora',
  subtitle: 'Hecha con ingredientes frescos y llena de sabor',
  button_text: 'Ordena ahora',
  button_url: '/#menu',
  background_image: 'https://images.pexels.com/photos/2067428/pexels-photo-2067428.jpeg?auto=compress&cs=tinysrgb&w=1920',
  background_image_url: 'https://images.pexels.com/photos/2067428/pexels-photo-2067428.jpeg?auto=compress&cs=tinysrgb&w=1920',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function updateFeatured(p: Partial<FeaturedProduct>): FeaturedProduct {
  featured = { ...featured, ...p, updated_at: new Date().toISOString() } as FeaturedProduct;
  return featured;
}

export function updateContact(p: Partial<ContactInfo>): ContactInfo {
  contact = { ...contact, ...p, updated_at: new Date().toISOString() };
  return contact;
}

export function updateAbout(p: Partial<AboutSection>): AboutSection {
  about = { ...about, ...p, updated_at: new Date().toISOString() };
  return about;
}

export function updateHero(p: Partial<HeroSection>): HeroSection {
  hero = { ...hero, ...p, updated_at: new Date().toISOString() };
  return hero;
}

export let about: AboutSection = {
  id: 1,
  title: 'Sobre nosotros',
  subtitle: 'Pasión por la comida rica',
  description: 'Llevamos más de 5 años sirviendo las mejores hamburguesas y pizzas.',
  image_1: '',
  image_1_url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200&auto=format&fit=crop',
  image_2: '',
  image_2_url: 'https://images.unsplash.com/photo-1543352634-8732b1d7f2cc?q=80&w=1200&auto=format&fit=crop',
  years_experience: 5,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export let contact: ContactInfo = {
  id: 1,
  phone: '+56 9 1234 5678',
  email: 'contacto@fastfood.demo',
  address: 'Av. Demo 123, Santiago',
  whatsapp: '56912345678',
  facebook: 'https://facebook.com/fastfooddemo',
  instagram: 'https://instagram.com/fastfooddemo',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export let featured: FeaturedProduct = {
  id: 2,
  name: products[1].name,
  description: products[1].description,
  price: products[1].price,
  original_price: products[1].price + 2000,
  discount_percentage: 20,
  image: '',
  image_url: products[1].image_url,
  preparation_time: '15-20 min',
  servings: '1-2',
  rating: 4.7,
  reviews_count: 124,
  discount_amount: 2000,
  discount_percentage_calculated: 20,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export let reviews: Review[] = [
  { id: 1, username: 'Camila', rating: 5, comment: '¡Exquisito!', created_at: new Date().toISOString(), is_visible: true },
  { id: 2, username: 'Jorge', rating: 4, comment: 'Muy bueno y rápido', created_at: new Date().toISOString(), is_visible: true },
];

export let siteConfig: SiteConfig = {
  id: 1,
  show_reviews: true,
  updated_at: new Date().toISOString(),
};

export function updateSiteConfig(p: Partial<SiteConfig>): SiteConfig {
  siteConfig = { ...siteConfig, ...p, updated_at: new Date().toISOString() };
  return siteConfig;
}

export let orders: Order[] = [];

// CRUD helpers
export const listProducts = (category?: string) => {
  if (!category || category === 'all') return products.filter(p => p.is_active);
  const cat = categories.find(c => c.name.toLowerCase() === category.toLowerCase() || String(c.id) === category);
  return products.filter(p => p.category === (cat?.id ?? -1));
};

export const createOrderFromData = (data: CreateOrderData): Order => {
  const id = nextId();
  const items = data.items.map((i, idx) => {
    const p = products.find(pp => pp.id === Number(i.product_id))!;
    const extrasEntries = Object.entries(i.extras || {});
    const extras = extrasEntries.map(([ingredientId, qtyStr], j) => {
      const pi = (p.product_ingredients || []).find(pi => pi.ingredient.id === Number(ingredientId));
      const qty = Number(qtyStr || '0') || 0;
      const unit_price = (pi?.extra_cost || 0);
      return {
        id: nextId() + j,
        ingredient: Number(ingredientId),
        ingredient_name: pi?.ingredient.name || 'Extra',
        quantity: qty,
        unit_price,
        total_price: unit_price * qty,
      };
    });
    const quantity = Number(i.quantity || '1') || 1;
    const unit_price = p.price + extras.reduce((s, e) => s + e.unit_price, 0);
    return {
      id: nextId() + idx,
      product: p.id,
      product_name: p.name,
      product_description: p.description,
      quantity,
      unit_price,
      total_price: unit_price * quantity,
      extras,
      ingredients: (p.product_ingredients || []).map(pi => ({
        id: nextId(),
        ingredient: pi.ingredient.id,
        ingredient_name: pi.ingredient.name,
        is_included: (i.included_ingredients || []).includes(String(pi.ingredient.id)),
        was_default: !!pi.default_included,
      })),
    };
  });
  const total_amount = items.reduce((s, it) => s + it.total_price, 0);
  const order: Order = {
    id,
    order_number: `FF-${id}`,
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_phone: data.customer_phone,
    delivery_address: `${data.delivery_street} ${data.delivery_number}${data.delivery_apartment ? ', ' + data.delivery_apartment : ''}, ${data.delivery_city}, ${data.delivery_region}`,
    delivery_street: data.delivery_street,
    delivery_number: data.delivery_number,
    delivery_apartment: data.delivery_apartment || null,
    delivery_city: data.delivery_city,
    delivery_region: data.delivery_region,
    notes: data.notes || null,
    status: 'pending',
    total_amount,
    items,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  orders = [order, ...orders];
  return order;
};

export const listMyOrders = (): Order[] => orders;

export const adminStats = (range?: 'day'|'week'|'month'): AdminStats => {
  const days = range === 'day' ? 1 : range === 'week' ? 7 : 30;
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0,10);
  const byDayMap: Record<string, number> = {};
  for (let i=0;i<days;i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    byDayMap[fmt(d)] = 0;
  }
  orders.forEach(o => {
    const d = (o.created_at || '').slice(0,10);
    if (byDayMap[d] !== undefined) byDayMap[d] += 1;
  });
  const ordersByDay = Object.entries(byDayMap).reverse().map(([date, count]) => ({ date, count }));
  const revenueByDay = ordersByDay.map(({date, count}) => ({ date, total: count * 10000 }));
  const statusDistribution: Record<string, number> = {};
  orders.forEach(o => { statusDistribution[o.status] = (statusDistribution[o.status] || 0) + 1; });
  const topProducts = products.slice(0, 5).map(p => ({ product: p.name, quantity: Math.floor(Math.random()*20)+1 }));
  const usersByDay = ordersByDay.map(({date}) => ({ date, count: Math.floor(Math.random()*5) }));
  return { ordersByDay, revenueByDay, statusDistribution, topProducts, usersByDay, rangeDays: days };
};

export const userStats = (range?: 'day'|'week'|'month'): UserStats => {
  const days = range === 'day' ? 1 : range === 'week' ? 7 : 30;
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0,10);
  const usersByDay = Array.from({length: days}).map((_,i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    return { date: fmt(d), count: Math.floor(Math.random()*5) };
  }).reverse();
  return { usersByDay, rangeDays: days };
};

export const updateOrder = (id: number, status: Order['status']): Order | null => {
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], status, updated_at: new Date().toISOString() };
  return orders[idx];
};

export const removeOrder = (id: number): boolean => {
  const len = orders.length;
  orders = orders.filter(o => o.id !== id);
  return orders.length < len;
};

// Seed some demo orders so the app shows activity immediately
function seedDemoOrders() {
  if (orders.length > 0) return;
  try {
    const o1 = createOrderFromData({
      customer_name: 'Camila Pérez',
      customer_phone: '+56 9 1111 1111',
      customer_email: 'camila@example.com',
      delivery_street: 'Av. Demo',
      delivery_number: '123',
      delivery_apartment: 'Depto 45',
      delivery_city: 'Santiago',
      delivery_region: 'RM',
      notes: 'Con mucha salsa',
      items: [
        { product_id: String(products[0].id), quantity: '2', extras: { '1': '1' }, included_ingredients: ['4','5'] },
        { product_id: String(products[4].id), quantity: '2', extras: {} },
      ]
    });
    o1.status = 'delivered';
    o1.created_at = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString();

    const o2 = createOrderFromData({
      customer_name: 'Jorge Soto',
      customer_phone: '+56 9 2222 2222',
      customer_email: 'jorge@example.com',
      delivery_street: 'Calle Falsa',
      delivery_number: '742',
      delivery_city: 'Providencia',
      delivery_region: 'RM',
      items: [
        { product_id: String(products[1].id), quantity: '1', extras: { '2': '2' }, included_ingredients: ['4'] },
      ]
    });
    o2.status = 'ready';
    o2.created_at = new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString();

    const o3 = createOrderFromData({
      customer_name: 'Ana Díaz',
      customer_phone: '+56 9 3333 3333',
      customer_email: 'ana@example.com',
      delivery_street: 'Los Álamos',
      delivery_number: '555',
      delivery_city: 'Ñuñoa',
      delivery_region: 'RM',
      items: [
        { product_id: String(products[2].id), quantity: '1', extras: { '1': '1' }, included_ingredients: ['4'] },
        { product_id: String(products[4].id), quantity: '1', extras: {} },
      ]
    });
    o3.status = 'preparing';
    o3.created_at = new Date(Date.now() - 1000 * 60 * 20).toISOString();
  } catch (e) {
    // ignore seeding errors
  }
}

seedDemoOrders();
