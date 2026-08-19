-- F2026-001 demo seed data (Phase 2)
-- All data clearly labeled DEMO/SIMULATED. Not real government data.
-- Matches backend/app/core/seed.py so agents reason over the same dataset.

-- Flood events (including historical events for recurrence analysis)
insert into flood_events
    (event_id, event_date, end_date, city, zone_id, latitude, longitude,
     severity, water_depth_cm, duration_minutes, affected_area_km2,
     affected_population, source, confidence)
values
    ('F2026-001', '2026-06-15 13:30:00+00', '2026-06-15 17:30:00+00', 'Chennai', 'J18',
     13.0827, 80.2707, 'critical', 65, 240, 2.4, 18000, 'DEMO', 0.9),
    ('F2025-003', '2025-07-22 13:45:00+00', '2025-07-22 17:15:00+00', 'Chennai', 'J18',
     13.0824, 80.2710, 'high', 58, 210, 1.9, 12000, 'DEMO', 0.85),
    ('F2024-011', '2024-08-10 14:10:00+00', '2024-08-10 17:10:00+00', 'Chennai', 'J18',
     13.0830, 80.2702, 'medium', 45, 180, 1.2, 8000, 'DEMO', 0.8);

-- Rainfall — rain begins 13:00, peak intensity 68mm/hr at 15:00
insert into rainfall
    (timestamp, station_id, latitude, longitude, rainfall_mm, duration_minutes,
     rainfall_intensity_mm_hr, source)
values
    ('2026-06-15 12:00:00+00', 'S-RAIN-07', 13.0827, 80.2707, 2.0, 60, 2.0, 'DEMO'),
    ('2026-06-15 12:30:00+00', 'S-RAIN-07', 13.0827, 80.2707, 3.0, 30, 6.0, 'DEMO'),
    ('2026-06-15 13:00:00+00', 'S-RAIN-07', 13.0827, 80.2707, 8.0, 60, 8.0, 'DEMO'),
    ('2026-06-15 13:30:00+00', 'S-RAIN-07', 13.0827, 80.2707, 14.0, 30, 28.0, 'DEMO'),
    ('2026-06-15 14:00:00+00', 'S-RAIN-07', 13.0827, 80.2707, 12.0, 30, 24.0, 'DEMO'),
    ('2026-06-15 14:30:00+00', 'S-RAIN-07', 13.0827, 80.2707, 18.0, 30, 36.0, 'DEMO'),
    ('2026-06-15 15:00:00+00', 'S-RAIN-07', 13.0827, 80.2707, 34.0, 30, 68.0, 'DEMO'),
    ('2026-06-15 15:30:00+00', 'S-RAIN-07', 13.0827, 80.2707, 22.0, 30, 44.0, 'DEMO'),
    ('2026-06-15 16:00:00+00', 'S-RAIN-07', 13.0827, 80.2707, 12.0, 60, 12.0, 'DEMO'),
    ('2026-06-15 16:30:00+00', 'S-RAIN-07', 13.0827, 80.2707, 6.0, 60, 6.0, 'DEMO'),
    ('2026-06-15 17:00:00+00', 'S-RAIN-07', 13.0827, 80.2707, 3.0, 60, 3.0, 'DEMO'),
    ('2026-06-15 18:00:00+00', 'S-RAIN-07', 13.0827, 80.2707, 1.0, 60, 1.0, 'DEMO');

-- Water levels — danger level 1.5m, exceeded 14:30, peaks 15:00
insert into water_levels
    (timestamp, station_id, latitude, longitude, water_level_m, danger_level_m,
     flow_rate_m3_s, status)
values
    ('2026-06-15 13:00:00+00', 'W-RIVER-07', 13.0827, 80.2707, 0.60, 1.5, 2.60, 'normal'),
    ('2026-06-15 13:30:00+00', 'W-RIVER-07', 13.0827, 80.2707, 0.72, 1.5, 2.72, 'normal'),
    ('2026-06-15 14:00:00+00', 'W-RIVER-07', 13.0827, 80.2707, 0.95, 1.5, 2.95, 'watch'),
    ('2026-06-15 14:30:00+00', 'W-RIVER-07', 13.0827, 80.2707, 1.28, 1.5, 3.28, 'warning'),
    ('2026-06-15 15:00:00+00', 'W-RIVER-07', 13.0827, 80.2707, 1.86, 1.5, 3.86, 'critical'),
    ('2026-06-15 15:30:00+00', 'W-RIVER-07', 13.0827, 80.2707, 1.72, 1.5, 3.72, 'critical'),
    ('2026-06-15 16:00:00+00', 'W-RIVER-07', 13.0827, 80.2707, 1.48, 1.5, 3.48, 'warning'),
    ('2026-06-15 16:30:00+00', 'W-RIVER-07', 13.0827, 80.2707, 1.30, 1.5, 3.30, 'warning'),
    ('2026-06-15 17:00:00+00', 'W-RIVER-07', 13.0827, 80.2707, 1.05, 1.5, 3.05, 'normal'),
    ('2026-06-15 17:30:00+00', 'W-RIVER-07', 13.0827, 80.2707, 0.82, 1.5, 2.82, 'normal');

