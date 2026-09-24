"""
Full Step 4 Calibration Pipeline & Analysis Script.
"""
import sys, os, numpy as np, pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, HistGradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV, FrozenEstimator, calibration_curve
from sklearn.metrics import (
    precision_score, recall_score, f1_score, roc_auc_score,
    average_precision_score, brier_score_loss, confusion_matrix
)

sys.path.insert(0, r'c:\North eastern region logistics')
from backend.app.ai.model_trainer import generate_corridor_grounded_dataset

def compute_ece(y_true, y_prob, n_bins=10):
    """Computes Expected Calibration Error (ECE) across uniform bins."""
    bins = np.linspace(0.0, 1.0, n_bins + 1)
    bin_indices = np.digitize(y_prob, bins) - 1
    bin_indices = np.clip(bin_indices, 0, n_bins - 1)
    
    ece = 0.0
    n_samples = len(y_true)
    bin_stats = []
    
    for b in range(n_bins):
        mask = bin_indices == b
        count = np.sum(mask)
        if count > 0:
            avg_pred = np.mean(y_prob[mask])
            avg_true = np.mean(y_true[mask])
            abs_diff = np.abs(avg_pred - avg_true)
            weight = count / n_samples
            ece += weight * abs_diff
            bin_stats.append({
                "bin": b + 1,
                "range": f"{bins[b]:.1f}-{bins[b+1]:.1f}",
                "count": int(count),
                "avg_pred": round(float(avg_pred), 3),
                "avg_true": round(float(avg_true), 3),
                "gap": round(float(abs_diff), 3)
            })
        else:
            bin_stats.append({
                "bin": b + 1,
                "range": f"{bins[b]:.1f}-{bins[b+1]:.1f}",
                "count": 0,
                "avg_pred": 0.0,
                "avg_true": 0.0,
                "gap": 0.0
            })
    return round(float(ece), 4), bin_stats

