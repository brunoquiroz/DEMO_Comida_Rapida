import axios from 'axios';
import { getAuthHeader } from './auth';
import * as demo from './demoData';

const API_URL = 'http://localhost:8000/api';
// DEMO mode: when true, all service calls return local mock data from demoData.ts
// Set to true to run the project fully static/offline.
const DEMO_MODE = true;

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para añadir el token de autenticación a todas las solicitudes
api.interceptors.request.use(config => {
  const headers = getAuthHeader();
  if (config.headers) {
    Object.assign(config.headers, headers);
  }
  return config;
});

// Tipos de datos
export interface ProductTag {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  products_count: number;
}

// NUEVOS TIPOS: Ingredientes
export interface Ingredient {
  id: number;
  name: string;
  is_active: boolean;
}

export interface ProductIngredient {
  id?: number;
  ingredient: Ingredient; // cuando viene del API
  ingredient_id?: number; // para envíos
  default_included: boolean;
  extra_cost: number;
  is_active: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: number;
  category_name: string;
  category_icon: string;
  image: string;
  image_url: string;
  is_active: boolean;
  tags: ProductTag[];
  product_ingredients?: ProductIngredient[]; // NUEVO
  created_at: string;
  updated_at: string;
}

// Nuevos tipos para contenido dinámico
export interface HeroSection {
  id: number;
  title: string;
  subtitle: string;
  button_text: string;
  button_url: string;
  background_image: string;
  background_image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AboutSection {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image_1: string;
  image_1_url: string;
  image_2: string;
  image_2_url: string;
  years_experience: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactInfo {
  id: number;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeaturedProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price: number;
  discount_percentage: number;
  image: string;
  image_url: string;
  preparation_time: string;
  servings: string;
  rating: number;
  reviews_count: number;
  discount_amount: number;
  discount_percentage_calculated: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos para órdenes
export interface OrderItemExtra {
  id: number;
  ingredient: number;
  ingredient_name: string;
  quantity: number;
  unit_price: number;  // Cambiado de extra_cost a unit_price
  total_price: number;
}

// (Eliminado: definiciones duplicadas de OrderItem y Order para evitar conflictos de TS)

export interface CreateOrderData {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_street: string;
  delivery_number: string;
  delivery_apartment?: string;
  delivery_city: string;
  delivery_region: string;
  notes?: string;
  items: Array<{
    product_id: string;
    quantity: string;
    extras: { [ingredientId: string]: string };
    included_ingredients?: string[];  // Nuevo campo
  }>;
}

export interface OrderItemIngredient {
  id: number;
  ingredient: number;
  ingredient_name: string;
  is_included: boolean;
  was_default: boolean;
}

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  product_description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  extras: OrderItemExtra[];
  ingredients: OrderItemIngredient[];  // Nuevo campo
}

// Definición única de Order alineada con OrderSerializer del backend
export interface Order {
  id?: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_street: string;
  delivery_number: string;
  delivery_apartment?: string | null;
  delivery_city: string;
  delivery_region: string;
  notes?: string | null;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total_amount: number;
  items: OrderItem[];
  created_at?: string;
  updated_at?: string;
}

// Servicios de productos
export const getProducts = async (category = 'all'): Promise<Product[]> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.listProducts(category);
  }
  const response = await api.get(`/products/?category=${category}`);
  return response.data;
};

