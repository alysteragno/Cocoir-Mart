insert into categories (name, slug) values
  ('Erosion Control', 'erosion-control'),
  ('Gardening', 'gardening')
  on conflict do nothing;

insert into products (name, slug, description, price, stock, category_id, is_featured, is_new)
values
  ('Coir Log 20cm x 2m', 'coir-log-20x200', 'Coconut coir log for slope stabilization.', 1200, 25, (select id from categories where slug='erosion-control'), true, true),
  ('Coir Mat 1m x 10m', 'coir-mat-1x10', 'Biodegradable coir matting for erosion control.', 1800, 15, (select id from categories where slug='erosion-control'), true, false),
  ('Coir Pot 6-inch', 'coir-pot-6in', 'Eco-friendly plant pot made from coir.', 60, 200, (select id from categories where slug='gardening'), false, true)
  on conflict do nothing;
