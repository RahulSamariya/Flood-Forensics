-- ============================================================
-- Flood Forensics — PostGIS-enabled Schema (Phase 2)
-- All 14 tables for the urban flood investigation platform
-- ============================================================

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. flood_events
CREATE TABLE IF NOT EXISTS flood_events (
    event_id       TEXT PRIMARY KEY,
    event_date     TIMESTAMPTZ NOT NULL,
    end_date       TIMESTAMPTZ,
    city           TEXT NOT NULL,
    zone_id        TEXT,
    location       GEOGRAPHY(POINT, 4326),
    latitude       DOUBLE PRECISION NOT NULL,
    longitude      DOUBLE PRECISION NOT NULL,
    severity       TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
    water_depth_cm DOUBLE PRECISION,
    duration_minutes INTEGER,
    affected_area_km2 DOUBLE PRECISION,
    affected_population INTEGER,
    source         TEXT DEFAULT 'DEMO',
    confidence     DOUBLE PRECISION CHECK (confidence >= 0 AND confidence <= 1),
    created_at     TIMESTAMPTZ DEFAULT now()
);

-- 2. rainfall
CREATE TABLE IF NOT EXISTS rainfall (
    id                      TEXT PRIMARY KEY,
    timestamp               TIMESTAMPTZ NOT NULL,
    station_id              TEXT NOT NULL,
    location                GEOGRAPHY(POINT, 4326),
    latitude                DOUBLE PRECISION NOT NULL,
    longitude               DOUBLE PRECISION NOT NULL,
    rainfall_mm             DOUBLE PRECISION NOT NULL,
    duration_minutes        INTEGER,
    rainfall_intensity_mm_hr DOUBLE PRECISION,
    source                  TEXT DEFAULT 'DEMO'
);

-- 3. water_levels
CREATE TABLE IF NOT EXISTS water_levels (
    id              TEXT PRIMARY KEY,
    timestamp       TIMESTAMPTZ NOT NULL,
    station_id      TEXT NOT NULL,
    location        GEOGRAPHY(POINT, 4326),
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    water_level_m   DOUBLE PRECISION NOT NULL,
    danger_level_m  DOUBLE PRECISION,
    flow_rate_m3_s  DOUBLE PRECISION,
    status          TEXT CHECK (status IN ('normal','rising','warning','critical'))
);

-- 4. drains
CREATE TABLE IF NOT EXISTS drains (
    drain_id        TEXT PRIMARY KEY,
    location        GEOGRAPHY(POINT, 4326),
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    drain_type      TEXT NOT NULL CHECK (drain_type IN ('primary','secondary','tertiary')),
    capacity_m3_s   DOUBLE PRECISION,
    diameter_mm     INTEGER,
    depth_m         DOUBLE PRECISION,
    length_m        DOUBLE PRECISION,
    condition_score INTEGER CHECK (condition_score >= 0 AND condition_score <= 100),
    blockage_percent INTEGER CHECK (blockage_percent >= 0 AND blockage_percent <= 100),
    last_cleaned    DATE,
    installation_year INTEGER
);

-- 5. drain_connections
CREATE TABLE IF NOT EXISTS drain_connections (
    connection_id   TEXT PRIMARY KEY,
    from_drain_id   TEXT REFERENCES drains(drain_id),
    to_drain_id     TEXT REFERENCES drains(drain_id),
    flow_direction  TEXT,
    distance_m      DOUBLE PRECISION,
    capacity_m3_s   DOUBLE PRECISION
);

-- 6. maintenance_records
CREATE TABLE IF NOT EXISTS maintenance_records (
    work_id                 TEXT PRIMARY KEY,
    drain_id                TEXT REFERENCES drains(drain_id),
    reported_date           DATE,
    scheduled_date          DATE,
    completed_date          DATE,
    issue_type              TEXT,
    issue_description       TEXT,
    action_taken            TEXT,
    status                  TEXT CHECK (status IN ('pending','scheduled','in_progress','completed','overdue')),
    reported_blockage_percent  INTEGER,
    completion_blockage_percent INTEGER,
    verification_status     TEXT DEFAULT 'unverified'
);

