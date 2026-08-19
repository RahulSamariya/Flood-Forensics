-- ============================================================
-- F2026-001 Demo Seed Data (Phase 2)
-- ALL DATA IS DEMO/SIMULATED — NOT real government data
-- ============================================================

-- Flood Events
INSERT INTO flood_events (event_id, event_date, end_date, city, zone_id, latitude, longitude, severity, water_depth_cm, duration_minutes, affected_area_km2, affected_population, source, confidence)
VALUES
  ('F2026-001', '2026-07-15T14:00:00Z', '2026-07-15T18:30:00Z', 'Ahmedabad', 'N12', 23.0338, 72.5630, 'critical', 78, 270, 2.4, 18500, 'DEMO', 0.92),
  ('F2025-014', '2025-08-22T15:30:00Z', '2025-08-22T20:00:00Z', 'Ahmedabad', 'N12', 23.0333, 72.5643, 'high', 52, 210, 1.8, 12000, 'DEMO', 0.85),
  ('F2024-009', '2024-09-10T13:00:00Z', '2024-09-10T17:45:00Z', 'Ahmedabad', 'N12', 23.0345, 72.5618, 'medium', 35, 165, 1.2, 8000, 'DEMO', 0.78);

-- Drains
INSERT INTO drains (drain_id, latitude, longitude, drain_type, capacity_m3_s, diameter_mm, depth_m, length_m, condition_score, blockage_percent, last_cleaned, installation_year)
VALUES
  ('D140', 23.0345, 72.5616, 'primary',   8.5, 1200, 2.8, 450, 72, 15, '2026-03-10', 2008),
  ('D141', 23.0341, 72.5623, 'secondary', 4.2,  800, 2.0, 320, 45, 55, '2025-09-15', 2005),
  ('D142', 23.0338, 72.5630, 'secondary', 3.8,  800, 1.8, 280, 28, 78, '2025-06-20', 2003),
  ('D143', 23.0333, 72.5638, 'tertiary',  2.1,  600, 1.5, 200, 60, 30, '2026-01-05', 2010),
  ('D144', 23.0328, 72.5646, 'primary',  10.0, 1500, 3.2, 600, 82,  8, '2026-05-20', 2015);

-- Rainfall (F2026-001 day)
INSERT INTO rainfall (id, timestamp, station_id, latitude, longitude, rainfall_mm, duration_minutes, rainfall_intensity_mm_hr, source)
VALUES
  ('R001','2026-07-15T12:00:00Z','MET-N12',23.0338,72.5630, 2.1,60, 2.1,'DEMO'),
  ('R002','2026-07-15T13:00:00Z','MET-N12',23.0338,72.5630, 8.4,60, 8.4,'DEMO'),
  ('R003','2026-07-15T14:00:00Z','MET-N12',23.0338,72.5630,42.6,60,42.6,'DEMO'),
  ('R004','2026-07-15T14:15:00Z','MET-N12',23.0338,72.5630,18.3,15,73.2,'DEMO'),
  ('R005','2026-07-15T14:30:00Z','MET-N12',23.0338,72.5630,22.1,15,88.4,'DEMO'),
  ('R006','2026-07-15T15:00:00Z','MET-N12',23.0338,72.5630,35.8,60,35.8,'DEMO'),
  ('R007','2026-07-15T16:00:00Z','MET-N12',23.0338,72.5630,12.4,60,12.4,'DEMO'),
  ('R008','2026-07-15T17:00:00Z','MET-N12',23.0338,72.5630, 4.2,60, 4.2,'DEMO');

-- Water Levels
INSERT INTO water_levels (id, timestamp, station_id, latitude, longitude, water_level_m, danger_level_m, flow_rate_m3_s, status)
VALUES
  ('WL001','2026-07-15T13:00:00Z','WL-NALA-N12',23.0338,72.5630,1.2,3.5, 4.8,'normal'),
  ('WL002','2026-07-15T14:00:00Z','WL-NALA-N12',23.0338,72.5630,2.1,3.5,12.3,'rising'),
  ('WL003','2026-07-15T14:15:00Z','WL-NALA-N12',23.0338,72.5630,2.8,3.5,18.6,'warning'),
  ('WL004','2026-07-15T14:30:00Z','WL-NALA-N12',23.0338,72.5630,3.6,3.5,24.1,'critical'),
  ('WL005','2026-07-15T15:00:00Z','WL-NALA-N12',23.0338,72.5630,4.2,3.5,28.5,'critical'),
  ('WL006','2026-07-15T16:00:00Z','WL-NALA-N12',23.0338,72.5630,3.8,3.5,22.1,'critical'),
  ('WL007','2026-07-15T17:00:00Z','WL-NALA-N12',23.0338,72.5630,3.1,3.5,15.4,'warning'),
  ('WL008','2026-07-15T18:00:00Z','WL-NALA-N12',23.0338,72.5630,2.4,3.5, 9.2,'normal');

