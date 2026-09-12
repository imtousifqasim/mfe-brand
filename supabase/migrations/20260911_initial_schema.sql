-- ==============================================================================
-- MFE BRAND — COMPLETE CUSTOM E-COMMERCE DATABASE SCHEMA
-- PostgreSQL / Supabase
-- Zero-storage policy: all media stored as external URLs only.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES & ROLES (Linked to Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'manager', 'admin', 'super_admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer Addresses
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company TEXT,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Pakistan',
    address_type TEXT NOT NULL DEFAULT 'both' CHECK (address_type IN ('shipping', 'billing', 'both')),
    is_default_shipping BOOLEAN NOT NULL DEFAULT FALSE,
    is_default_billing BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. CATEGORIES & BRANDS (External URLs Only)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT, -- External image URL only (e.g. CDN or hosting)
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT, -- External logo URL only
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. PRODUCTS & ATTRIBUTES (External URLs Only)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    short_description TEXT,
    full_description TEXT,
    regular_price NUMERIC(12, 2) NOT NULL CHECK (regular_price >= 0),
    sale_price NUMERIC(12, 2) CHECK (sale_price IS NULL OR sale_price >= 0),
    cost_price NUMERIC(12, 2) DEFAULT 0,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
    low_stock_threshold INT NOT NULL DEFAULT 5,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    weight NUMERIC(8, 2), -- in kg
    dimensions TEXT, -- e.g. "20x15x5 cm"
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_best_deal BOOLEAN NOT NULL DEFAULT FALSE,
    is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    view_count INT NOT NULL DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product Images: External URLs ONLY. Never Supabase Storage.
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL, -- External URL only
    alt_text TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    caption TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tags
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.product_tags (
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

-- Attributes & Variants
CREATE TABLE IF NOT EXISTS public.product_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Color", "Size"
    options TEXT[] NOT NULL -- e.g. ["Black", "White", "Navy"]
);

CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,
    variant_name TEXT NOT NULL, -- e.g. "Black / XL"
    price NUMERIC(12, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    attributes JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. CART, WISHLIST & COMPARE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id TEXT, -- for guest cart
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (cart_id, product_id, variant_id)
);

CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (customer_id, product_id)
);

-- ------------------------------------------------------------------------------
-- 5. COUPONS & DISCOUNTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value > 0),
    minimum_spend NUMERIC(12, 2) DEFAULT 0,
    maximum_discount NUMERIC(12, 2),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    usage_limit INT,
    usage_limit_per_customer INT DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_id UUID,
    discount_amount NUMERIC(12, 2) NOT NULL,
    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. COURIERS & SHIPMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.couriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g. "TCS", "Leopards Courier", "M&P", "Pakistan Post"
    code TEXT UNIQUE NOT NULL,
    tracking_url_template TEXT, -- e.g. "https://www.tcsexpress.com/tracking?track={tracking_id}"
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. ORDERS & SNAPSHOTS (Immutable Historical Data)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL, -- e.g. "MFE-20260911-0001"
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    shipping_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(12, 2) NOT NULL,
    coupon_code TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'confirmed', 'packed', 'shipped', 
        'out_for_delivery', 'delivered', 'completed', 'cancelled', 'failed', 'refunded'
    )),
    payment_method TEXT NOT NULL, -- 'cod', 'bank_transfer', 'jazzcash', 'easypaisa', 'nayapay', 'sadapay'
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'partially_paid', 'refunded')),
    courier_id UUID REFERENCES public.couriers(id) ON DELETE SET NULL,
    tracking_id TEXT,
    tracking_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Item Snapshots
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(12, 2) NOT NULL,
    image_url TEXT, -- snapshot of external image URL
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Address Snapshots
CREATE TABLE IF NOT EXISTS public.order_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    address_type TEXT NOT NULL CHECK (address_type IN ('shipping', 'billing')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company TEXT,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Pakistan'
);

