import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import lime
import lime.lime_tabular
from aif360.datasets import BinaryLabelDataset
from aif360.metrics import BinaryLabelDatasetMetric
from aif360.algorithms.preprocessing import Reweighing, DisparateImpactRemover
import warnings
warnings.filterwarnings('ignore')


def create_binary_label_dataset(df, protected_attributes, label_name):
    """Convert pandas dataframe to aif360 BinaryLabelDataset"""
    return BinaryLabelDataset(
        df=df,
        label_names=[label_name],
        protected_attribute_names=protected_attributes,
        favorable_label=1,
        unfavorable_label=0
    )


def compute_fairness_metrics(dataset, privileged_groups, unprivileged_groups):
    """Compute fairness metrics for the dataset"""
    metrics = BinaryLabelDatasetMetric(
        dataset,
        unprivileged_groups=unprivileged_groups,
        privileged_groups=privileged_groups
    )

    return {
        'disparate_impact': metrics.disparate_impact(),
        'statistical_parity_difference': metrics.statistical_parity_difference(),
        'mean_difference': metrics.mean_difference()
    }


def mitigate_bias(dataset, privileged_groups, unprivileged_groups):
    """Apply bias mitigation techniques"""
    # Reweighing
    rw = Reweighing(unprivileged_groups=unprivileged_groups,
                    privileged_groups=privileged_groups)
    dataset_transformed = rw.fit_transform(dataset)

    # Disparate Impact Remover
    di = DisparateImpactRemover(repair_level=1.0)
    dataset_transformed = di.fit_transform(dataset_transformed)

    return dataset_transformed


def clean_feature_name(feature_str):
    """Extract the base feature name from LIME's output format"""
    for operator in [' <= ', ' > ', ' < ', ' >= ']:
        if operator in feature_str:
            return feature_str.split(operator)[0]
    return feature_str


def explain_with_lime(model, X_train, X_test, feature_names, sample_data, scaler):
    explainer = lime.lime_tabular.LimeTabularExplainer(
        X_train,
        feature_names=feature_names,
        class_names=['Rejected', 'Approved'],
        mode='classification',
        discretize_continuous=True
    )

    sample_scaled = scaler.transform(sample_data)
    exp = explainer.explain_instance(
        sample_scaled[0],
        model.predict_proba,
        num_features=len(feature_names)
    )

    feature_importance = pd.DataFrame(exp.as_list(), columns=['Feature', 'Contribution'])
    feature_importance['base_feature'] = feature_importance['Feature'].apply(clean_feature_name)
    return feature_importance


def suggest_improvements(feature_importance, X, y, sample_data, model, scaler, protected_features):
    suggestions = []

    for _, row in feature_importance.iterrows():
        feature = row['base_feature']
        contribution = row['Contribution']

        if feature in protected_features:
            continue

        if contribution < 0 and feature in sample_data.columns:
            current_value = sample_data[feature].iloc[0]

            if feature in ['Credit_History', 'cibil_score']:
                target = X[feature].median()
                if current_value < target:
                    suggestions.append({
                        'feature': feature,
                        'current': current_value,
                        'target': target,
                        'action': 'increase',
                        'contribution': contribution
                    })

            elif feature in ['ApplicantIncome', 'income_annum', 'AMT_INCOME_TOTAL']:
                target = X[feature].quantile(0.75)
                if current_value < target:
                    suggestions.append({
                        'feature': feature,
                        'current': current_value,
                        'target': target,
                        'action': 'increase',
                        'contribution': contribution
                    })

            elif feature in ['LoanAmount', 'loan_amount']:
                target = X[feature].quantile(0.25)
                if current_value > target:
                    suggestions.append({
                        'feature': feature,
                        'current': current_value,
                        'target': target,
                        'action': 'decrease',
                        'contribution': contribution
                    })

            elif feature in ['FLAG_WORK_PHONE', 'FLAG_PHONE', 'FLAG_EMAIL']:
                if current_value == 0:
                    suggestions.append({
                        'feature': feature,
                        'current': current_value,
                        'target': 1,
                        'action': 'provide',
                        'contribution': contribution
                    })

    suggestions.sort(key=lambda x: abs(x['contribution']), reverse=True)
    return suggestions


def format_suggestion_message(suggestion):
    feature = suggestion['feature']
    current = suggestion['current']
    target = suggestion['target']
    action = suggestion['action']

    if action == 'provide':
        return f"- {feature}:\n  Action: Provide this information\n  Current: Not provided\n  Impact: Required for better assessment"
    else:
        return f"- {feature}:\n  Current: {format_value(current, feature)}\n  Target: {format_value(target, feature)}"


