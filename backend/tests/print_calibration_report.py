"""
Print detailed Step 4 Probability Calibration results, reliability tables, and LOCO corridor breakdowns.
"""
import sys, numpy as np, pandas as pd
from sklearn.metrics import confusion_matrix
sys.path.insert(0, r'c:\North eastern region logistics')
from backend.app.ai.model_trainer import AIModelTrainer

def main():
    trainer = AIModelTrainer()
    metrics = trainer.train_and_validate()

    print("================== STEP 4 TEMPORAL TEST SUMMARY ==================")
    print(f"{'Model':46s} | {'Brier':7s} | {'ECE':7s} | {'PR-AUC':7s} | {'ROC-AUC':7s} | {'Prec':7s} | {'Rec':7s} | {'F1':7s} | {'Confusion Matrix'}")
    print("-" * 130)
    for m in [
        'Rule_Based_Baseline',
        'Logistic_Regression',
        'Random_Forest',
        'Gradient_Boosting_Unconstrained',
        'Gradient_Boosting_Monotonic',
        'Gradient_Boosting_Monotonic_SigmoidCalibrated',
        'Gradient_Boosting_Monotonic_IsotonicCalibrated'
    ]:
        d = metrics['models'][m]
        cm = d['confusion_matrix']
        cm_str = f"TN={cm['TN']}, FP={cm['FP']}, FN={cm['FN']}, TP={cm['TP']}"
        ece = d.get('expected_calibration_error', 'N/A')
        print(f"{m:46s} | {d['brier_score_calibration']:7.4f} | {ece:7.4f} | {d['pr_auc']:7.3f} | {d['roc_auc']:7.3f} | {d['precision']:7.3f} | {d['recall']:7.3f} | {d['f1_score']:7.3f} | {cm_str}")

    print("\n================== RELIABILITY BINNING TABLE (UNCALIBRATED) ==================")
    uncal_bins = metrics['models']['Gradient_Boosting_Monotonic']['reliability_bins']
    print(f"| {'Bin':3s} | {'Prob Range':10s} | {'Count':5s} | {'Mean Pred':9s} | {'Observed (True)':15s} | {'Gap':5s} |")
    print("|" + "-"*62 + "|")
    for b in uncal_bins:
        print(f"| {b['bin']:3d} | {b['range']:10s} | {b['count']:5d} | {b['avg_pred']:9.3f} | {b['avg_true']:15.3f} | {b['gap']:5.3f} |")

    print("\n================== RELIABILITY BINNING TABLE (SIGMOID / PLATT) ==================")
    sig_bins = metrics['models']['Gradient_Boosting_Monotonic_SigmoidCalibrated']['reliability_bins']
    print(f"| {'Bin':3s} | {'Prob Range':10s} | {'Count':5s} | {'Mean Pred':9s} | {'Observed (True)':15s} | {'Gap':5s} |")
    print("|" + "-"*62 + "|")
    for b in sig_bins:
        print(f"| {b['bin']:3d} | {b['range']:10s} | {b['count']:5d} | {b['avg_pred']:9.3f} | {b['avg_true']:15.3f} | {b['gap']:5.3f} |")

    print("\n================== RELIABILITY BINNING TABLE (ISOTONIC) ==================")
    iso_bins = metrics['models']['Gradient_Boosting_Monotonic_IsotonicCalibrated']['reliability_bins']
    print(f"| {'Bin':3s} | {'Prob Range':10s} | {'Count':5s} | {'Mean Pred':9s} | {'Observed (True)':15s} | {'Gap':5s} |")
    print("|" + "-"*62 + "|")
    for b in iso_bins:
        print(f"| {b['bin']:3d} | {b['range']:10s} | {b['count']:5d} | {b['avg_pred']:9.3f} | {b['avg_true']:15.3f} | {b['gap']:5.3f} |")

    from sklearn.ensemble import HistGradientBoostingClassifier
    from sklearn.calibration import CalibratedClassifierCV, FrozenEstimator
    from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, average_precision_score, brier_score_loss
    from backend.app.ai.model_trainer import generate_corridor_grounded_dataset, compute_expected_calibration_error

    df = generate_corridor_grounded_dataset(1800)
    feature_cols = trainer.feature_cols
    unique_corridors = sorted(df['corridor'].unique().tolist())
    monotonic_cst = [1, 1, 1, 1, 0, 1, 1, 1]

    print("\n================== LOCO CORRIDOR-BY-CORRIDOR BREAKDOWN ==================")
    print(f"{'Held-Out Corridor':36s} | {'Uncal Brier':11s} | {'Sig Brier':10s} | {'Iso Brier':10s} | {'Uncal PR-AUC':12s} | {'Sig PR-AUC':11s} | {'Iso PR-AUC':11s}")
    print("-" * 115)

    loco_res = {'uncal': [], 'sig': [], 'iso': []}
    for held_out in unique_corridors:
        train_mask = (df['corridor'] != held_out) & (df['year'] <= 2022)
        val_mask = (df['corridor'] != held_out) & (df['year'] >= 2023) & (df['year'] <= 2024)
        test_mask = df['corridor'] == held_out

        X_tr, y_tr = df.loc[train_mask, feature_cols], df.loc[train_mask, 'target_disrupted']
        X_v, y_v = df.loc[val_mask, feature_cols], df.loc[val_mask, 'target_disrupted']
        X_te, y_te = df.loc[test_mask, feature_cols], df.loc[test_mask, 'target_disrupted']

        base = HistGradientBoostingClassifier(monotonic_cst=monotonic_cst, max_iter=120, learning_rate=0.08, max_depth=4, random_state=42)
        base.fit(X_tr, y_tr)
        prob_uncal = base.predict_proba(X_te)[:, 1]

        cal_sig = CalibratedClassifierCV(FrozenEstimator(base), method='sigmoid')
        cal_sig.fit(X_v, y_v)
        prob_sig = cal_sig.predict_proba(X_te)[:, 1]

        cal_iso = CalibratedClassifierCV(FrozenEstimator(base), method='isotonic')
        cal_iso.fit(X_v, y_v)
        prob_iso = cal_iso.predict_proba(X_te)[:, 1]

        b_uncal = brier_score_loss(y_te, prob_uncal)
        b_sig = brier_score_loss(y_te, prob_sig)
        b_iso = brier_score_loss(y_te, prob_iso)

        p_uncal = average_precision_score(y_te, prob_uncal)
        p_sig = average_precision_score(y_te, prob_sig)
        p_iso = average_precision_score(y_te, prob_iso)

        print(f"{held_out:36s} | {b_uncal:11.4f} | {b_sig:10.4f} | {b_iso:10.4f} | {p_uncal:12.3f} | {p_sig:11.3f} | {p_iso:11.3f}")

if __name__ == '__main__':
    main()