-- Citizen Reports
INSERT INTO citizen_reports (report_id, event_id, timestamp, latitude, longitude, description, water_depth_cm, severity, verification_status, confidence)
VALUES
  ('CR001','F2026-001','2026-07-15T14:37:00Z',23.0336,72.5628,'Knee-deep water on main road near Navrangpura Crossing. Vehicles stuck.',45,'high','verified',0.88),
  ('CR002','F2026-001','2026-07-15T14:52:00Z',23.0343,72.5643,'Water entering ground-floor shops on University Road.',60,'critical','verified',0.91),
  ('CR003','F2026-001','2026-07-15T15:10:00Z',23.0331,72.5636,'Manhole cover displaced near residential colony. Sewage overflow.',70,'critical','verified',0.85),
  ('CR004','F2026-001','2026-07-15T15:45:00Z',23.0353,72.5613,'Power cut in sector. Basement flooding in apartment block.',55,'high','unverified',0.72);

-- Maintenance Records
INSERT INTO maintenance_records (work_id, drain_id, reported_date, scheduled_date, completed_date, issue_type, issue_description, action_taken, status, reported_blockage_percent, completion_blockage_percent, verification_status)
VALUES
  ('MW001','D142','2026-04-10','2026-05-15',NULL,'blockage','Heavy silt and construction debris accumulation',NULL,'overdue',65,NULL,'unverified'),
  ('MW002','D141','2026-02-20','2026-03-15','2026-03-18','partial_blockage','Plastic waste and vegetation clogging','Mechanical desilting and debris removal','completed',40,20,'verified'),
  ('MW003','D142','2026-06-28','2026-07-20',NULL,'blockage','Re-blockage — silt with encroachment debris',NULL,'pending',78,NULL,'unverified');

-- Roads
INSERT INTO roads (road_id, name, road_type, importance, length_m, elevation, flood_threshold_cm, traffic_level, criticality)
VALUES
  ('RD001','C.G. Road','arterial','critical',2200,48.5,30,'very_high','critical'),
  ('RD002','University Road','collector','high',800,47.8,25,'high','high'),
  ('RD003','Navrangpura Road','local','medium',350,46.2,15,'medium','medium'),
  ('RD004','Ashram Road','collector','high',1100,49.0,35,'high','high');

-- Response Actions
INSERT INTO response_actions (action_id, event_id, action_type, timestamp, location, team_id, status, completion_time, effectiveness)
VALUES
  ('RA001','F2026-001','pump_deployment','2026-07-15T15:05:00Z','Navrangpura Crossing','AMC-TEAM-07','completed','2026-07-15T17:30:00Z',0.72),
  ('RA002','F2026-001','traffic_diversion','2026-07-15T14:45:00Z','Income Tax Underpass','TRAFFIC-TEAM-02','completed','2026-07-15T18:00:00Z',0.85),
  ('RA003','F2026-001','emergency_desilting','2026-07-15T15:20:00Z','Drain D142 Entry Point','MAINT-TEAM-12','completed','2026-07-15T17:45:00Z',0.60),
  ('RA004','F2026-001','citizen_alert','2026-07-15T14:35:00Z','Zone N12 Broadcast','COMM-TEAM-01','completed','2026-07-15T14:40:00Z',0.90);

-- Recommendations
INSERT INTO recommendations (id, event_id, recommendation_type, title, description, estimated_cost, expected_risk_reduction, priority, confidence, status)
VALUES
  ('REC001','F2026-001','permanent','Complete Desilting & Relining of Drain D142','Full mechanical desilting with CCTV inspection followed by structural relining.',3500000,0.65,'critical',0.88,'proposed'),
  ('REC002','F2026-001','permanent','Upgrade D141–D142 Junction Capacity','Replace 800mm secondary drain with 1200mm pipe.',8200000,0.45,'high',0.82,'proposed'),
  ('REC003','F2026-001','immediate','Install Anti-Encroachment Barriers at D142','Concrete barriers to prevent construction debris dumping.',450000,0.30,'high',0.91,'proposed'),
  ('REC004','F2026-001','permanent','Stormwater Retention Basin at Navrangpura Low Point','Underground retention basin (5000 m³) to buffer peak rainfall.',25000000,0.55,'medium',0.75,'under_review');
