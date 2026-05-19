import json
import copy
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Scan, User

router = APIRouter(prefix="/api", tags=["users"])


class ScanSummaryOut(BaseModel):
    id: int
    created_at: str
    severity: str
    confidence: float
    regions_detected: int
    processed: int
    primary_concern: str

    class Config:
        from_attributes = True


class ScanDetailOut(ScanSummaryOut):
    result: dict[str, Any]


class AnalyticsOut(BaseModel):
    total_scans: int
    average_confidence: float
    most_common_condition: str | None
    condition_counts: dict[str, int]
    severity_counts: dict[str, int]
    confidence_by_month: list[dict[str, Any]]


def strip_heavy_images(result: dict) -> dict:
    """Remove large base64 blobs before persisting."""
    data = copy.deepcopy(result)
    for key in ("face_image", "heatmap"):
        data.pop(key, None)
    for region in data.get("regions", []):
        region.pop("region_image", None)
    return data


def save_user_scan(db: Session, user_id: int, result: dict) -> Scan:
    overall = result.get("overall", {})
    primary = overall.get("primary_concern", "Normal")
    stored = strip_heavy_images(result)
    scan = Scan(
        user_id=user_id,
        severity=result.get("severity", "Low"),
        confidence=float(result.get("confidence", 0)),
        regions_detected=int(result.get("regions_detected", 0)),
        processed=int(result.get("processed", 0)),
        primary_concern=primary,
        result_json=json.dumps(stored),
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    return scan


def scan_to_summary(scan: Scan) -> ScanSummaryOut:
    return ScanSummaryOut(
        id=scan.id,
        created_at=scan.created_at.isoformat() if scan.created_at else "",
        severity=scan.severity,
        confidence=scan.confidence,
        regions_detected=scan.regions_detected,
        processed=scan.processed,
        primary_concern=scan.primary_concern,
    )


@router.get("/scans", response_model=list[ScanSummaryOut])
def list_scans(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    scans = db.query(Scan).filter(Scan.user_id == user.id).order_by(Scan.created_at.desc()).all()
    return [scan_to_summary(s) for s in scans]


@router.get("/scans/{scan_id}", response_model=ScanDetailOut)
def get_scan(
    scan_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return ScanDetailOut(
        **scan_to_summary(scan).model_dump(),
        result=json.loads(scan.result_json),
    )


@router.delete("/scans/{scan_id}")
def delete_scan(
    scan_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    db.delete(scan)
    db.commit()
    return {"ok": True}


@router.get("/analytics", response_model=AnalyticsOut)
def get_analytics(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    scans = db.query(Scan).filter(Scan.user_id == user.id).all()
    total = len(scans)

    if total == 0:
        return AnalyticsOut(
            total_scans=0,
            average_confidence=0.0,
            most_common_condition=None,
            condition_counts={"Acne": 0, "Redness": 0, "Pigmentation": 0, "Normal": 0},
            severity_counts={"Low": 0, "Medium": 0, "High": 0},
            confidence_by_month=[],
        )

    avg_conf = sum(s.confidence for s in scans) / total

    condition_counts: dict[str, int] = {"Acne": 0, "Redness": 0, "Pigmentation": 0, "Normal": 0}
    severity_counts: dict[str, int] = {"Low": 0, "Medium": 0, "High": 0}
    month_buckets: dict[str, list[float]] = {}

    for scan in scans:
        concern = scan.primary_concern or "Normal"
        if concern not in condition_counts:
            condition_counts[concern] = 0
        condition_counts[concern] += 1

        sev = scan.severity if scan.severity in severity_counts else "Low"
        severity_counts[sev] += 1

        if scan.created_at:
            key = scan.created_at.strftime("%Y-%m")
            month_buckets.setdefault(key, []).append(scan.confidence)

    non_zero = {k: v for k, v in condition_counts.items() if v > 0 and k != "Normal"}
    if non_zero:
        most_common = max(non_zero, key=non_zero.get)  # type: ignore
    elif condition_counts.get("Normal", 0) > 0:
        most_common = "Normal"
    else:
        most_common = max(condition_counts, key=condition_counts.get)  # type: ignore

    confidence_by_month = [
        {"month": month, "average": round(sum(vals) / len(vals), 4)}
        for month, vals in sorted(month_buckets.items())
    ]

    return AnalyticsOut(
        total_scans=total,
        average_confidence=round(avg_conf, 4),
        most_common_condition=most_common,
        condition_counts=condition_counts,
        severity_counts=severity_counts,
        confidence_by_month=confidence_by_month,
    )
