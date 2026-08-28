"""
Razorpay Duplicate Detection Package.
"""

from src.razorpay_schema import DUPLICATE_FEATURES, RAZORPAY_PAYMENT_FIELDS
from src.utils import (
    amount_to_rupees,
    get_env_variable,
    get_unix_timestamp,
    load_env_config,
    logger,
    rupees_to_paise,
    setup_logger,
)
from src.feature_engineering import engineer_point_in_time_features
from src.pair_generator import (
    build_and_save_dataset,
    generate_candidate_pairs,
    generate_synthetic_transactions,
)
from src.synthetic_generator import DuplicateGenerator
from src.validate_dataset import perform_validation
from src.model_training import BaselineRulesClassifier
from src.redis_blocking import RedisCandidateRetriever
from src.webhook_receiver import app as webhook_app
from src.safety_rules import BusinessSafetyEngine
from src.razorpay_integration import RazorpayAPIClient

__all__ = [
    "RAZORPAY_PAYMENT_FIELDS",
    "DUPLICATE_FEATURES",
    "setup_logger",
    "logger",
    "amount_to_rupees",
    "rupees_to_paise",
    "get_unix_timestamp",
    "load_env_config",
    "get_env_variable",
    "engineer_point_in_time_features",
    "build_and_save_dataset",
    "generate_candidate_pairs",
    "generate_synthetic_transactions",
    "DuplicateGenerator",
    "perform_validation",
    "BaselineRulesClassifier",
    "RedisCandidateRetriever",
    "webhook_app",
    "BusinessSafetyEngine",
    "RazorpayAPIClient",
]





