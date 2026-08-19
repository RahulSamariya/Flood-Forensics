-- Flood Forensics database schema (Phase 2)
-- PostGIS-enabled PostgreSQL schema for all 14 tables.
-- Target: Supabase PostgreSQL with the PostGIS extension.

create extension if not exists postgis;

-- 1. flood_events
create table if not exists flood_events (
    event_id            text primary key,
    event_date          timestamptz not null,
    end_date            timestamptz,
    city                text not null,
    zone_id             text,
    location            geography(Point, 4326),
    latitude            double precision,
    longitude           double precision,
    severity            text not null,
    water_depth_cm      double precision,
    duration_minutes    integer,
    affected_area_km2   double precision,
    affected_population integer,
    source              text default 'DEMO',
    confidence          double precision default 0,
    created_at          timestamptz default now()
);

-- 2. rainfall
create table if not exists rainfall (
    id                       bigserial primary key,
    timestamp                timestamptz not null,
    station_id               text not null,
    location                 geography(Point, 4326),
    latitude                 double precision,
    longitude                double precision,
    rainfall_mm              double precision not null,
    duration_minutes         integer not null,
    rainfall_intensity_mm_hr double precision not null,
    source                   text default 'DEMO'
);

-- 3. water_levels
create table if not exists water_levels (
    id            bigserial primary key,
    timestamp     timestamptz not null,
    station_id    text not null,
    location      geography(Point, 4326),
    latitude      double precision,
    longitude     double precision,
    water_level_m double precision not null,
    danger_level_m double precision not null,
    flow_rate_m3_s double precision,
    status        text default 'normal'
);

-- 4. drains
create table if not exists drains (
    drain_id          text primary key,
    location          geography(Point, 4326),
    latitude          double precision,
    longitude         double precision,
    drain_type        text not null,
    capacity_m3_s     double precision not null,
    diameter_mm       integer,
    depth_m           double precision,
    length_m          double precision,
    condition_score   integer default 5,
    blockage_percent  double precision default 0,
    last_cleaned      timestamptz,
    installation_year integer
);

-- 5. drain_connections
create table if not exists drain_connections (
    connection_id  text primary key,
    from_drain_id  text references drains(drain_id),
    to_drain_id    text references drains(drain_id),
    flow_direction text default 'downstream',
    distance_m     double precision not null,
    capacity_m3_s  double precision not null
);

-- 6. maintenance_records
create table if not exists maintenance_records (
    work_id                    text primary key,
    drain_id                   text references drains(drain_id),
    reported_date              timestamptz,
    scheduled_date             timestamptz,
    completed_date             timestamptz,
    issue_type                 text not null,
    issue_description          text default '',
    action_taken               text default '',
    status                     text default 'pending',
    reported_blockage_percent  double precision,
    completion_blockage_percent double precision,
    verification_status        text default 'pending'
);

-- 7. citizen_reports
create table if not exists citizen_reports (
    report_id          text primary key,
    event_id           text references flood_events(event_id),
    timestamp          timestamptz not null,
    location           geography(Point, 4326),
    latitude           double precision,
    longitude          double precision,
    description        text default '',
    water_depth_cm     double precision,
    severity           text default 'medium',
    image_url          text,
    verification_status text default 'unverified',
    confidence         double precision default 0.5
);

-- 8. field_inspections
create table if not exists field_inspections (
    inspection_id        text primary key,
    work_id              text references maintenance_records(work_id),
    drain_id             text references drains(drain_id),
    inspector_id         text not null,
    timestamp            timestamptz,
    location             geography(Point, 4326),
    latitude             double precision,
    longitude            double precision,
    image_before         text,
    image_after          text,
    blockage_before      double precision,
    blockage_after       double precision,
    condition_before     integer,
    condition_after      integer,
    ai_verification_score double precision,
    verification_status  text default 'pending',
    notes                text default ''
);

-- 9. roads
create table if not exists roads (
    road_id           text primary key,
    name              text not null,
    road_type         text not null,
    importance        text default 'standard',
    length_m          double precision,
    elevation         double precision,
    flood_threshold_cm double precision,
    traffic_level     text default 'medium',
    criticality       text default 'standard'
);

-- 10. response_actions
create table if not exists response_actions (
    action_id       text primary key,
    event_id        text references flood_events(event_id),
    action_type     text not null,
    timestamp       timestamptz,
    location        text,
    team_id         text,
    status          text default 'scheduled',
    completion_time timestamptz,
    effectiveness   text
);

-- 11. damage_reports
create table if not exists damage_reports (
    damage_id      text primary key,
    event_id       text references flood_events(event_id),
    location       text not null,
    damage_type    text not null,
    severity       text default 'medium',
    estimated_cost double precision,
    image_url      text,
    verified       boolean default false
);

-- 12. agent_runs
create table if not exists agent_runs (
    id           bigserial primary key,
    event_id     text references flood_events(event_id),
    agent_name   text not null,
    status       text default 'pending',
    started_at   timestamptz,
    completed_at timestamptz,
    confidence   double precision default 0,
    output       text default ''
);

-- 13. agent_findings
create table if not exists agent_findings (
    id          bigserial primary key,
    event_id    text references flood_events(event_id),
    agent_name  text not null,
    finding_type text not null,
    finding     text not null,
    evidence    jsonb default '[]',
    confidence  double precision default 0,
    created_at  timestamptz default now()
);

-- 14. recommendations
create table if not exists recommendations (
    id                     bigserial primary key,
    event_id               text references flood_events(event_id),
    recommendation_type    text not null,
    title                  text not null,
    description            text default '',
    estimated_cost         double precision,
    expected_risk_reduction double precision,
    priority               text default 'medium',
    confidence             double precision default 0.5,
    status                 text default 'recommended'
);

-- Useful indexes
create index if not exists idx_rainfall_timestamp on rainfall(timestamp);
create index if not exists idx_water_levels_timestamp on water_levels(timestamp);
create index if not exists idx_events_zone on flood_events(zone_id);
create index if not exists idx_citizen_reports_event on citizen_reports(event_id);
create index if not exists idx_recommendations_event on recommendations(event_id);