"""In-memory demo dataset loaded from CSV files in data/.

All data is clearly marked as DEMO/SIMULATED.
"""

import csv
import os
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data"


def _load_csv(subdir: str, filename: str) -> list[dict]:
    """Load a CSV file from data/{subdir}/{filename} into a list of dicts."""
    filepath = DATA_DIR / subdir / filename
    if not filepath.exists():
        return []
    with open(filepath, encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        rows: list[dict] = []
        for row in reader:
            cleaned: dict = {}
            for k, v in row.items():
                if v == "":
                    cleaned[k] = None
                else:
                    # Try to parse numeric values
                    try:
                        if "." in v:
                            cleaned[k] = float(v)
                        else:
                            cleaned[k] = int(v)
                    except (ValueError, TypeError):
                        cleaned[k] = v
            rows.append(cleaned)
        return rows


# ---------------------------------------------------------------------------
# Load all datasets from CSV
# ---------------------------------------------------------------------------

FLOOD_EVENTS = _load_csv("flood_events", "flood_events.csv")
RAINFALL = _load_csv("rainfall", "rainfall.csv")
WATER_LEVELS = _load_csv("water_levels", "water_levels.csv")
DRAINS = _load_csv("drains", "drains.csv")
MAINTENANCE_RECORDS = _load_csv("maintenance", "maintenance_records.csv")
CITIZEN_REPORTS = _load_csv("citizen_reports", "citizen_reports.csv")
FIELD_INSPECTIONS = _load_csv("field_inspections", "field_inspections.csv")

# These don't have CSVs yet — defined inline
DRAIN_CONNECTIONS = [
    {"connection_id": "DC001", "from_drain_id": "D140", "to_drain_id": "D141", "flow_direction": "south", "distance_m": 85, "capacity_m3_s": 4.2},
    {"connection_id": "DC002", "from_drain_id": "D141", "to_drain_id": "D142", "flow_direction": "south-east", "distance_m": 72, "capacity_m3_s": 3.8},
    {"connection_id": "DC003", "from_drain_id": "D142", "to_drain_id": "D143", "flow_direction": "south", "distance_m": 95, "capacity_m3_s": 2.1},
    {"connection_id": "DC004", "from_drain_id": "D143", "to_drain_id": "D144", "flow_direction": "south-east", "distance_m": 110, "capacity_m3_s": 2.1},
]

ROADS = [
    {"road_id": "RD001", "name": "C.G. Road", "road_type": "arterial", "importance": "critical", "length_m": 2200, "elevation": 48.5, "flood_threshold_cm": 30, "traffic_level": "very_high", "criticality": "critical"},
    {"road_id": "RD002", "name": "University Road", "road_type": "collector", "importance": "high", "length_m": 800, "elevation": 47.8, "flood_threshold_cm": 25, "traffic_level": "high", "criticality": "high"},
    {"road_id": "RD003", "name": "Navrangpura Road", "road_type": "local", "importance": "medium", "length_m": 350, "elevation": 46.2, "flood_threshold_cm": 15, "traffic_level": "medium", "criticality": "medium"},
    {"road_id": "RD004", "name": "Ashram Road", "road_type": "collector", "importance": "high", "length_m": 1100, "elevation": 49.0, "flood_threshold_cm": 35, "traffic_level": "high", "criticality": "high"},
]

RESPONSE_ACTIONS = [
    {"action_id": "RA001", "event_id": "F2026-001", "action_type": "pump_deployment", "timestamp": "2026-07-15T15:05:00Z", "location": "Navrangpura Crossing", "team_id": "AMC-TEAM-07", "status": "completed", "completion_time": "2026-07-15T17:30:00Z", "effectiveness": 0.72},
    {"action_id": "RA002", "event_id": "F2026-001", "action_type": "traffic_diversion", "timestamp": "2026-07-15T14:45:00Z", "location": "Income Tax Underpass", "team_id": "TRAFFIC-TEAM-02", "status": "completed", "completion_time": "2026-07-15T18:00:00Z", "effectiveness": 0.85},
    {"action_id": "RA003", "event_id": "F2026-001", "action_type": "emergency_desilting", "timestamp": "2026-07-15T15:20:00Z", "location": "Drain D142 Entry Point", "team_id": "MAINT-TEAM-12", "status": "completed", "completion_time": "2026-07-15T17:45:00Z", "effectiveness": 0.60},
    {"action_id": "RA004", "event_id": "F2026-001", "action_type": "citizen_alert", "timestamp": "2026-07-15T14:35:00Z", "location": "Zone N12 Broadcast", "team_id": "COMM-TEAM-01", "status": "completed", "completion_time": "2026-07-15T14:40:00Z", "effectiveness": 0.90},
]

DAMAGE_REPORTS = [
    {"damage_id": "DMG001", "event_id": "F2026-001", "location": "Navrangpura Market", "damage_type": "commercial_property", "severity": "high", "estimated_cost": 2500000, "image_url": None, "verified": True},
    {"damage_id": "DMG002", "event_id": "F2026-001", "location": "Navrangpura Extension", "damage_type": "residential_basement", "severity": "critical", "estimated_cost": 1800000, "image_url": None, "verified": True},
    {"damage_id": "DMG003", "event_id": "F2026-001", "location": "Income Tax Underpass", "damage_type": "road_infrastructure", "severity": "high", "estimated_cost": 4200000, "image_url": None, "verified": True},
    {"damage_id": "DMG004", "event_id": "F2026-001", "location": "Ellisbridge Border", "damage_type": "electrical_infrastructure", "severity": "medium", "estimated_cost": 850000, "image_url": None, "verified": False},
]

RECOMMENDATIONS = [
    {"id": "REC001", "event_id": "F2026-001", "recommendation_type": "permanent", "title": "Complete Desilting & Relining of Drain D142", "description": "Full mechanical desilting with CCTV inspection followed by structural relining. D142 is the primary bottleneck with 78% blockage causing upstream backup into Zone N12.", "estimated_cost": 3500000, "expected_risk_reduction": 0.65, "priority": "critical", "confidence": 0.88, "status": "proposed"},
    {"id": "REC002", "event_id": "F2026-001", "recommendation_type": "permanent", "title": "Upgrade D141-D142 Junction Capacity", "description": "Replace 800mm secondary drain section with 1200mm pipe. Current capacity (3.8 m³/s) insufficient for peak flows exceeding 24 m³/s.", "estimated_cost": 8200000, "expected_risk_reduction": 0.45, "priority": "high", "confidence": 0.82, "status": "proposed"},
    {"id": "REC003", "event_id": "F2026-001", "recommendation_type": "immediate", "title": "Install Anti-Encroachment Barriers at D142", "description": "Concrete barriers to prevent construction debris dumping into drain entry points.", "estimated_cost": 450000, "expected_risk_reduction": 0.30, "priority": "high", "confidence": 0.91, "status": "proposed"},
    {"id": "REC004", "event_id": "F2026-001", "recommendation_type": "permanent", "title": "Stormwater Retention Basin at Navrangpura Low Point", "description": "Underground retention basin (5000 m³ capacity) to buffer peak rainfall and reduce downstream surge.", "estimated_cost": 25000000, "expected_risk_reduction": 0.55, "priority": "medium", "confidence": 0.75, "status": "under_review"},
]


# ---------------------------------------------------------------------------
# Query helpers
# ---------------------------------------------------------------------------

def get_event(event_id: str) -> dict | None:
    for event in FLOOD_EVENTS:
        if event["event_id"] == event_id:
            return event
    return None


def get_rainfall_for_event(event_id: str) -> list[dict]:
    return RAINFALL


def get_water_levels_for_event(event_id: str) -> list[dict]:
    return WATER_LEVELS


def get_citizen_reports_for_event(event_id: str) -> list[dict]:
    return [r for r in CITIZEN_REPORTS if r.get("event_id") == event_id]


def get_response_actions_for_event(event_id: str) -> list[dict]:
    return [a for a in RESPONSE_ACTIONS if a["event_id"] == event_id]


def get_drains_near_event(event_id: str) -> list[dict]:
    return DRAINS


def get_maintenance_for_drain(drain_id: str) -> list[dict]:
    return [m for m in MAINTENANCE_RECORDS if m.get("drain_id") == drain_id]


def get_recommendations_for_event(event_id: str) -> list[dict]:
    return [r for r in RECOMMENDATIONS if r["event_id"] == event_id]


def get_field_inspections_for_event(event_id: str) -> list[dict]:
    return FIELD_INSPECTIONS


def get_damage_reports_for_event(event_id: str) -> list[dict]:
    return [d for d in DAMAGE_REPORTS if d["event_id"] == event_id]