-- Order Status History (Audit trail of status transitions)
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    notes TEXT,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Internal Admin Order Notes (Hidden from customers)
CREATE TABLE IF NOT EXISTS public.order_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. REVIEWS & MODERATION
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. HOMEPAGE CMS & SETTINGS (External URLs Only)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL, -- External desktop slide URL only
    mobile_image_url TEXT, -- External mobile slide URL only
    heading TEXT NOT NULL,
    subtitle TEXT,
    button_text TEXT DEFAULT 'Shop Now',
    button_url TEXT DEFAULT '/products',
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.advantages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    icon_name TEXT NOT NULL, -- Lucide icon identifier e.g. "ShieldCheck", "Truck", "RefreshCw"
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    coupon_code TEXT,
    link_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- 'cod', 'bank_transfer', 'jazzcash', 'easypaisa', 'nayapay', 'sadapay'
    name TEXT NOT NULL,
    instructions TEXT,
    account_details TEXT, -- e.g. Account title, IBAN, Till number
    logo_url TEXT, -- External logo URL or icon
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_key TEXT UNIQUE NOT NULL, -- 'order_placed', 'order_shipped', 'order_delivered', etc.
    event_name TEXT NOT NULL,
    is_email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_email TEXT,
    action TEXT NOT NULL, -- e.g. 'PRODUCT_CREATED', 'ORDER_STATUS_UPDATED'
    entity_type TEXT NOT NULL, -- e.g. 'product', 'order', 'coupon'
    entity_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. DATABASE INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(is_published, stock_status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured, is_best_deal, is_new_arrival);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id, status);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 11. ATOMIC FUNCTIONS & SEQUENCES
-- ------------------------------------------------------------------------------

-- Human-readable Order Number Generator (e.g. MFE-20260911-0001)
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
    date_str TEXT;
    seq_val INT;
    order_num TEXT;
BEGIN
    date_str := TO_CHAR(NOW(), 'YYYYMMDD');
    seq_val := NEXTVAL('public.order_number_seq');
    order_num := 'MFE-' || date_str || '-' || LPAD(seq_val::TEXT, 4, '0');
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advantages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policy: Users read/edit their own; Admins read all
CREATE POLICY "Public profiles can be viewed by owners or admins"
ON public.profiles FOR ALL
USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'manager'));

-- Addresses Policy
CREATE POLICY "Addresses accessed by owner or admin"
ON public.addresses FOR ALL
USING (customer_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'manager'));

-- Products & Categories Policy (Public read for published; Admins manage)
CREATE POLICY "Public products view"
ON public.products FOR SELECT
USING (is_published = TRUE OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'manager'));

CREATE POLICY "Admin manage products"
ON public.products FOR ALL
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'manager'));

CREATE POLICY "Public product images view"
ON public.product_images FOR SELECT
USING (TRUE);

CREATE POLICY "Admin manage product images"
ON public.product_images FOR ALL
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'manager'));

CREATE POLICY "Public categories view"
ON public.categories FOR SELECT
USING (is_active = TRUE OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'manager'));

CREATE POLICY "Public brands view"
ON public.brands FOR SELECT
USING (is_active = TRUE OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'manager'));

-- Orders Policy
CREATE POLICY "Orders viewable by customer owner or admin"
ON public.orders FOR SELECT
USING (customer_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'manager'));

CREATE POLICY "Orders insertable by public/guests"
ON public.orders FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY "Admin manage orders"
ON public.orders FOR UPDATE
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'manager'));

-- Reviews Policy (Approved reviews public; Authors manage own pending; Admins moderate)
CREATE POLICY "Public reviews view"
ON public.reviews FOR SELECT
USING (status = 'approved' OR customer_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'manager'));

CREATE POLICY "Customer create reviews"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admin moderate reviews"
ON public.reviews FOR UPDATE
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'manager'));

-- Wishlist & Cart Policies
CREATE POLICY "Wishlists owner access"
ON public.wishlists FOR ALL
USING (customer_id = auth.uid());

CREATE POLICY "Carts owner access"
ON public.carts FOR ALL
USING (customer_id = auth.uid() OR session_id IS NOT NULL);