def calculate_improvement_impact(suggestion, sample_data, model, scaler):
    modified_data = sample_data.copy()
    modified_data[suggestion['feature']] = suggestion['target']

    original_prob = model.predict_proba(scaler.transform(sample_data))[0][1]
    modified_prob = model.predict_proba(scaler.transform(modified_data))[0][1]

    return {
        'original_prob': original_prob,
        'modified_prob': modified_prob,
        'improvement': modified_prob - original_prob
    }


def format_value(value, feature):
    if feature in ['ApplicantIncome', 'income_annum', 'AMT_INCOME_TOTAL', 'LoanAmount', 'loan_amount']:
        return f"${value:,.0f}"
    elif feature in ['Credit_History', 'cibil_score']:
        return f"{value:.0f}"
    else:
        return f"{value:,.2f}"


def define_protected_attributes():
    """Define protected attributes for each dataset"""
    protected_attributes = {
        'home_loan': ['Gender'],           # For example, using Gender as a protected attribute
        'personal_loan': ['education'],
        'credit_card': ['CODE_GENDER']
    }
    return protected_attributes


def train_and_explain(X, y, sample_data, protected_features):
    feature_names = X.columns
    sample_data = sample_data[feature_names]

    # Create dataset with fairness metrics
    dataset = create_binary_label_dataset(
        pd.concat([X, y.to_frame()], axis=1),
        protected_features,
        y.name
    )

    # Define privileged and unprivileged groups based on each protected attribute
    privileged_groups = [{attr: 1} for attr in protected_features]
    unprivileged_groups = [{attr: 0} for attr in protected_features]

    # Compute initial fairness metrics
    initial_metrics = compute_fairness_metrics(dataset, privileged_groups, unprivileged_groups)
    print("\nInitial Fairness Metrics:")
    for metric, value in initial_metrics.items():
        print(f"{metric}: {value:.4f}")

    # Apply bias mitigation
    dataset_transformed = mitigate_bias(dataset, privileged_groups, unprivileged_groups)

    # Split the transformed dataset
    X_transformed = dataset_transformed.features
    y_transformed = dataset_transformed.labels.ravel()

    X_train, X_test, y_train, y_test = train_test_split(X_transformed, y_transformed, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    sample_scaled = scaler.transform(sample_data)

    model = RandomForestClassifier(
        n_estimators=100,
        class_weight='balanced',
        random_state=42
    )
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    sample_pred = model.predict(sample_scaled)
    sample_prob = model.predict_proba(sample_scaled)

    # Compute post-mitigation fairness metrics using the test set predictions
    dataset_pred = create_binary_label_dataset(
        pd.DataFrame(np.column_stack([X_test, y_pred]), columns=list(X.columns) + ['prediction']),
        protected_features,
        'prediction'
    )
    post_metrics = compute_fairness_metrics(dataset_pred, privileged_groups, unprivileged_groups)
    print("\nPost-Mitigation Fairness Metrics:")
    for metric, value in post_metrics.items():
        print(f"{metric}: {value:.4f}")

    feature_importance = explain_with_lime(model, X_train_scaled, X_test_scaled,
                                           feature_names, sample_data, scaler)

    suggestions = suggest_improvements(feature_importance, X, y, sample_data, model, scaler, protected_features)

    print(f"\nPrediction: {'Approved' if sample_pred[0] == 1 else 'Rejected'}")
    print(f"Approval Probability: {sample_prob[0][1]:.2%}")
    print(f"\nModel Accuracy: {accuracy_score(y_test, y_pred):.2%}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    print("\nKey Factors Affecting Decision:")
    feature_summary = feature_importance.groupby('base_feature')['Contribution'].sum().sort_values()
    for feature, contribution in feature_summary.items():
        if feature in sample_data.columns and feature not in protected_features:
            current_value = sample_data[feature].iloc[0]
            print(f"- {feature}: {format_value(current_value, feature)} (Impact: {contribution:.4f})")
    print("\nSuggested Improvements (Ranked by Impact):")
    if suggestions:
        for suggestion in suggestions:
            impact = calculate_improvement_impact(suggestion, sample_data, model, scaler)
            print(f"\n{format_suggestion_message(suggestion)}")
            print(f"  Expected improvement in approval probability: {impact['improvement']:.2%}")
            print(f"  New approval probability: {impact['modified_prob']:.2%}")
    else:
        print("No specific improvements suggested. Please ensure all required information is provided accurately.")

    fairness_info = {
        "initial_metrics": initial_metrics,
        "post_metrics": post_metrics,
        "suggestions": suggestions
    }

    return model, feature_importance, scaler, fairness_info
    

def load_and_preprocess_home_loan():
    train = pd.read_csv(r'D:\Temenos\backend\features\loan_approval\loan_sanction_train.csv')

    train['Gender'].fillna(train['Gender'].mode()[0], inplace=True)
    train['Married'].fillna(train['Married'].mode()[0], inplace=True)
    train['Dependents'].fillna(train['Dependents'].mode()[0], inplace=True)
    train['Self_Employed'].fillna('No', inplace=True)
    train['LoanAmount'].fillna(train['LoanAmount'].median(), inplace=True)
    train['Loan_Amount_Term'].fillna(360.0, inplace=True)
    train['Credit_History'].fillna(1.0, inplace=True)

    le = LabelEncoder()
    categorical_cols = ['Gender', 'Married', 'Dependents', 'Education',
                          'Self_Employed', 'Property_Area', 'Loan_Status']
    for col in categorical_cols:
        train[col] = le.fit_transform(train[col].astype(str))

    return train


def load_and_preprocess_personal_loan():
    df = pd.read_csv(r'D:\Temenos\backend\features\loan_approval\loan_approval_dataset.csv')
    df.columns = df.columns.str.strip()

    le = LabelEncoder()
    categorical_cols = ['education', 'self_employed', 'loan_status']
    for col in categorical_cols:
        df[col] = le.fit_transform(df[col].astype(str))

    return df


def load_and_preprocess_credit_card():
    record = pd.read_csv(r'D:\Temenos\backend\features\loan_approval\application_record.csv')
    credit = pd.read_csv(r'D:\Temenos\backend\features\loan_approval\credit_record.csv')

    status_map = {'X': 0, 'C': 0, '0': 1, '1': 1, '2': 1, '3': 1, '4': 1, '5': 1}
    credit['STATUS'] = credit['STATUS'].map(status_map)

    worst_status = credit.groupby('ID')['STATUS'].max().reset_index()
    worst_status.columns = ['ID', 'BAD_STATUS']

    df = record.merge(worst_status, on='ID', how='left')
    df['BAD_STATUS'].fillna(0, inplace=True)
    df.fillna(df.mode().iloc[0], inplace=True)

    categorical_cols = ['CODE_GENDER', 'FLAG_OWN_CAR', 'FLAG_OWN_REALTY',
                          'NAME_INCOME_TYPE', 'NAME_EDUCATION_TYPE', 'NAME_FAMILY_STATUS',
                          'NAME_HOUSING_TYPE', 'OCCUPATION_TYPE']

    label_encoders = {}
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le

    return df


# Sample rejected applications
home_loan_reject = {
    'Gender': 1,
    'Married': 1,
    'Dependents': 2,
    'Education': 0,
    'Self_Employed': 0,
    'ApplicantIncome': 3000,
    'CoapplicantIncome': 0,
    'LoanAmount': 250,
    'Loan_Amount_Term': 360,
    'Credit_History': 0,
    'Property_Area': 2
}

personal_loan_reject = {
    'no_of_dependents': 3,
    'education': 0,
    'self_employed': 1,
    'income_annum': 4100000,
    'loan_amount': 29000000,
    'loan_term': 20,
    'cibil_score': 400,
    'residential_assets_value': 2000000,
    'commercial_assets_value': 2000000,
    'luxury_assets_value': 8000000,
    'bank_asset_value': 3000000
}

credit_card_reject = {
    'CODE_GENDER': 0,
    'FLAG_OWN_CAR': 0,
    'FLAG_OWN_REALTY': 0,
    'CNT_CHILDREN': 2,
    'AMT_INCOME_TOTAL': 150000,
    'NAME_INCOME_TYPE': 0,
    'NAME_EDUCATION_TYPE': 1,
    'NAME_FAMILY_STATUS': 0,
    'NAME_HOUSING_TYPE': 0,
    'DAYS_BIRTH': -12000,
    'DAYS_EMPLOYED': -1000,
    'FLAG_MOBIL': 1,
    'FLAG_WORK_PHONE': 0,
    'FLAG_PHONE': 0,
    'FLAG_EMAIL': 0,
    'OCCUPATION_TYPE': 0,
    'CNT_FAM_MEMBERS': 3
}
