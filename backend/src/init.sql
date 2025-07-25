-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT
);

CREATE TABLE IF NOT EXISTS products
(
    id uuid NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    quantity integer NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    category text COLLATE pg_catalog."default" NOT NULL,
    photo text,
    price integer NOT NULL,
    CONSTRAINT products_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,         
    product_id UUID NOT NULL,      
    quantity INT NOT NULL DEFAULT 1,
    added_at timestamp with time zone,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),

    CONSTRAINT unique_user_product UNIQUE (user_id, product_id) 
);

CREATE TABLE IF NOT EXISTS orders
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    order_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status text DEFAULT 'pending',
    total_amount integer NOT NULL,
    paymob_order_id text,
    CONSTRAINT orders_pkey PRIMARY KEY (id),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id)
);
CREATE TABLE IF NOT EXISTS order_items
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    product_id uuid,
    order_id uuid,
    quantity integer NOT NULL,
    CONSTRAINT order_items_pkey PRIMARY KEY (id),
    CONSTRAINT fk_order_id FOREIGN KEY (order_id) REFERENCES orders (id) MATCH SIMPLE,
    CONSTRAINT fk_product_id FOREIGN KEY (product_id) REFERENCES products (id) MATCH SIMPLE
);
