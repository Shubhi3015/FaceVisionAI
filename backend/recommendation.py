import os
import pandas as pd

# ---------------- LOAD EXCEL ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EXCEL_PATH = os.path.join(BASE_DIR, "Medicated_Redness_Pigmentation_Product_list.xlsx")

try:
    df = pd.read_excel(EXCEL_PATH)
except Exception as e:
    print("Error loading Excel file:", e)
    df = pd.DataFrame()

# Clean column names (remove hidden spaces)
df.columns = df.columns.map(lambda col: str(col).strip())

# Confirmed column names from the Excel sheet
PRIMARY_COL = "Primary Concern"
SEVERITY_COL = "Recommended Severity"
URL_COL = "Product URL"

# Severity ranking used for fallback matching
SEVERITY_ORDER = ["Mild", "Moderate", "Severe"]


# ---------------- SEVERITY LOGIC ----------------
def get_severity(percent: float) -> str:
    """Map a confidence/percent score to a named severity tier."""
    if percent <= 20:
        return "No Significant Issue"
    if percent <= 40:
        return "Mild"
    if percent <= 70:
        return "Moderate"
    return "Severe"


def _severity_rank(severity_cell: str) -> int:
    """Return the *lowest* severity rank present in a cell value.

    e.g. "Mild/Moderate" -> 0 (Mild), "Moderate/Severe" -> 1 (Moderate)

    Unknown values return 99 (pushed to end when sorting).
    """
    s = str(severity_cell)
    for i, label in enumerate(SEVERITY_ORDER):
        if label.lower() in s.lower():
            return i
    return 99


# ---------------- RECOMMENDATION FUNCTION ----------------
def recommend_product(issue: str, percent: float):
    """Return (product_dict | None, severity_string).

    Matching strategy:
      1) Filter rows by Primary Concern (case-insensitive contains)
      2) Try exact severity match (e.g. 'Moderate' hits 'Moderate/Severe')
      3) If no exact match, fall back to the closest severity rank in the
         filtered set so callers always receive a useful recommendation.
    """
    severity = get_severity(percent)

    if df.empty:
        return None, severity

    # No product needed for normal/no-significant-issue
    if str(issue).strip().lower() == "normal" or severity == "No Significant Issue":
        return None, severity

    # Guard: required columns must exist
    for col in (PRIMARY_COL, SEVERITY_COL, URL_COL):
        if col not in df.columns:
            print(
                f"[recommend_product] Missing column: {col!r}. Available: {df.columns.tolist()}"
            )
            return None, severity

    # Step 1: filter by issue
    issue_norm = str(issue).strip().lower()

    def _contains_issue(cell: object) -> bool:
        if cell is None:
            return False
        return issue_norm in str(cell).strip().lower()

    filtered = df[df[PRIMARY_COL].map(_contains_issue)].copy()
    if filtered.empty:
        return None, severity

    # Step 2: try severity match (token matching to handle 'Moderate/Severe')
    sev_norm = str(severity).strip().lower()

    def _severity_matches(cell: object) -> bool:
        if cell is None:
            return False
        return sev_norm in str(cell).strip().lower()

    exact = filtered[filtered[SEVERITY_COL].map(_severity_matches)]

    if not exact.empty:
        product = exact.iloc[0]
    else:
        # Step 3: closest-severity fallback
        target_rank = (
            SEVERITY_ORDER.index(severity) if severity in SEVERITY_ORDER else 1
        )

        filtered = filtered.copy()
        filtered["_rank"] = filtered[SEVERITY_COL].astype(str).apply(_severity_rank)
        filtered["_dist"] = (filtered["_rank"] - target_rank).abs()
        product = filtered.sort_values("_dist").iloc[0]

    return (
        {
            "Product Name": product.get("Product Name", "N/A"),
            "Company": product.get("Company", "N/A"),
            "Medication Type": product.get("Medication Type", "N/A"),
            "URL": product.get(URL_COL, "#"),
        },
        severity,
    )