-- 7. citizen_reports
CREATE TABLE IF NOT EXISTS citizen_reports (
    report_id            TEXT PRIMARY KEY,
    event_id             TEXT REFERENCES flood_events(event_id),
    timestamp            TIMESTAMPTZ NOT NULL,
    location             GEOGRAPHY(POINT, 4326),
    latitude             DOUBLE PRECISION NOT NULL,
    longitude            DOUBLE PRECISION NOT NULL,
    description          TEXT,
    water_depth_cm       DOUBLE PRECISION,
    severity             TEXT,
    image_url            TEXT,
    verification_status  TEXT DEFAULT 'unverified',
    confidence           DOUBLE PRECISION
);

-- 8. field_inspections
CREATE TABLE IF NOT EXISTS field_inspections (
    inspection_id        TEXT PRIMARY KEY,
    work_id              TEXT REFERENCES maintenance_records(work_id),
    drain_id             TEXT REFERENCES drains(drain_id),
    inspector_id         TEXT,
    timestamp            TIMESTAMPTZ,
    location             GEOGRAPHY(POINT, 4326),
    latitude             DOUBLE PRECISION,
    longitude            DOUBLE PRECISION,
    image_before         TEXT,
    image_after          TEXT,
    blockage_before      DOUBLE PRECISION,
    blockage_after       DOUBLE PRECISION,
    condition_before     INTEGER,
    condition_after      INTEGER,
    ai_verification_score DOUBLE PRECISION,
    verification_status  TEXT DEFAULT 'PENDING',
    notes                TEXT
);

-- 9. roads
CREATE TABLE IF NOT EXISTS roads (
    road_id            TEXT PRIMARY KEY,
    name               TEXT NOT NULL,
    road_type          TEXT,
    importance         TEXT,
    length_m           DOUBLE PRECISION,
    elevation          DOUBLE PRECISION,
    flood_threshold_cm DOUBLE PRECISION,
    traffic_level      TEXT,
    criticality        TEXT
);

-- 10. response_actions
CREATE TABLE IF NOT EXISTS response_actions (
    action_id        TEXT PRIMARY KEY,
    event_id         TEXT REFERENCES flood_events(event_id),
    action_type      TEXT,
    timestamp        TIMESTAMPTZ,
    location         TEXT,
    team_id          TEXT,
    status           TEXT,
    completion_time  TIMESTAMPTZ,
    effectiveness    DOUBLE PRECISION
);

-- 11. damage_reports
CREATE TABLE IF NOT EXISTS damage_reports (
    damage_id       TEXT PRIMARY KEY,
    event_id        TEXT REFERENCES flood_events(event_id),
    location        TEXT,
    damage_type     TEXT,
    severity        TEXT,
    estimated_cost  DOUBLE PRECISION,
    image_url       TEXT,
    verified        BOOLEAN DEFAULT FALSE
);

-- 12. agent_runs
CREATE TABLE IF NOT EXISTS agent_runs (
    id              TEXT PRIMARY KEY,
    event_id        TEXT REFERENCES flood_events(event_id),
    agent_name      TEXT NOT NULL,
    status          TEXT DEFAULT 'pending',
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    confidence      DOUBLE PRECISION,
    output          JSONB
);

-- 13. agent_findings
CREATE TABLE IF NOT EXISTS agent_findings (
    id              TEXT PRIMARY KEY,
    event_id        TEXT REFERENCES flood_events(event_id),
    agent_name      TEXT NOT NULL,
    finding_type    TEXT,
    finding         TEXT,
    evidence        JSONB,
    confidence      DOUBLE PRECISION,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- 14. recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id                      TEXT PRIMARY KEY,
    event_id                TEXT REFERENCES flood_events(event_id),
    recommendation_type     TEXT,
    title                   TEXT NOT NULL,
    description             TEXT,
    estimated_cost          DOUBLE PRECISION,
    expected_risk_reduction DOUBLE PRECISION,
    priority                TEXT,
    confidence              DOUBLE PRECISION,
    status                  TEXT DEFAULT 'proposed'
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_flood_events_city ON flood_events(city);
CREATE INDEX IF NOT EXISTS idx_flood_events_zone ON flood_events(zone_id);
CREATE INDEX IF NOT EXISTS idx_rainfall_station ON rainfall(station_id);
CREATE INDEX IF NOT EXISTS idx_water_levels_station ON water_levels(station_id);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_event ON citizen_reports(event_id);
CREATE INDEX IF NOT EXISTS idx_response_actions_event ON response_actions(event_id);
CREATE INDEX IF NOT EXISTS idx_damage_reports_event ON damage_reports(event_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_event ON agent_runs(event_id);
CREATE INDEX IF NOT EXISTS idx_agent_findings_event ON agent_findings(event_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_event ON recommendations(event_id);
