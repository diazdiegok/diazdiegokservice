-- Categories
INSERT OR IGNORE INTO categories (name, slug, icon, description) VALUES
('Teléfonos', 'telefonos', 'smartphone', 'Teléfonos celulares libres de todas las marcas'),
('Notebooks', 'notebooks', 'laptop', 'Notebooks y laptops para trabajo y gaming'),
('Tablets', 'tablets', 'tablet-smartphone', 'Tablets para entretenimiento y productividad'),
('Smartwatches', 'smartwatches', 'watch', 'Relojes inteligentes y wearables'),
('Parlantes', 'parlantes', 'speaker', 'Parlantes bluetooth y de alta fidelidad'),
('Accesorios', 'accesorios', 'headphones', 'Auriculares, fundas, cargadores y más');

-- Admin user (password: admin123)
INSERT OR IGNORE INTO users (name, email, password_hash, phone, role) VALUES
('Diego Diaz', 'diazdiegonicok@gmail.com', '$2a$10$placeholder_hash_will_be_set_on_init', '3435508586', 'admin');

-- Teléfonos
INSERT OR IGNORE INTO products (category_id, name, description, price, stock, image_url, specs, featured) VALUES
(1, 'iPhone 15 Pro Max', 'El iPhone más potente con acabado en Titanio Negro y chip A17 Pro.', 1399999, 10, '/images/products/iphone-15.webp', '{"pantalla":"6.7\" OLED","procesador":"A17 Pro","ram":"8GB","almacenamiento":"256GB","camara":"48MP Main + 12MP Ultra Wide + 12MP Telephoto","bateria":"4441mAh"}', 1),
(1, 'Samsung Galaxy S24 Ultra', 'Pantalla plana, marco de titanio y la mejor cámara con zoom óptico.', 1299999, 12, '/images/products/samsung-s24.webp', '{"pantalla":"6.8\" Dynamic AMOLED 2X","procesador":"Snapdragon 8 Gen 3","ram":"12GB","almacenamiento":"256GB","camara":"200MP + 50MP + 12MP + 10MP","bateria":"5000mAh"}', 1),
(1, 'Motorola Edge 40', 'Diseño ultra delgado, pantalla curva pOLED 144Hz y carga rápida 68W', 549999, 20, '/images/products/moto-edge40.webp', '{"pantalla":"6.55\" pOLED 144Hz","procesador":"Dimensity 8020","ram":"8GB","almacenamiento":"256GB","camara":"50MP + 13MP","bateria":"4400mAh"}', 1),
(1, 'Xiaomi Redmi Note 13 Pro', 'Cámara de 200MP, pantalla AMOLED 120Hz y batería de 5100mAh', 399999, 25, '/images/products/xiaomi-note13.webp', '{"pantalla":"6.67\" AMOLED 120Hz","procesador":"Snapdragon 7s Gen 2","ram":"8GB","almacenamiento":"256GB","camara":"200MP + 8MP + 2MP","bateria":"5100mAh"}', 0),
(1, 'Samsung Galaxy A54', 'Resistente al agua, pantalla Super AMOLED 120Hz, triple cámara', 449999, 18, '/images/products/samsung-a54.webp', '{"pantalla":"6.4\" Super AMOLED 120Hz","procesador":"Exynos 1380","ram":"8GB","almacenamiento":"128GB","camara":"50MP + 12MP + 5MP","bateria":"5000mAh"}', 0);

-- Notebooks
INSERT OR IGNORE INTO products (category_id, name, description, price, stock, image_url, specs, featured) VALUES
(2, 'MacBook Pro M3', 'La notebook para profesionales con el chip M3 en acabado Space Black.', 1899999, 5, '/images/products/macbook-pro.webp', '{"pantalla":"14.2\" Liquid Retina XDR","procesador":"Apple M3 Pro","ram":"18GB","almacenamiento":"512GB SSD","grafica":"14-core GPU","bateria":"18 horas"}', 1),
(2, 'Lenovo IdeaPad 3 15', 'Notebook ideal para trabajo y estudio con procesador Ryzen 5', 699999, 8, '/images/products/lenovo-ideapad3.webp', '{"pantalla":"15.6\" FHD","procesador":"AMD Ryzen 5 7520U","ram":"8GB","almacenamiento":"512GB SSD","grafica":"AMD Radeon","bateria":"8 horas"}', 1),
(2, 'HP Pavilion 15', 'Potente notebook con Intel Core i5 de 12va generación', 849999, 6, '/images/products/hp-pavilion.webp', '{"pantalla":"15.6\" FHD IPS","procesador":"Intel Core i5-1235U","ram":"16GB","almacenamiento":"512GB SSD","grafica":"Intel Iris Xe","bateria":"8.5 horas"}', 1),
(2, 'ASUS VivoBook 15', 'Ultradelgada y liviana con pantalla NanoEdge y teclado ergonómico', 599999, 10, '/images/products/asus-vivobook.webp', '{"pantalla":"15.6\" FHD NanoEdge","procesador":"Intel Core i3-1215U","ram":"8GB","almacenamiento":"256GB SSD","grafica":"Intel UHD","bateria":"6 horas"}', 0);