-- Drains — D142 is the blocked culprit (71% blockage)
insert into drains
    (drain_id, latitude, longitude, drain_type, capacity_m3_s, diameter_mm, depth_m,
     length_m, condition_score, blockage_percent, last_cleaned, installation_year)
values
    ('D141', 13.0820, 80.2695, 'main',   2.0, 900, 2.5, 320, 8, 5,  '2026-06-01 09:00:00+00', 2010),
    ('D142', 13.0827, 80.2707, 'branch', 1.2, 600, 1.8, 410, 3, 71, '2025-09-10 09:00:00+00', 2008),
    ('D143', 13.0835, 80.2720, 'main',   1.8, 750, 2.1, 260, 6, 22, '2026-02-14 00:00:00+00', 2008),
    ('D301', 13.0900, 80.2600, 'branch', 1.5, 700, 2.0, 380, 9, 4,  '2026-05-05 00:00:00+00', 2015);

insert into drain_connections (connection_id, from_drain_id, to_drain_id, flow_direction, distance_m, capacity_m3_s)
values
    ('C-1', 'D141', 'D142', 'downstream', 85, 1.2),
    ('C-2', 'D142', 'D143', 'downstream', 120, 1.2);

-- Maintenance records
insert into maintenance_records
    (work_id, drain_id, reported_date, scheduled_date, completed_date, issue_type,
     issue_description, action_taken, status, reported_blockage_percent,
     completion_blockage_percent, verification_status)
values
    ('W-88', 'D142', '2026-06-16 09:00:00+00', '2026-06-22 09:00:00+00', '2026-06-24 09:00:00+00',
     'blockage', '71% blockage from silt and debris in J18 branch drain.',
     'High-pressure jetting and desilting of D142.', 'completed', 71, 8, 'pending'),
    ('W-77', 'D143', '2026-03-02 10:00:00+00', '2026-03-10 10:00:00+00', '2026-03-10 14:00:00+00',
     'routine', 'Routine inspection of D143.', 'Inspection only; no action required.',
     'completed', 18, 15, 'verified');

-- Citizen reports
insert into citizen_reports
    (report_id, event_id, timestamp, latitude, longitude, description,
     water_depth_cm, severity, verification_status, confidence)
values
    ('C-101', 'F2026-001', '2026-06-15 14:37:00+00', 13.0826, 80.2709,
     'Waterlogged road in front of J18 market, two-wheelers unable to pass.', 25, 'medium', 'confirmed', 0.8),
    ('C-102', 'F2026-001', '2026-06-15 15:10:00+00', 13.0830, 80.2712,
     'Knee-deep water entering shop entrances at J18.', 40, 'high', 'confirmed', 0.85);

-- Roads
insert into roads (road_id, name, road_type, importance, length_m, elevation, flood_threshold_cm, traffic_level, criticality)
values
    ('R-512', 'J18 Market Road',    'arterial',  'high',   1200, 3.2, 15, 'high',   'critical'),
    ('R-114', 'Old Toll Gate Road', 'collector', 'medium', 2400, 8.5, 25, 'medium', 'standard');

-- Response actions
insert into response_actions (action_id, event_id, action_type, timestamp, location, team_id, status, completion_time, effectiveness)
values
    ('A-7', 'F2026-001', 'pump_deployment', '2026-06-15 15:05:00+00', 'J18 Market Road', 'T-09', 'completed', '2026-06-15 15:45:00+00', 'medium'),
    ('A-8', 'F2026-001', 'traffic_closure', '2026-06-15 15:12:00+00', 'J18 Market Road', 'T-02', 'completed', '2026-06-15 15:15:00+00', 'high');

-- Field inspections
insert into field_inspections
    (inspection_id, work_id, drain_id, inspector_id, timestamp, latitude, longitude,
     image_before, image_after, blockage_before, blockage_after, condition_before,
     condition_after, ai_verification_score, verification_status, notes)
values
    ('I-3001', 'W-88', 'D142', 'INSP-01', '2026-06-25 11:00:00+00', 13.0827, 80.2707,
     'demo://drain/D142/before.jpg', 'demo://drain/D142/after.jpg', 71, 8, 3, 8, null, 'pending',
     'Desilting complete; flow restored.');

-- Damage reports
insert into damage_reports (damage_id, event_id, location, damage_type, severity, estimated_cost, verified)
values
    ('D-90', 'F2026-001', 'J18 Market Road', 'road_flooding', 'medium', 150000, false);

-- Seed recommendations (Permanent Fix agent adds more in Phase 8)
insert into recommendations (event_id, recommendation_type, title, description, estimated_cost, expected_risk_reduction, priority, confidence, status)
values
    ('F2026-001', 'maintenance',   'Desilt and rehabilitate drain D142',
     'Jetting, desilting, and condition repair of the 71%-blocked J18 branch drain.', 85000, 0.6, 'high', 0.8, 'recommended'),
    ('F2026-001', 'infrastructure', 'Upsize D142 branch drain to 900mm',
     'Replace 600mm branch drain with 900mm to raise capacity above observed inflow.', 420000, 0.35, 'medium', 0.6, 'proposed');