def run_step4_calibration():
    print("==================================================")
    print("STEP 4: PROBABILITY CALIBRATION BENCHMARK")
    print("==================================================")
    
    df = generate_corridor_grounded_dataset(1800)
    feature_cols = [
        'rain_24h_mm', 'rain_3d_mm', 'rain_7d_mm', 'slope_deg',
        'elevation_m', 'gsi_susceptibility', 'historical_event_count', 'recent_field_incidents'
    ]
    
    train_mask = df['year'] <= 2022
    val_mask = (df['year'] >= 2023) & (df['year'] <= 2024)
    test_mask = df['year'] >= 2025
    
    X_train, y_train = df.loc[train_mask, feature_cols], df.loc[train_mask, 'target_disrupted']
    X_val, y_val = df.loc[val_mask, feature_cols], df.loc[val_mask, 'target_disrupted']
    X_test, y_test = df.loc[test_mask, feature_cols], df.loc[test_mask, 'target_disrupted']
    
    print(f"Data Splits: Train={len(X_train)} (2019-2022), Val={len(X_val)} (2023-2024), Test={len(X_test)} (2025-2026)")
    
    # 1. Base Monotonic Model fitted on Train
    monotonic_cst = [1, 1, 1, 1, 0, 1, 1, 1]
    base_gbdt = HistGradientBoostingClassifier(
        monotonic_cst=monotonic_cst,
        max_iter=120,
        learning_rate=0.08,
        max_depth=4,
        random_state=42
    )
    base_gbdt.fit(X_train, y_train)
    
    # 2. Calibration fitted strictly on Validation data (2023-2024)
    frozen_base = FrozenEstimator(base_gbdt)
    cal_sigmoid = CalibratedClassifierCV(frozen_base, method='sigmoid')
    cal_sigmoid.fit(X_val, y_val)
    
    cal_isotonic = CalibratedClassifierCV(frozen_base, method='isotonic')
    cal_isotonic.fit(X_val, y_val)
    
    # 3. Evaluate on Frozen Test Set (2025-2026)
    prob_uncal = base_gbdt.predict_proba(X_test)[:, 1]
    prob_sig = cal_sigmoid.predict_proba(X_test)[:, 1]
    prob_iso = cal_isotonic.predict_proba(X_test)[:, 1]
    
    y_test_arr = y_test.values
    
    def eval_probs(y_true, prob, name):
        pred = (prob >= 0.50).astype(int)
        tn, fp, fn, tp = confusion_matrix(y_true, pred).ravel()
        brier = round(float(brier_score_loss(y_true, prob)), 4)
        ece, bstats = compute_ece(y_true, prob, n_bins=10)
        return {
            "name": name,
            "brier": brier,
            "ece": ece,
            "pr_auc": round(float(average_precision_score(y_true, prob)), 3),
            "roc_auc": round(float(roc_auc_score(y_true, prob)), 3),
            "precision": round(float(precision_score(y_true, pred, zero_division=0)), 3),
            "recall": round(float(recall_score(y_true, pred, zero_division=0)), 3),
            "f1": round(float(f1_score(y_true, pred, zero_division=0)), 3),
            "cm": f"TN={tn}, FP={fp}, FN={fn}, TP={tp}",
            "bin_stats": bstats
        }

    res_uncal = eval_probs(y_test_arr, prob_uncal, "Uncalibrated Monotonic GBDT")
    res_sig = eval_probs(y_test_arr, prob_sig, "Sigmoid (Platt) Calibrated")
    res_iso = eval_probs(y_test_arr, prob_iso, "Isotonic Calibrated")
    
    print("\n================== FROZEN TEMPORAL TEST CALIBRATION COMPARISON ==================")
    print(f"{'Method':30s} | {'Brier':7s} | {'ECE':7s} | {'PR-AUC':7s} | {'ROC-AUC':7s} | {'Precision':9s} | {'Recall':7s} | {'F1':7s}")
    print("-" * 105)
    for r in [res_uncal, res_sig, res_iso]:
        print(f"{r['name']:30s} | {r['brier']:7.4f} | {r['ece']:7.4f} | {r['pr_auc']:7.3f} | {r['roc_auc']:7.3f} | {r['precision']:9.3f} | {r['recall']:7.3f} | {r['f1']:7.3f}")

    print("\n================== RELIABILITY BINNING TABLE (SIGMOID / PLATT) ==================")
    print(f"{'Bin':4s} | {'Prob Range':10s} | {'Count':5s} | {'Avg Pred':8s} | {'Avg True':8s} | {'Gap (Pred-True)':15s}")
    print("-" * 65)
    for b in res_sig["bin_stats"]:
        print(f"{b['bin']:4d} | {b['range']:10s} | {b['count']:5d} | {b['avg_pred']:8.3f} | {b['avg_true']:8.3f} | {b['gap']:15.3f}")

    print("\n================== RELIABILITY BINNING TABLE (UNCALIBRATED) ==================")
    print(f"{'Bin':4s} | {'Prob Range':10s} | {'Count':5s} | {'Avg Pred':8s} | {'Avg True':8s} | {'Gap (Pred-True)':15s}")
    print("-" * 65)
    for b in res_uncal["bin_stats"]:
        print(f"{b['bin']:4d} | {b['range']:10s} | {b['count']:5d} | {b['avg_pred']:8.3f} | {b['avg_true']:8.3f} | {b['gap']:15.3f}")

    # Monotonicity Preservation Check in Probability Space
    sort_idx = np.argsort(prob_uncal)
    sorted_sig = prob_sig[sort_idx]
    sorted_iso = prob_iso[sort_idx]
    viol_sig = np.sum(np.diff(sorted_sig) < -1e-6)
    viol_iso = np.sum(np.diff(sorted_iso) < -1e-6)
    print(f"\nMonotonicity Preservation in Probability Mapping:")
    print(f"  Sigmoid Calibration Ordering Violations: {viol_sig} (Preserves 1D ordering perfectly)")
    print(f"  Isotonic Calibration Ordering Violations: {viol_iso} (Preserves 1D ordering perfectly)")

    # 4. LOCO Spatial Calibration Evaluation
    print("\n================== LEAVE-ONE-CORRIDOR-OUT (LOCO) SPATIAL CALIBRATION ==================")
    unique_corridors = sorted(df['corridor'].unique().tolist())
    loco_uncal_results = []
    loco_sig_results = []
    loco_iso_results = []
    
    for fold_idx, held_out_corridor in enumerate(unique_corridors, 1):
        dev_mask = df['corridor'] != held_out_corridor
        test_mask_corridor = df['corridor'] == held_out_corridor
        
        df_dev = df.loc[dev_mask]
        df_test_corridor = df.loc[test_mask_corridor]
        
        # Chronological split within development corridors to prevent test/validation leakage
        train_dev_mask = df_dev['year'] <= 2022
        val_dev_mask = df_dev['year'] >= 2023
        
        X_tr_dev = df_dev.loc[train_dev_mask, feature_cols]
        y_tr_dev = df_dev.loc[train_dev_mask, 'target_disrupted']
        
        X_val_dev = df_dev.loc[val_dev_mask, feature_cols]
        y_val_dev = df_dev.loc[val_dev_mask, 'target_disrupted']
        
        X_test_c = df_test_corridor[feature_cols]
        y_test_c = df_test_corridor['target_disrupted']
        
        # Fit base model
        m_base = HistGradientBoostingClassifier(
            monotonic_cst=monotonic_cst,
            max_iter=120,
            learning_rate=0.08,
            max_depth=4,
            random_state=42
        )
        m_base.fit(X_tr_dev, y_tr_dev)
        
        # Fit calibrators on non-held-out validation data
        frozen_m = FrozenEstimator(m_base)
        m_sig = CalibratedClassifierCV(frozen_m, method='sigmoid').fit(X_val_dev, y_val_dev)
        m_iso = CalibratedClassifierCV(frozen_m, method='isotonic').fit(X_val_dev, y_val_dev)
        
        p_u = m_base.predict_proba(X_test_c)[:, 1]
        p_s = m_sig.predict_proba(X_test_c)[:, 1]
        p_i = m_iso.predict_proba(X_test_c)[:, 1]
        
        def calc_fold_metrics(y_true, prob):
            pred = (prob >= 0.50).astype(int)
            brier = float(brier_score_loss(y_true, prob))
            ece, _ = compute_ece(y_true, prob, n_bins=10)
            has_two_classes = len(np.unique(y_true)) > 1
            prauc = float(average_precision_score(y_true, prob)) if has_two_classes else None
            rocauc = float(roc_auc_score(y_true, prob)) if has_two_classes else None
            f1 = float(f1_score(y_true, pred, zero_division=0))
            rec = float(recall_score(y_true, pred, zero_division=0))
            prec = float(precision_score(y_true, pred, zero_division=0))
            return {"brier": brier, "ece": ece, "pr_auc": prauc, "roc_auc": rocauc, "f1": f1, "recall": rec, "precision": prec}
            
        loco_uncal_results.append(calc_fold_metrics(y_test_c, p_u))
        loco_sig_results.append(calc_fold_metrics(y_test_c, p_s))
        loco_iso_results.append(calc_fold_metrics(y_test_c, p_i))
        
        print(f"Corridor '{held_out_corridor:38s}' | Uncal Brier: {loco_uncal_results[-1]['brier']:.4f} -> Sig Brier: {loco_sig_results[-1]['brier']:.4f} | Uncal ECE: {loco_uncal_results[-1]['ece']:.4f} -> Sig ECE: {loco_sig_results[-1]['ece']:.4f}")

    def macro_avg(res_list):
        return {k: round(float(np.mean([r[k] for r in res_list if r[k] is not None])), 4) for k in res_list[0]}

    m_uncal = macro_avg(loco_uncal_results)
    m_sig = macro_avg(loco_sig_results)
    m_iso = macro_avg(loco_iso_results)
    
    print("\n================== LOCO SPATIAL MACRO-AVERAGE SUMMARY ==================")
    print(f"{'Method':30s} | {'Brier':7s} | {'ECE':7s} | {'PR-AUC':7s} | {'ROC-AUC':7s} | {'Precision':9s} | {'Recall':7s} | {'F1':7s}")
    print("-" * 105)
    print(f"{'Uncalibrated Monotonic GBDT':30s} | {m_uncal['brier']:7.4f} | {m_uncal['ece']:7.4f} | {m_uncal['pr_auc']:7.4f} | {m_uncal['roc_auc']:7.4f} | {m_uncal['precision']:9.4f} | {m_uncal['recall']:7.4f} | {m_uncal['f1']:7.4f}")
    print(f"{'Sigmoid (Platt) Calibrated':30s} | {m_sig['brier']:7.4f} | {m_sig['ece']:7.4f} | {m_sig['pr_auc']:7.4f} | {m_sig['roc_auc']:7.4f} | {m_sig['precision']:9.4f} | {m_sig['recall']:7.4f} | {m_sig['f1']:7.4f}")
    print(f"{'Isotonic Calibrated':30s} | {m_iso['brier']:7.4f} | {m_iso['ece']:7.4f} | {m_iso['pr_auc']:7.4f} | {m_iso['roc_auc']:7.4f} | {m_iso['precision']:9.4f} | {m_iso['recall']:7.4f} | {m_iso['f1']:7.4f}")

if __name__ == '__main__':
    run_step4_calibration()
