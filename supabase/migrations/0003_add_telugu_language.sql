alter table public.farmers drop constraint if exists farmers_language_check;
alter table public.farmers add constraint farmers_language_check check (language in ('en', 'hi', 'te'));
