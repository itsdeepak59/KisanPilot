alter table public.farmers add column if not exists alert_rain_mm double precision not null default 20 check (alert_rain_mm >= 0 and alert_rain_mm <= 500);
alter table public.farmers add column if not exists alert_wind_kmh double precision not null default 40 check (alert_wind_kmh >= 0 and alert_wind_kmh <= 300);
alter table public.farmers add column if not exists alert_price_drop_pct double precision check (alert_price_drop_pct is null or (alert_price_drop_pct > 0 and alert_price_drop_pct <= 100));
