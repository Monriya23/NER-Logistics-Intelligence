"""
Test script for Step 2: Leave-One-Corridor-Out (LOCO) Spatial Holdout Validation.
"""
import sys
import os
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    precision_score, recall_score, f1_score, roc_auc_score,
    average_precision_score, brier_score_loss, confusion_matrix
)

# Add backend to path
sys.path.insert(0, r'c:\North eastern region logistics')

from backend.app.ai.model_trainer import generate_corridor_grounded_dataset, AIModelTrainer
from backend.app.gis.road_network import ROAD_SEGMENTS

def run_spatial_holdout_validation():
    print("==================================================")
    print("RUNNING STEP 2: LEAVE-ONE-CORRIDOR-OUT VALIDATION")
    print("==================================================")
    
    # 1. Generate standard dataset
    df = generate_corridor_grounded_dataset(1800)
    feature_cols = [
        'rain_24h_mm', 'rain_3d_mm', 'rain_7d_mm', 'slope_deg',
        'elevation_m', 'gsi_susceptibility', 'historical_event_count', 'recent_field_incidents'
    ]
    
    unique_corridors = sorted(df['corridor'].unique().tolist())
    print(f"Total rows: {len(df)}")
    print(f"Number of unique corridors: {len(unique_corridors)}")
    for i, c in enumerate(unique_corridors, 1):
        segs = df[df['corridor'] == c]['segment_id'].unique().tolist()
        count = len(df[df['corridor'] == c])
        pos = int(df[df['corridor'] == c]['target_disrupted'].sum())
        print(f"  Fold {i}: Corridor='{c}' | Segments={segs} | Rows={count} (Pos={pos}, Neg={count-pos})")

    # Run Temporal Benchmark first for reference
    trainer = AIModelTrainer()
    temp_metrics = trainer.train_and_validate()
    
    fold_results = []
    pooled_predictions = {
        "Rule_Based_Baseline": {"y_true": [], "y_pred": [], "y_prob": []},
        "Logistic_Regression": {"y_true": [], "y_pred": [], "y_prob": []},
        "Random_Forest": {"y_true": [], "y_pred": [], "y_prob": []},
        "Gradient_Boosting_GBDT": {"y_true": [], "y_pred": [], "y_prob": []}
    }
    
    feature_distribution_shifts = []

    for fold_idx, held_out_corridor in enumerate(unique_corridors, 1):
        train_mask = df['corridor'] != held_out_corridor
        test_mask = df['corridor'] == held_out_corridor
        
        # --- Strict Spatial Leakage Assertions ---
        train_corridors = set(df.loc[train_mask, 'corridor'].unique())
        test_corridors = set(df.loc[test_mask, 'corridor'].unique())
        train_segments = set(df.loc[train_mask, 'segment_id'].unique())
        test_segments = set(df.loc[test_mask, 'segment_id'].unique())
        
        assert held_out_corridor not in train_corridors, f"LEAKAGE: {held_out_corridor} in train corridors!"
        assert len(train_corridors.intersection(test_corridors)) == 0, "LEAKAGE: Corridor intersection not empty!"
        assert len(train_segments.intersection(test_segments)) == 0, "LEAKAGE: Segment intersection not empty!"
        assert len(set(df.loc[train_mask].index).intersection(set(df.loc[test_mask].index))) == 0, "LEAKAGE: Index overlap!"
        
        X_train = df.loc[train_mask, feature_cols]
        y_train = df.loc[train_mask, 'target_disrupted']
        
        X_test = df.loc[test_mask, feature_cols]
        y_test = df.loc[test_mask, 'target_disrupted']
        
        n_train = len(X_train)
        n_test = len(X_test)
        pos_test = int(y_test.sum())
        neg_test = n_test - pos_test
        
        # Feature shift diagnostic
        shift_diag = {
            "corridor": held_out_corridor,
            "mean_slope_train": round(float(X_train['slope_deg'].mean()), 1),
            "mean_slope_test": round(float(X_test['slope_deg'].mean()), 1),
            "mean_elev_train": round(float(X_train['elevation_m'].mean()), 0),
            "mean_elev_test": round(float(X_test['elevation_m'].mean()), 0),
            "mean_gsi_train": round(float(X_train['gsi_susceptibility'].mean()), 2),
            "mean_gsi_test": round(float(X_test['gsi_susceptibility'].mean()), 2),
            "mean_hist_train": round(float(X_train['historical_event_count'].mean()), 1),
            "mean_hist_test": round(float(X_test['historical_event_count'].mean()), 1),
            "mean_rain_train": round(float(X_train['rain_24h_mm'].mean()), 1),
            "mean_rain_test": round(float(X_test['rain_24h_mm'].mean()), 1)
        }
        feature_distribution_shifts.append(shift_diag)
        
        # Models
        # 1. Rule-Based Baseline
        y_pred_prob_rule = (
            (X_test['rain_24h_mm'] > 75.0).astype(float) * 0.40 +
            (X_test['slope_deg'] > 33.0).astype(float) * 0.30 +
            (X_test['gsi_susceptibility'] >= 3).astype(float) * 0.30
        )
        y_pred_rule = (y_pred_prob_rule >= 0.50).astype(int)
        
        # 2. Logistic Regression
        lr = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)
        lr.fit(X_train, y_train)
        y_pred_prob_lr = lr.predict_proba(X_test)[:, 1]
        y_pred_lr = (y_pred_prob_lr >= 0.50).astype(int)
        
        # 3. Random Forest
        rf = RandomForestClassifier(n_estimators=100, max_depth=6, class_weight='balanced', random_state=42)
        rf.fit(X_train, y_train)
        y_pred_prob_rf = rf.predict_proba(X_test)[:, 1]
        y_pred_rf = (y_pred_prob_rf >= 0.50).astype(int)
        
        # 4. Gradient Boosting
        gbdt = GradientBoostingClassifier(n_estimators=120, learning_rate=0.08, max_depth=4, random_state=42)
        gbdt.fit(X_train, y_train)
        y_pred_prob_gbdt = gbdt.predict_proba(X_test)[:, 1]
        y_pred_gbdt = (y_pred_prob_gbdt >= 0.50).astype(int)
        
        # Accumulate pooled
        preds_dict = {
            "Rule_Based_Baseline": (y_pred_rule, y_pred_prob_rule),
            "Logistic_Regression": (y_pred_lr, y_pred_prob_lr),
            "Random_Forest": (y_pred_rf, y_pred_prob_rf),
            "Gradient_Boosting_GBDT": (y_pred_gbdt, y_pred_prob_gbdt)
        }
        
        fold_metrics = {}
        for m_name, (yp, yprob) in preds_dict.items():
            pooled_predictions[m_name]["y_true"].extend(y_test.tolist())
            pooled_predictions[m_name]["y_pred"].extend(yp.tolist())
            pooled_predictions[m_name]["y_prob"].extend(yprob.tolist())
            
            tn, fp, fn, tp = confusion_matrix(y_test, yp).ravel()
            
            # Safe evaluation if class diversity exists
            if len(np.unique(y_test)) > 1:
                prauc = round(float(average_precision_score(y_test, yprob)), 3)
                rocauc = round(float(roc_auc_score(y_test, yprob)), 3)
            else:
                prauc = None
                rocauc = None
                
            fold_metrics[m_name] = {
                "precision": round(float(precision_score(y_test, yp, zero_division=0)), 3),
                "recall": round(float(recall_score(y_test, yp, zero_division=0)), 3),
                "f1_score": round(float(f1_score(y_test, yp, zero_division=0)), 3),
                "pr_auc": prauc,
                "roc_auc": rocauc,
                "brier_score": round(float(brier_score_loss(y_test, yprob)), 3),
                "confusion_matrix": {"TN": int(tn), "FP": int(fp), "FN": int(fn), "TP": int(tp)}
            }
            
        fold_results.append({
            "fold": fold_idx,
            "held_out_corridor": held_out_corridor,
            "held_out_segments": sorted(list(test_segments)),
            "n_train": n_train,
            "n_test": n_test,
            "pos_test": pos_test,
            "neg_test": neg_test,
            "models": fold_metrics
        })

    # Macro Averages
    macro_metrics = {}
    model_names = ["Rule_Based_Baseline", "Logistic_Regression", "Random_Forest", "Gradient_Boosting_GBDT"]
    for m_name in model_names:
        prec_list = [f["models"][m_name]["precision"] for f in fold_results]
        rec_list = [f["models"][m_name]["recall"] for f in fold_results]
        f1_list = [f["models"][m_name]["f1_score"] for f in fold_results]
        prauc_list = [f["models"][m_name]["pr_auc"] for f in fold_results if f["models"][m_name]["pr_auc"] is not None]
        rocauc_list = [f["models"][m_name]["roc_auc"] for f in fold_results if f["models"][m_name]["roc_auc"] is not None]
        brier_list = [f["models"][m_name]["brier_score"] for f in fold_results]
        
        macro_metrics[m_name] = {
            "precision": {"mean": round(float(np.mean(prec_list)), 3), "std": round(float(np.std(prec_list)), 3), "min": round(float(np.min(prec_list)), 3), "max": round(float(np.max(prec_list)), 3)},
            "recall": {"mean": round(float(np.mean(rec_list)), 3), "std": round(float(np.std(rec_list)), 3), "min": round(float(np.min(rec_list)), 3), "max": round(float(np.max(rec_list)), 3)},
            "f1_score": {"mean": round(float(np.mean(f1_list)), 3), "std": round(float(np.std(f1_list)), 3), "min": round(float(np.min(f1_list)), 3), "max": round(float(np.max(f1_list)), 3)},
            "pr_auc": {"mean": round(float(np.mean(prauc_list)), 3), "std": round(float(np.std(prauc_list)), 3), "min": round(float(np.min(prauc_list)), 3), "max": round(float(np.max(prauc_list)), 3)},
            "roc_auc": {"mean": round(float(np.mean(rocauc_list)), 3), "std": round(float(np.std(rocauc_list)), 3), "min": round(float(np.min(rocauc_list)), 3), "max": round(float(np.max(rocauc_list)), 3)},
            "brier_score": {"mean": round(float(np.mean(brier_list)), 3), "std": round(float(np.std(brier_list)), 3), "min": round(float(np.min(brier_list)), 3), "max": round(float(np.max(brier_list)), 3)}
        }
        
    # Pooled / Micro Metrics
    pooled_metrics = {}
    for m_name in model_names:
        yt = np.array(pooled_predictions[m_name]["y_true"])
        yp = np.array(pooled_predictions[m_name]["y_pred"])
        yprob = np.array(pooled_predictions[m_name]["y_prob"])
        tn, fp, fn, tp = confusion_matrix(yt, yp).ravel()
        
        pooled_metrics[m_name] = {
            "precision": round(float(precision_score(yt, yp, zero_division=0)), 3),
            "recall": round(float(recall_score(yt, yp, zero_division=0)), 3),
            "f1_score": round(float(f1_score(yt, yp, zero_division=0)), 3),
            "pr_auc": round(float(average_precision_score(yt, yprob)), 3),
            "roc_auc": round(float(roc_auc_score(yt, yprob)), 3),
            "brier_score": round(float(brier_score_loss(yt, yprob)), 3),
            "confusion_matrix": {"TN": int(tn), "FP": int(fp), "FN": int(fn), "TP": int(tp)}
        }

    print("\n================== TEMPORAL vs SPATIAL LOCO COMPARISON ==================")
    print(f"{'Model':25s} | {'Temp PR-AUC':11s} | {'Spat PR-AUC':11s} | {'Gap PR-AUC':10s} | {'Temp F1':8s} | {'Spat F1':8s} | {'Temp Rec':8s} | {'Spat Rec':8s}")
    print("-" * 115)
    for m_name in model_names:
        t_prauc = temp_metrics["models"][m_name]["pr_auc"]
        s_prauc = macro_metrics[m_name]["pr_auc"]["mean"]
        gap_prauc = round(t_prauc - s_prauc, 3)
        
        t_f1 = temp_metrics["models"][m_name]["f1_score"]
        s_f1 = macro_metrics[m_name]["f1_score"]["mean"]
        
        t_rec = temp_metrics["models"][m_name]["recall"]
        s_rec = macro_metrics[m_name]["recall"]["mean"]
        
        print(f"{m_name:25s} | {t_prauc:11.3f} | {s_prauc:11.3f} | {gap_prauc:+10.3f} | {t_f1:8.3f} | {s_f1:8.3f} | {t_rec:8.3f} | {s_rec:8.3f}")

    print("\n================== CORRIDOR-WISE PERFORMANCE TABLE ==================")
    print(f"{'Held-Out Corridor':38s} | {'Rows':4s} | {'Pos':3s} | {'Neg':3s} | {'LR PR-AUC':9s} | {'RF PR-AUC':9s} | {'GBDT PR-AUC':11s} | {'Rule PR-AUC':11s}")
    print("-" * 115)
    for f in fold_results:
        c_name = f["held_out_corridor"]
        r = f["n_test"]
        p = f["pos_test"]
        n = f["neg_test"]
        lr_p = f["models"]["Logistic_Regression"]["pr_auc"]
        rf_p = f["models"]["Random_Forest"]["pr_auc"]
        gb_p = f["models"]["Gradient_Boosting_GBDT"]["pr_auc"]
        ru_p = f["models"]["Rule_Based_Baseline"]["pr_auc"]
        print(f"{c_name:38s} | {r:4d} | {p:3d} | {n:3d} | {lr_p:9.3f} | {rf_p:9.3f} | {gb_p:11.3f} | {ru_p:11.3f}")

    print("\n================== FEATURE SHIFT DIAGNOSTICS ==================")
    for s in feature_distribution_shifts:
        print(f"Corridor: {s['corridor']}")
        print(f"  Slope (Train vs Test):    {s['mean_slope_train']}° vs {s['mean_slope_test']}°")
        print(f"  Elevation (Train vs Test): {s['mean_elev_train']}m vs {s['mean_elev_test']}m")
        print(f"  GSI Grade (Train vs Test): {s['mean_gsi_train']} vs {s['mean_gsi_test']}")
        print(f"  Hist Disr (Train vs Test): {s['mean_hist_train']} vs {s['mean_hist_test']}")

if __name__ == '__main__':
    run_spatial_holdout_validation()