-- Tablets
INSERT OR IGNORE INTO products (category_id, name, description, price, stock, image_url, specs, featured) VALUES
(3, 'iPad 10ma Generación', 'Chip A14 Bionic, pantalla Liquid Retina 10.9" y USB-C', 649999, 12, '/images/products/ipad-10.webp', '{"pantalla":"10.9\" Liquid Retina","procesador":"A14 Bionic","ram":"4GB","almacenamiento":"64GB","camara":"12MP","bateria":"10 horas"}', 1),
(3, 'Samsung Galaxy Tab A9', 'Tablet accesible con pantalla TFT 8.7" ideal para entretenimiento', 199999, 20, '/images/products/samsung-tab-a9.webp', '{"pantalla":"8.7\" TFT","procesador":"Helio G99","ram":"4GB","almacenamiento":"64GB","camara":"8MP","bateria":"5100mAh"}', 0),
(3, 'Lenovo Tab M10 Plus', 'Pantalla 2K de 10.6" con Dolby Atmos para una experiencia inmersiva', 299999, 15, '/images/products/lenovo-tab-m10.webp', '{"pantalla":"10.6\" 2K IPS","procesador":"Helio G80","ram":"4GB","almacenamiento":"128GB","camara":"8MP","bateria":"7700mAh"}', 0);

-- Smartwatches
INSERT OR IGNORE INTO products (category_id, name, description, price, stock, image_url, specs, featured) VALUES
(4, 'Apple Watch SE 2da Gen', 'Reloj inteligente con detección de caídas, seguimiento de actividad y más', 399999, 10, '/images/products/apple-watch-se.webp', '{"pantalla":"OLED Retina","procesador":"S8","conectividad":"WiFi + BT","resistencia":"50m agua","bateria":"18 horas","sensores":"CardioFrec, Acelerómetro, Giroscopio"}', 1),
(4, 'Samsung Galaxy Watch 6', 'Diseño premium con bisel giratorio y seguimiento avanzado de salud', 349999, 8, '/images/products/samsung-watch6.webp', '{"pantalla":"1.4\" Super AMOLED","procesador":"Exynos W930","conectividad":"WiFi + BT + LTE","resistencia":"50m agua","bateria":"40 horas","sensores":"BioActive"}', 0),
(4, 'Amazfit GTR 4', 'Batería de hasta 14 días, GPS dual y métricas avanzadas de fitness', 199999, 15, '/images/products/amazfit-gtr4.webp', '{"pantalla":"1.43\" AMOLED","procesador":"Propio","conectividad":"WiFi + BT","resistencia":"50m agua","bateria":"14 días","sensores":"BioTracker PPG"}', 0);

-- Parlantes
INSERT OR IGNORE INTO products (category_id, name, description, price, stock, image_url, specs, featured) VALUES
(5, 'JBL Flip 6', 'Parlante portátil resistente al agua con sonido potente JBL Pro', 159999, 20, '/images/products/jbl-flip6.webp', '{"potencia":"30W","bluetooth":"5.1","bateria":"12 horas","resistencia":"IP67","peso":"550g"}', 1),
(5, 'Marshall Emberton II', 'Sonido icónico Marshall en formato portátil con 360° de audio', 199999, 10, '/images/products/marshall-emberton.webp', '{"potencia":"20W","bluetooth":"5.1","bateria":"30 horas","resistencia":"IP67","peso":"700g"}', 0),
(5, 'Sony SRS-XB13', 'Parlante ultra compacto con EXTRA BASS y resistencia al polvo y agua', 79999, 30, '/images/products/sony-xb13.webp', '{"potencia":"5W","bluetooth":"4.2","bateria":"16 horas","resistencia":"IP67","peso":"253g"}', 0);

-- Accesorios
INSERT OR IGNORE INTO products (category_id, name, description, price, stock, image_url, specs, featured) VALUES
(6, 'AirPods Pro 2da Gen', 'Cancelación activa de ruido, audio espacial y estuche con USB-C', 349999, 15, '/images/products/airpods-pro2.webp', '{"tipo":"In-ear TWS","cancelacion":"ANC","bateria":"6h + 30h estuche","resistencia":"IPX4","chip":"H2"}', 1),
(6, 'Samsung Galaxy Buds FE', 'Auriculares inalámbricos con ANC y sonido AKG de alta calidad', 129999, 20, '/images/products/samsung-buds-fe.webp', '{"tipo":"In-ear TWS","cancelacion":"ANC","bateria":"6h + 21h estuche","resistencia":"IPX2","driver":"1-way speaker"}', 0),
(6, 'Cargador Inalámbrico Samsung 15W', 'Base de carga rápida inalámbrica compatible con Qi', 39999, 40, '/images/products/samsung-charger.webp', '{"potencia":"15W","compatibilidad":"Qi","tipo":"Pad","indicador":"LED"}', 0),
(6, 'Funda Silicona iPhone 15', 'Funda oficial de silicona suave al tacto con interior de microfibra', 29999, 50, '/images/products/funda-iphone15.webp', '{"material":"Silicona","compatibilidad":"iPhone 15","tipo":"Case","proteccion":"Bordes elevados"}', 0),
(6, 'Cable USB-C a USB-C 2m', 'Cable de carga rápida y datos USB 3.1 de alta resistencia', 14999, 100, '/images/products/cable-usbc.webp', '{"longitud":"2m","tipo":"USB-C a USB-C","velocidad":"USB 3.1","carga":"100W PD"}', 0);