-- Homepage & Settings Policies (Public read; Admin edit)
CREATE POLICY "Public hero slides read" ON public.hero_slides FOR SELECT USING (TRUE);
CREATE POLICY "Public advantages read" ON public.advantages FOR SELECT USING (TRUE);
CREATE POLICY "Public announcements read" ON public.announcements FOR SELECT USING (TRUE);
CREATE POLICY "Public payment methods read" ON public.payment_methods FOR SELECT USING (TRUE);
CREATE POLICY "Public couriers read" ON public.couriers FOR SELECT USING (TRUE);

-- ------------------------------------------------------------------------------
-- 13. SEED DATA (High Quality Production Defaults with External WebP URLs)
-- ------------------------------------------------------------------------------

-- Couriers
INSERT INTO public.couriers (name, code, tracking_url_template) VALUES
('TCS Express', 'tcs', 'https://www.tcsexpress.com/tracking?track={tracking_id}'),
('Leopards Courier', 'leopards', 'https://leopardscourier.com/tracking/?track={tracking_id}'),
('M&P Express Logistics', 'mnp', 'https://mulphilog.com/tracking?consignment={tracking_id}'),
('Pakistan Post', 'pakpost', 'https://ep.gov.pk/track.asp?art_id={tracking_id}')
ON CONFLICT (code) DO NOTHING;

-- Payment Methods
INSERT INTO public.payment_methods (code, name, instructions, account_details, sort_order) VALUES
('cod', 'Cash on Delivery', 'Pay with cash upon delivery of your parcel.', 'Pay exact amount to rider at your doorstep.', 1),
('jazzcash', 'JazzCash', 'Send payment directly to our official JazzCash merchant account.', 'Account Title: MFE BRAND\nAccount/Till: 03001234567', 2),
('easypaisa', 'Easypaisa', 'Send payment to our Easypaisa merchant wallet.', 'Account Title: MFE BRAND\nAccount Number: 03451234567', 3),
('nayapay', 'NayaPay', 'Transfer via NayaPay handle @mfebrand.', 'NayaPay ID: @mfebrand', 4),
('sadapay', 'SadaPay', 'Transfer to SadaPay account IBAN.', 'IBAN: PK64SADA0000001234567890\nTitle: MFE BRAND', 5),
('bank_transfer', 'Direct Bank Transfer', 'Make your payment directly into our official bank account. Use Order ID as payment reference.', 'Bank: Meezan Bank Ltd\nAccount Title: MFE BRAND PVT LTD\nAccount No: 02010103456789\nIBAN: PK89MEZN0002010103456789', 6)
ON CONFLICT (code) DO NOTHING;

-- Advantages
INSERT INTO public.advantages (icon_name, title, description, sort_order) VALUES
('ShieldCheck', '100% Original Products', 'Guaranteed authentic luxury apparel, fabrics, and accessories.', 1),
('Truck', 'Fast Nationwide Delivery', 'Express shipping across Karachi, Lahore, Islamabad, and all of Pakistan.', 2),
('RefreshCw', '7-Day Easy Returns', 'Hassle-free return and exchange policy on all eligible purchases.', 3),
('Headphones', '24/7 Dedicated Support', 'Personal customer care assistance via WhatsApp, phone, and email.', 4)
ON CONFLICT DO NOTHING;

-- Announcements
INSERT INTO public.announcements (message, coupon_code, link_url, is_active) VALUES
('Elevate Your Style: Get 10% OFF Your First Order — Use Code MFE10 at checkout!', 'MFE10', '/products', TRUE)
ON CONFLICT DO NOTHING;

