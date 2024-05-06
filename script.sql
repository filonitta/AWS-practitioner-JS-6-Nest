create EXTENSION if not exists "uuid-ossp";

DO $$ BEGIN
CREATE TYPE cart_status AS ENUM ('OPEN', 'ORDERED');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;

drop table IF exists carts;

CREATE table carts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    created_at DATE NOT NULL,
    updated_at DATE NOT NULL,
    status cart_status
);

INSERT INTO carts (id, user_id, created_at, updated_at, status) VALUES
('5706eac2-fc97-4a6f-8c25-8c99c5e0f205', uuid_generate_v4(), current_date, current_date, 'OPEN'),
('1240ef0c-bfdd-49ce-9f09-f70772c76a21', uuid_generate_v4(), current_date, current_date, 'ORDERED');

drop table IF exists cart_items;

CREATE TABLE cart_items (
    cart_id UUID REFERENCES carts(id),
    product_id UUID,
    count INTEGER
);

INSERT INTO cart_items (cart_id, product_id, count) VALUES
('5706eac2-fc97-4a6f-8c25-8c99c5e0f205', uuid_generate_v4(), 100),
('1240ef0c-bfdd-49ce-9f09-f70772c76a21', uuid_generate_v4(), 200);


