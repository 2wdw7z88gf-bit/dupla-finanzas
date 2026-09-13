-- Seeds a starter set of categories for your household, so "Nuevo movimiento"
-- has something to pick from right away. Safe to edit the list below before
-- running, or just add/rename/delete categories from the app afterwards
-- (Ajustes → Categorías). Run this ONCE — running it twice duplicates them.

insert into categories (household_id, name, type, icon, color)
select (select id from households order by created_at asc limit 1), c.name, c.type, c.icon, c.color
from (values
  ('Comida', 'gasto', 'food', 'coral'),
  ('Arriendo y hogar', 'gasto', 'building', 'indigo'),
  ('Transporte', 'gasto', 'car', 'teal'),
  ('Compras', 'gasto', 'bag', 'gold'),
  ('Entretenimiento', 'gasto', 'film', 'berry'),
  ('Salud', 'gasto', 'heart', 'success'),
  ('Sueldo', 'ingreso', 'wallet', 'success')
) as c(name, type, icon, color);
