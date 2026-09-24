"""
Test script for Step 3: Monotonic Constraints on GBDT & Audit of all 4 models.
"""
import sys
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, HistGradientBoostingClassifier
from sklearn.metrics import (
    precision_score, recall_score, f1_score, roc_auc_score,
    average_precision_score, brier_score_loss, confusion_matrix
)

sys.path.insert(0, r'c:\North eastern region logistics')
from backend.app.ai.model_trainer import generate_corridor_grounded_dataset

def test_monotonicity():
    df = generate_corridor_grounded_dataset(1800)
    feature_cols = [
        'rain_24h_mm', 'rain_3d_mm', 'rain_7d_mm', 'slope_deg',
        'elevation_m', 'gsi_susceptibility', 'historical_event_count', 'recent_field_incidents'
    ]
    
    train_mask = df['year'] <= 2022
    val_mask = (df['year'] >= 2023) & (df['year'] <= 2024)
    test_mask = df['year'] >= 2025
    
    X_train = df.loc[train_mask, feature_cols]
    y_train = df.loc[train_mask, 'target_disrupted']
    X_test = df.loc[test_mask, feature_cols]
    y_test = df.loc[test_mask, 'target_disrupted']
    
    # 1. Check Logistic Regression coefficients
    lr = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)
    lr.fit(X_train, y_train)
    print("Logistic Regression Coefficients:")
    for col, coef in zip(feature_cols, lr.coef_[0]):
        print(f"  {col:25s}: {coef:+.5f}")
        
    # 2. Unconstrained GBDT (standard GradientBoostingClassifier)
    gbdt_unconstrained = GradientBoostingClassifier(n_estimators=120, learning_rate=0.08, max_depth=4, random_state=42)
    gbdt_unconstrained.fit(X_train, y_train)
    
    # 3. Monotonic GBDT (HistGradientBoostingClassifier with monotonic_cst)
    monotonic_cst = [1, 1, 1, 1, 0, 1, 1, 1]
    gbdt_monotonic = HistGradientBoostingClassifier(
        monotonic_cst=monotonic_cst,
        max_iter=120,
        learning_rate=0.08,
        max_depth=4,
        random_state=42
    )
    gbdt_monotonic.fit(X_train, y_train)
    
    # Evaluate on held-out test set
    def eval_model(m, X, y, is_rule=False):
        if is_rule:
            prob = (
                (X['rain_24h_mm'] > 75.0).astype(float) * 0.40 +
                (X['slope_deg'] > 33.0).astype(float) * 0.30 +
                (X['gsi_susceptibility'] >= 3).astype(float) * 0.30
            )
            pred = (prob >= 0.50).astype(int)
        else:
            prob = m.predict_proba(X)[:, 1]
            pred = (prob >= 0.50).astype(int)
        tn, fp, fn, tp = confusion_matrix(y, pred).ravel()
        return {
            "precision": round(float(precision_score(y, pred, zero_division=0)), 3),
            "recall": round(float(recall_score(y, pred, zero_division=0)), 3),
            "f1": round(float(f1_score(y, pred, zero_division=0)), 3),
            "pr_auc": round(float(average_precision_score(y, prob)), 3),
            "roc_auc": round(float(roc_auc_score(y, prob)), 3),
            "brier": round(float(brier_score_loss(y, prob)), 3),
            "cm": f"TN={tn}, FP={fp}, FN={fn}, TP={tp}"
        }

    print("\n--- HELD-OUT TEMPORAL TEST EVALUATION ---")
    print("Unconstrained GBDT:", eval_model(gbdt_unconstrained, X_test, y_test))
    print("Monotonic GBDT:    ", eval_model(gbdt_monotonic, X_test, y_test))
    
    # Monotonicity test across synthetic base scenarios
    base_scenarios = [
        {"name": "Low-Risk Valley", "rain_24h_mm": 15.0, "rain_3d_mm": 30.0, "rain_7d_mm": 50.0, "slope_deg": 18.0, "elevation_m": 800.0, "gsi_susceptibility": 1, "historical_event_count": 2, "recent_field_incidents": 0},
        {"name": "Medium-Risk Highway", "rain_24h_mm": 45.0, "rain_3d_mm": 80.0, "rain_7d_mm": 130.0, "slope_deg": 28.0, "elevation_m": 1400.0, "gsi_susceptibility": 2, "historical_event_count": 6, "recent_field_incidents": 0},
        {"name": "High-Risk Gorge", "rain_24h_mm": 90.0, "rain_3d_mm": 170.0, "rain_7d_mm": 260.0, "slope_deg": 38.0, "elevation_m": 1700.0, "gsi_susceptibility": 3, "historical_event_count": 16, "recent_field_incidents": 1}
    ]
    
    test_ranges = {
        "rain_24h_mm": np.linspace(0, 250, 50),
        "rain_3d_mm": np.linspace(0, 500, 50),
        "rain_7d_mm": np.linspace(0, 800, 50),
        "slope_deg": np.linspace(15, 50, 50),
        "gsi_susceptibility": [1, 2, 3, 4],
        "historical_event_count": list(range(0, 30)),
        "recent_field_incidents": [0, 1, 2, 3],
        "elevation_m": np.linspace(400, 2400, 50)
    }
    
    print("\n--- MONOTONICITY VIOLATION CHECKS ---")
    for model_label, model in [("Unconstrained GBDT", gbdt_unconstrained), ("Monotonic GBDT", gbdt_monotonic), ("Logistic Regression", lr)]:
        print(f"\nModel: {model_label}")
        for feat, sweep_vals in test_ranges.items():
            violations = 0
            total_checks = 0
            for base in base_scenarios:
                test_df = pd.DataFrame([base] * len(sweep_vals))
                test_df[feat] = sweep_vals
                probs = model.predict_proba(test_df[feature_cols])[:, 1]
                diffs = np.diff(probs)
                
                # Check for strictly non-decreasing (allowing tolerance of -1e-6 for float precision)
                if feat != "elevation_m":
                    v = np.sum(diffs < -1e-6)
                    violations += v
                total_checks += len(diffs)
            
            status = "PASS (0 violations)" if violations == 0 else f"VIOLATIONS: {violations}/{total_checks}"
            if feat == "elevation_m":
                status = f"UNCONSTRAINED (Verified {total_checks} points)"
            print(f"  {feat:25s}: {status}")

if __name__ == '__main__':
    test_monotonicity()