-- Coupons
INSERT INTO public.coupons (code, description, discount_type, discount_value, minimum_spend, maximum_discount, is_active) VALUES
('MFE10', '10% Welcome Discount for MFE Brand Shoppers', 'percentage', 10, 3000, 1500, TRUE),
('FLAT500', 'Flat PKR 500 discount on orders above PKR 5,000', 'fixed_amount', 500, 5000, 500, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Hero Slides (External WebP / CDN Images)
INSERT INTO public.hero_slides (image_url, mobile_image_url, heading, subtitle, button_text, button_url, sort_order) VALUES
('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop', 'Luxury Unstitched & Pret Collection', 'Handcrafted elegance tailored for timeless style across every season.', 'Explore Collection', '/products', 1),
('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop', 'Modern Festive & Formalwear 2026', 'Contemporary silhouettes with rich royal embroidery and bespoke embellishments.', 'Shop Festive', '/products?category=festive', 2),
('https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1600&auto=format&fit=crop', 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop', 'Exclusive Signature Accessories', 'Premium leather footwear, dupattas, and handcrafted jewelry pieces.', 'Discover Accessories', '/products?category=accessories', 3)
ON CONFLICT DO NOTHING;

-- Categories
INSERT INTO public.categories (name, slug, description, image_url, sort_order) VALUES
('Unstitched Luxury', 'unstitched-luxury', 'Premium 3-piece embroidered lawn, chiffon, and jacquard unstitched suits.', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop', 1),
('Ready to Wear Pret', 'ready-to-wear-pret', 'Modern ready-to-wear kurtas, coords, and fusion wear.', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop', 2),
('Festive & Formals', 'festive-formals', 'Exquisite hand-embellished raw silk and organza formal ensembles.', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop', 3),
('Menswear Royal', 'menswear-royal', 'Sophisticated cotton and wash-and-wear kurtas, waistcoats, and shalwar kameez.', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop', 4),
('Accessories & Shawls', 'accessories-shawls', 'Pure pashmina shawls, embroidered stoles, and statement clutches.', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=800&auto=format&fit=crop', 5)
ON CONFLICT (slug) DO NOTHING;

-- Brands
INSERT INTO public.brands (name, slug, logo_url, description, sort_order) VALUES
('MFE Signature', 'mfe-signature', 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?q=80&w=200&auto=format&fit=crop', 'The premier bespoke line of MFE Brand.', 1),
('MFE Heritage', 'mfe-heritage', 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=200&auto=format&fit=crop', 'Traditional craftsmanship preserving authentic artisanal weaves.', 2),
('MFE Pret', 'mfe-pret', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=200&auto=format&fit=crop', 'Vibrant, chic everyday luxury designed for modern life.', 3)
ON CONFLICT (slug) DO NOTHING;

-- Notification Settings
INSERT INTO public.notification_settings (event_key, event_name, is_email_enabled, description) VALUES
('order_confirmation', 'Order Confirmation Email', TRUE, 'Sent immediately to customer upon successful checkout.'),
('order_processing', 'Order Processing Email', TRUE, 'Sent when warehouse starts preparing items.'),
('order_confirmed', 'Order Confirmed Email', TRUE, 'Sent when payment is verified or COD order is confirmed.'),
('order_shipped', 'Order Shipped with Tracking', TRUE, 'Sent with courier name, tracking ID, and tracking URL.'),
('order_out_for_delivery', 'Out for Delivery Alert', TRUE, 'Sent when delivery rider has the parcel for final delivery.'),
('order_delivered', 'Delivery Completion Email', TRUE, 'Sent when courier confirms parcel received.'),
('order_cancelled', 'Order Cancellation Notice', TRUE, 'Sent if order is cancelled by admin or customer.'),
('review_received', 'New Customer Review Alert', TRUE, 'Sent to admin when customer submits product review.')
ON CONFLICT (event_key) DO NOTHING;

-- Site Settings
INSERT INTO public.site_settings (key, value) VALUES
('general', '{
    "store_name": "MFE BRAND",
    "tagline": "Luxury Pakistani Apparel & Contemporary Pret",
    "store_email": "support@mfebrand.com",
    "store_phone": "+92 300 1234567",
    "currency": "PKR",
    "currency_symbol": "Rs. ",
    "address": "MFE Tower, Main Boulevard, Gulberg III, Lahore, Pakistan",
    "logo_url": "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=400&auto=format&fit=crop",
    "free_shipping_threshold": 5000,
    "default_shipping_fee": 250
}'::jsonb)
ON CONFLICT (key) DO NOTHING;