export const getProduct = async (id: string): Promise<Product> => {
  if (DEMO_MODE) {
    await demo.delay();
    const item = demo.products.find(p => String(p.id) === String(id));
    if (!item) throw new Error('Product not found');
    return item;
  }
  const response = await api.get(`/products/${id}/`);
  return response.data;
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  if (DEMO_MODE) {
    await demo.delay();
    // Use first 3 active as featured in demo
    return demo.products.filter(p => p.is_active).slice(0, 3);
  }
  const response = await api.get('/products/featured/');
  return response.data;
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  if (DEMO_MODE) {
    await demo.delay();
    const q = query.toLowerCase();
    return demo.products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category_name.toLowerCase().includes(q)
    );
  }
  const response = await api.get(`/products/search/?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const createProduct = async (productData: FormData): Promise<Product> => {
  if (DEMO_MODE) {
    await demo.delay();
    const obj: any = Object.fromEntries(productData.entries());
    const id = (demo as any).products.length ? Math.max(...demo.products.map(p => p.id)) + 1 : 1;
    const newP: Product = {
      id,
      name: obj.name || 'Nuevo producto',
      description: obj.description || '',
      price: Number(obj.price || 0),
      category: Number(obj.category || 1),
      category_name: (demo.categories.find(c => c.id === Number(obj.category))?.name) || 'Categoría',
      category_icon: (demo.categories.find(c => c.id === Number(obj.category))?.icon) || '🍽️',
      image: String(obj.image || ''),
      image_url: String(obj.image_url || ''),
      is_active: true,
      tags: [],
      product_ingredients: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    (demo as any).products.push(newP);
    return newP;
  }
  const response = await api.post('/products/', productData);
  return response.data;
};

export const updateProduct = async (id: number | string, productData: FormData): Promise<Product> => {
  if (DEMO_MODE) {
    await demo.delay();
    const idx = demo.products.findIndex(p => String(p.id) === String(id));
    if (idx === -1) throw new Error('Product not found');
    const obj: any = Object.fromEntries(productData.entries());
    const category = obj.category ? Number(obj.category) : demo.products[idx].category;
    const updated: Product = {
      ...demo.products[idx],
      ...obj,
      name: obj.name ?? demo.products[idx].name,
      description: obj.description ?? demo.products[idx].description,
      price: obj.price !== undefined ? Number(obj.price) : demo.products[idx].price,
      category,
      category_name: (demo.categories.find(c => c.id === category)?.name) || demo.products[idx].category_name,
      category_icon: (demo.categories.find(c => c.id === category)?.icon) || demo.products[idx].category_icon,
      image: obj.image ?? demo.products[idx].image,
      image_url: obj.image_url ?? demo.products[idx].image_url,
      updated_at: new Date().toISOString(),
    } as Product;
    (demo as any).products[idx] = updated;
    return updated;
  }
  const response = await api.put(`/products/${id}/`, productData);
  return response.data;
};

export const deleteProduct = async (id: number | string): Promise<boolean> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.removeProductInPlace(id);
  }
  await api.delete(`/products/${id}/`);
  return true;
};

// Servicios de categorías
export const getCategories = async (): Promise<Category[]> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.categories;
  }
  const response = await api.get('/categories/');
  return response.data;
};

export const getCategory = async (id: string): Promise<Category> => {
  if (DEMO_MODE) {
    await demo.delay();
    const cat = demo.categories.find(c => String(c.id) === String(id));
    if (!cat) throw new Error('Category not found');
    return cat;
  }
  const response = await api.get(`/categories/${id}/`);
  return response.data;
};

export const getCategoryProducts = async (id: string): Promise<Product[]> => {
  if (DEMO_MODE) {
    await demo.delay();
    const catId = Number(id);
    return demo.products.filter(p => p.category === catId);
  }
  const response = await api.get(`/categories/${id}/products/`);
  return response.data;
};

export const createCategory = async (categoryData: Partial<Category>): Promise<Category> => {
  if (DEMO_MODE) {
    await demo.delay();
    const id = (demo as any).categories.length ? Math.max(...demo.categories.map(c => c.id)) + 1 : 1;
    const newC: Category = { id, name: categoryData.name || 'Nueva', icon: categoryData.icon || '🍽️', products_count: 0 };
    (demo as any).categories.push(newC);
    return newC;
  }
  const response = await api.post('/categories/', categoryData);
  return response.data;
};

export const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<Category> => {
  if (DEMO_MODE) {
    await demo.delay();
    const idx = demo.categories.findIndex(c => String(c.id) === String(id));
    if (idx === -1) throw new Error('Category not found');
    (demo as any).categories[idx] = { ...demo.categories[idx], ...categoryData };
    return (demo as any).categories[idx];
  }
  const response = await api.put(`/categories/${id}/`, categoryData);
  return response.data;
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.removeCategoryInPlace(id);
  }
  await api.delete(`/categories/${id}/`);
  return true;
};

// Servicios de etiquetas/tags
export const getProductTags = async (): Promise<ProductTag[]> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.tags;
  }
  const response = await api.get('/tags/');
  return response.data;
};

export const getProductTag = async (id: string): Promise<ProductTag> => {
  if (DEMO_MODE) {
    await demo.delay();
    const t = demo.tags.find(t => String(t.id) === String(id));
    if (!t) throw new Error('Tag not found');
    return t;
  }
  const response = await api.get(`/tags/${id}/`);
  return response.data;
};

export const createProductTag = async (tagData: Partial<ProductTag>): Promise<ProductTag> => {
  if (DEMO_MODE) {
    await demo.delay();
    const id = (demo as any).tags.length ? Math.max(...demo.tags.map(t => t.id)) + 1 : 1;
    const newT: ProductTag = { id, name: tagData.name || 'Nuevo' };
    (demo as any).tags.push(newT);
    return newT;
  }
  const response = await api.post('/tags/', tagData);
  return response.data;
};

export const updateProductTag = async (id: string, tagData: Partial<ProductTag>): Promise<ProductTag> => {
  if (DEMO_MODE) {
    await demo.delay();
    const idx = demo.tags.findIndex(t => String(t.id) === String(id));
    if (idx === -1) throw new Error('Tag not found');
    (demo as any).tags[idx] = { ...demo.tags[idx], ...tagData };
    return (demo as any).tags[idx];
  }
  const response = await api.put(`/tags/${id}/`, tagData);
  return response.data;
};

export const deleteProductTag = async (id: string): Promise<boolean> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.removeTagInPlace(id);
  }
  await api.delete(`/tags/${id}/`);
  return true;
};

// Servicios de ingredientes
export const getIngredients = async (): Promise<Ingredient[]> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.ingredients;
  }
  const response = await api.get('/ingredients/');
  return response.data;
};

export const createIngredient = async (data: Partial<Ingredient>): Promise<Ingredient> => {
  if (DEMO_MODE) {
    await demo.delay();
    const id = (demo as any).ingredients.length ? Math.max(...demo.ingredients.map(i => i.id)) + 1 : 1;
    const item: Ingredient = { id, name: data.name || 'Ingrediente', is_active: data.is_active ?? true };
    (demo as any).ingredients.push(item);
    return item;
  }
  const response = await api.post('/ingredients/', data);
  return response.data;
};

export const updateIngredient = async (id: number | string, data: Partial<Ingredient>): Promise<Ingredient> => {
  if (DEMO_MODE) {
    await demo.delay();
    const idx = demo.ingredients.findIndex(i => String(i.id) === String(id));
    if (idx === -1) throw new Error('Ingredient not found');
    (demo as any).ingredients[idx] = { ...demo.ingredients[idx], ...data };
    return (demo as any).ingredients[idx];
  }
  const response = await api.put(`/ingredients/${id}/`, data);
  return response.data;
};

export const deleteIngredient = async (id: number | string): Promise<boolean> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.removeIngredientInPlace(id);
  }
  await api.delete(`/ingredients/${id}/`);
  return true;
};

// Calcular precio en backend
export const calculateProductPrice = async (productId: number, extraIds: number[]): Promise<{ base_price: number; extras_total: number; total: number; extra_ids: number[] }> => {
  if (DEMO_MODE) {
    await demo.delay(100);
    const p = demo.products.find(pp => pp.id === productId);
    const base_price = Number(p?.price || 0);
    const extras_total = (p?.product_ingredients || []).filter(pi => extraIds.includes(pi.ingredient.id)).reduce((s, pi) => s + Number(pi.extra_cost || 0), 0);
    const total = base_price + extras_total;
    return { base_price, extras_total, total, extra_ids: extraIds };
  }
  const response = await api.post(`/products/${productId}/calculate_price/`, { extra_ids: extraIds });
  return response.data;
};

// Servicios para contenido dinámico
export const getHeroSection = async (): Promise<HeroSection> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.hero;
  }
  const response = await api.get('/hero/active/');
  return response.data;
};

export const getAboutSection = async (): Promise<AboutSection> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.about;
  }
  const response = await api.get('/about/active/');
  return response.data;
};

export const getContactInfo = async (): Promise<ContactInfo> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.contact;
  }
  const response = await api.get('/contact/active/');
  return response.data;
};

export const getFeaturedProduct = async (): Promise<FeaturedProduct> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.featured;
  }
  const response = await api.get('/featured/active/');
  return response.data;
};

// Servicios CRUD para contenido dinámico (admin)
export const createHeroSection = async (data: FormData): Promise<HeroSection> => {
  if (DEMO_MODE) {
    await demo.delay();
    const obj: any = Object.fromEntries(data.entries());
    return demo.updateHero({ ...obj, background_image_url: obj.background_image_url || undefined });
  }
  const response = await api.post('/hero/', data);
  return response.data;
};

export const updateHeroSection = async (id: string, data: FormData): Promise<HeroSection> => {
  if (DEMO_MODE) {
    await demo.delay();
    const obj: any = Object.fromEntries(data.entries());
    return demo.updateHero(obj);
  }
  const response = await api.put(`/hero/${id}/`, data);
  return response.data;
};

export const createAboutSection = async (data: FormData): Promise<AboutSection> => {
  if (DEMO_MODE) {
    await demo.delay();
    const obj: any = Object.fromEntries(data.entries());
    return demo.updateAbout(obj);
  }
  const response = await api.post('/about/', data);
  return response.data;
};

export const updateAboutSection = async (id: string, data: FormData): Promise<AboutSection> => {
  if (DEMO_MODE) {
    await demo.delay();
    const obj: any = Object.fromEntries(data.entries());
    return demo.updateAbout(obj);
  }
  const response = await api.put(`/about/${id}/`, data);
  return response.data;
};

export const createContactInfo = async (data: Partial<ContactInfo>): Promise<ContactInfo> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.updateContact(data);
  }
  const response = await api.post('/contact/', data);
  return response.data;
};

export const updateContactInfo = async (id: string, data: Partial<ContactInfo>): Promise<ContactInfo> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.updateContact(data);
  }
  const response = await api.put(`/contact/${id}/`, data);
  return response.data;
};

export const createFeaturedProduct = async (data: FormData): Promise<FeaturedProduct> => {
  if (DEMO_MODE) {
    await demo.delay();
    const obj: any = Object.fromEntries(data.entries());
    return demo.updateFeatured(obj);
  }
  const response = await api.post('/featured/', data);
  return response.data;
};

export const updateFeaturedProduct = async (id: string, data: FormData): Promise<FeaturedProduct> => {
  if (DEMO_MODE) {
    await demo.delay();
    const obj: any = Object.fromEntries(data.entries());
    return demo.updateFeatured(obj);
  }
  const response = await api.put(`/featured/${id}/`, data);
  return response.data;
};

// Reseñas (Reviews)
export interface Review {
  id: number;
  username: string;
  rating: number; // 1-5
  comment: string;
  created_at: string;
  is_visible?: boolean;
}

export const getReviews = async (): Promise<Review[]> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.reviews.filter(r => r.is_visible !== false);
  }
  const response = await api.get('/reviews/');
  return response.data;
};

export const getReviewsAdmin = async (): Promise<Review[]> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.reviews;
  }
  const response = await api.get('/reviews/?include_all=1');
  return response.data;
};

export const createReview = async (payload: { rating: number; comment: string; order_id?: number | null }): Promise<Review> => {
  if (DEMO_MODE) {
    await demo.delay();
    const item: Review = { id: Date.now(), username: 'Usuario', rating: payload.rating, comment: payload.comment, created_at: new Date().toISOString(), is_visible: true };
    (demo as any).reviews.unshift(item);
    return item;
  }
  const response = await api.post('/reviews/', payload);
  return response.data;
};

export const setReviewVisibility = async (id: number, is_visible: boolean): Promise<{ id: number; is_visible: boolean }> => {
  if (DEMO_MODE) {
    await demo.delay();
    const idx = demo.reviews.findIndex(r => r.id === id);
    if (idx !== -1) (demo as any).reviews[idx].is_visible = is_visible;
    return { id, is_visible };
  }
  const response = await api.patch(`/reviews/${id}/set_visibility/`, { is_visible });
  return response.data;
};

// Configuración del sitio (visibilidad de reseñas)
export interface SiteConfig {
  id: number;
  show_reviews: boolean;
  updated_at: string;
}

export const getSiteConfig = async (): Promise<SiteConfig> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.siteConfig;
  }
  const response = await api.get('/site-config/');
  return response.data;
};

export const updateSiteConfig = async (payload: Partial<SiteConfig>): Promise<SiteConfig> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.updateSiteConfig(payload);
  }
  const response = await api.patch('/site-config/1/', payload);
  return response.data;
};

// Servicios de órdenes
export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  if (DEMO_MODE) {
    await demo.delay(400);
    return demo.createOrderFromData(orderData);
  }
  const response = await api.post('/orders/', orderData);
  return response.data;
};

export interface AdminStats {
  ordersByDay: { date: string; count: number }[];
  revenueByDay: { date: string; total: number }[];
  statusDistribution: Record<string, number>;
  topProducts: { product: string; quantity: number }[];
  usersByDay: { date: string; count: number }[];
  rangeDays: number;
}

export interface UserStats {
  usersByDay: { date: string; count: number }[];
  rangeDays: number;
}

export const getAdminStats = async (range?: 'day' | 'week' | 'month'): Promise<AdminStats> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.adminStats(range);
  }
  const p: any = { _: Date.now() };
  if (range) p.range = range;
  const response = await api.get('/orders/admin_stats/', { params: p });
  return response.data;
};

export const getUserStats = async (range?: 'day' | 'week' | 'month'): Promise<UserStats> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.userStats(range);
  }
  const p: any = { _: Date.now() };
  if (range) p.range = range;
  const response = await api.get('/users/stats/', { params: p });
  return response.data;
};

export const getOrders = async (status?: string): Promise<Order[]> => {
  if (DEMO_MODE) {
    await demo.delay();
    const list = demo.listMyOrders();
    return status ? list.filter(o => o.status === (status as any)) : list;
  }
  const params = status ? `?status=${status}` : '';
  const response = await api.get(`/orders/${params}`);
  return response.data;
};

export const getMyOrders = async (): Promise<Order[]> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.listMyOrders();
  }
  const response = await api.get('/orders/my/');
  return response.data;
};

export const getOrder = async (id: number): Promise<Order> => {
  if (DEMO_MODE) {
    await demo.delay();
    const o = demo.listMyOrders().find(o => o.id === id);
    if (!o) throw new Error('Order not found');
    return o;
  }
  const response = await api.get(`/orders/${id}/`);
  return response.data;
};

export const updateOrderStatus = async (id: number, status: Order['status']): Promise<Order> => {
  if (DEMO_MODE) {
    await demo.delay();
    const o = demo.updateOrder(id, status);
    if (!o) throw new Error('Order not found');
    return o;
  }
  const response = await api.patch(`/orders/${id}/update_status/`, { status });
  return response.data;
};

export const deleteOrder = async (id: number): Promise<boolean> => {
  if (DEMO_MODE) {
    await demo.delay();
    return demo.removeOrder(id);
  }
  await api.delete(`/orders/${id}/`);
  return true;
};