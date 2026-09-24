"""
Compare Step 2 (Unconstrained) vs Step 3 (Monotonic GBDT) across Leave-One-Corridor-Out (LOCO) spatial folds.
"""
import sys, numpy as np, pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, HistGradientBoostingClassifier
from sklearn.metrics import (
    precision_score, recall_score, f1_score, roc_auc_score,
    average_precision_score, brier_score_loss, confusion_matrix
)

sys.path.insert(0, r'c:\North eastern region logistics')
from backend.app.ai.model_trainer import generate_corridor_grounded_dataset

def run_loco_comparison():
    df = generate_corridor_grounded_dataset(1800)
    feature_cols = [
        'rain_24h_mm', 'rain_3d_mm', 'rain_7d_mm', 'slope_deg',
        'elevation_m', 'gsi_susceptibility', 'historical_event_count', 'recent_field_incidents'
    ]
    unique_corridors = sorted(df['corridor'].unique().tolist())
    monotonic_cst = [1, 1, 1, 1, 0, 1, 1, 1]
    
    models = {
        "Rule_Based_Baseline": lambda: None,
        "Logistic_Regression": lambda: LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42),
        "Random_Forest": lambda: RandomForestClassifier(n_estimators=100, max_depth=6, class_weight='balanced', random_state=42),
        "Unconstrained_GBDT": lambda: GradientBoostingClassifier(n_estimators=120, learning_rate=0.08, max_depth=4, random_state=42),
        "Monotonic_GBDT": lambda: HistGradientBoostingClassifier(monotonic_cst=monotonic_cst, max_iter=120, learning_rate=0.08, max_depth=4, random_state=42)
    }
    
    results = {m: [] for m in models}
    pooled_preds = {m: {"y_true": [], "y_pred": [], "y_prob": []} for m in models}
    
    for fold_idx, held_out_corridor in enumerate(unique_corridors, 1):
        train_mask = df['corridor'] != held_out_corridor
        test_mask = df['corridor'] == held_out_corridor
        
        X_train, y_train = df.loc[train_mask, feature_cols], df.loc[train_mask, 'target_disrupted']
        X_test, y_test = df.loc[test_mask, feature_cols], df.loc[test_mask, 'target_disrupted']
        
        for m_name, init_fn in models.items():
            if m_name == "Rule_Based_Baseline":
                prob = (
                    (X_test['rain_24h_mm'] > 75.0).astype(float) * 0.40 +
                    (X_test['slope_deg'] > 33.0).astype(float) * 0.30 +
                    (X_test['gsi_susceptibility'] >= 3).astype(float) * 0.30
                )
                pred = (prob >= 0.50).astype(int)
            else:
                m = init_fn()
                m.fit(X_train, y_train)
                prob = m.predict_proba(X_test)[:, 1]
                pred = (prob >= 0.50).astype(int)
                
            pooled_preds[m_name]["y_true"].extend(y_test.tolist())
            pooled_preds[m_name]["y_pred"].extend(pred.tolist())
            pooled_preds[m_name]["y_prob"].extend(prob.tolist())
            
            prauc = round(float(average_precision_score(y_test, prob)), 3)
            rocauc = round(float(roc_auc_score(y_test, prob)), 3)
            f1 = round(float(f1_score(y_test, pred, zero_division=0)), 3)
            rec = round(float(recall_score(y_test, pred, zero_division=0)), 3)
            prec = round(float(precision_score(y_test, pred, zero_division=0)), 3)
            brier = round(float(brier_score_loss(y_test, prob)), 3)
            
            results[m_name].append({
                "corridor": held_out_corridor,
                "precision": prec, "recall": rec, "f1": f1,
                "pr_auc": prauc, "roc_auc": rocauc, "brier": brier
            })

    print("================== LOCO SPATIAL MACRO-AVERAGES ==================")
    print(f"{'Model':25s} | {'PR-AUC':7s} | {'ROC-AUC':7s} | {'F1':7s} | {'Recall':7s} | {'Precision':9s} | {'Brier':7s}")
    print("-" * 85)
    for m_name in models:
        prauc_mean = np.mean([r["pr_auc"] for r in results[m_name]])
        rocauc_mean = np.mean([r["roc_auc"] for r in results[m_name]])
        f1_mean = np.mean([r["f1"] for r in results[m_name]])
        rec_mean = np.mean([r["recall"] for r in results[m_name]])
        prec_mean = np.mean([r["precision"] for r in results[m_name]])
        brier_mean = np.mean([r["brier"] for r in results[m_name]])
        print(f"{m_name:25s} | {prauc_mean:7.3f} | {rocauc_mean:7.3f} | {f1_mean:7.3f} | {rec_mean:7.3f} | {prec_mean:9.3f} | {brier_mean:7.3f}")

    print("\n================== CORRIDOR-BY-CORRIDOR: UNCONSTRAINED GBDT vs MONOTONIC GBDT ==================")
    print(f"{'Held-Out Corridor':38s} | {'Unconstr PR-AUC':15s} | {'Monotonic PR-AUC':16s} | {'PR-AUC Change':13s} | {'Unconstr Brier':14s} | {'Monotonic Brier':15s}")
    print("-" * 125)
    for i, c in enumerate(unique_corridors):
        u_r = results["Unconstrained_GBDT"][i]
        m_r = results["Monotonic_GBDT"][i]
        diff_p = m_r["pr_auc"] - u_r["pr_auc"]
        print(f"{c:38s} | {u_r['pr_auc']:15.3f} | {m_r['pr_auc']:16.3f} | {diff_p:+13.3f} | {u_r['brier']:14.3f} | {m_r['brier']:15.3f}")

if __name__ == '__main__':
    run_loco_comparison()
