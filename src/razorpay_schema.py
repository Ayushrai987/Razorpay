"""
Razorpay Payment Entity Schema and Duplicate Detection Feature Engineering Definitions.

This module serves as the authoritative architectural blueprint for Razorpay payment
entities, field criticality classifications, and feature engineering specifications
for enterprise duplicate payment detection pipelines.
"""

from typing import Any, Dict, List, Literal, TypedDict, Union


class PaymentFieldMetadata(TypedDict):
    """Metadata definition for a Razorpay payment object field."""
    name: str
    data_type: str
    sample_value: Any
    criticality_tier: Literal["Tier 1", "Tier 2", "Tier 3", "Tier 4"]
    criticality_stars: int  # 1 to 5 stars
    duplicate_relevance: str
    description: str
    nullable: bool


class DuplicateFeatureMetadata(TypedDict):
    """Metadata definition for an engineered duplicate detection feature."""
    feature_name: str
    feature_group: str
    data_type: str
    detection_task: str
    computation_logic: str
    importance_weight: float  # Scale 0.0 - 1.0
    description: str


# ==============================================================================
# RAZORPAY PAYMENT ENTITY SCHEMA (33 CORE FIELDS)
# ==============================================================================
RAZORPAY_PAYMENT_FIELDS: Dict[str, PaymentFieldMetadata] = {
    # --------------------------------------------------------------------------
    # TIER 1: Core Identifiers & Financial Criticality (5-star / 4-star)
    # --------------------------------------------------------------------------
    "id": {
        "name": "id",
        "data_type": "string",
        "sample_value": "pay_29NWsA6JxFUAxw",
        "criticality_tier": "Tier 1",
        "criticality_stars": 5,
        "duplicate_relevance": "Primary unique key; identical IDs indicate duplicate ingestion or idempotency replay.",
        "description": "Unique identifier of the payment assigned by Razorpay.",
        "nullable": False,
    },
    "entity": {
        "name": "entity",
        "data_type": "string",
        "sample_value": "payment",
        "criticality_tier": "Tier 1",
        "criticality_stars": 4,
        "duplicate_relevance": "Object type validator; ensures record belongs to payment entity domain.",
        "description": "Indicates the type of entity (always 'payment').",
        "nullable": False,
    },
    "amount": {
        "name": "amount",
        "data_type": "integer",
        "sample_value": 50000,
        "criticality_tier": "Tier 1",
        "criticality_stars": 5,
        "duplicate_relevance": "Core monetary match feature; identical amounts within a short window indicate high duplicate probability.",
        "description": "Payment amount in the smallest currency sub-unit (e.g., paise for INR).",
        "nullable": False,
    },
    "currency": {
        "name": "currency",
        "data_type": "string",
        "sample_value": "INR",
        "criticality_tier": "Tier 1",
        "criticality_stars": 5,
        "duplicate_relevance": "Monetary partition; comparisons must be isolated within matching ISO-4217 currencies.",
        "description": "Three-letter ISO currency code for the payment.",
        "nullable": False,
    },
    "status": {
        "name": "status",
        "data_type": "string",
        "sample_value": "captured",
        "criticality_tier": "Tier 1",
        "criticality_stars": 5,
        "duplicate_relevance": "Lifecycle state filter; distinguishes double-captures from failed retry attempts.",
        "description": "Current status of the payment (created, authorized, captured, refunded, failed).",
        "nullable": False,
    },
    "order_id": {
        "name": "order_id",
        "data_type": "string",
        "sample_value": "order_DBJOWzybf0sJbb",
        "criticality_tier": "Tier 1",
        "criticality_stars": 5,
        "duplicate_relevance": "Order grouping anchor; multiple captured payments against a single order_id indicate duplicate charge.",
        "description": "ID of the Razorpay order to which the payment is attached.",
        "nullable": True,
    },
    "invoice_id": {
        "name": "invoice_id",
        "data_type": "string",
        "sample_value": "inv_FF3xSgX1sJ4f91",
        "criticality_tier": "Tier 1",
        "criticality_stars": 4,
        "duplicate_relevance": "Invoice correlation anchor; flags duplicate bill/invoice settlements.",
        "description": "ID of the invoice if payment was triggered via Razorpay Invoices.",
        "nullable": True,
    },
    "international": {
        "name": "international",
        "data_type": "boolean",
        "sample_value": False,
        "criticality_tier": "Tier 1",
        "criticality_stars": 3,
        "duplicate_relevance": "Cross-border routing partition; separates domestic and international processing queues.",
        "description": "Indicates whether the card/instrument used was issued internationally.",
        "nullable": False,
    },
    "method": {
        "name": "method",
        "data_type": "string",
        "sample_value": "card",
        "criticality_tier": "Tier 1",
        "criticality_stars": 5,
        "duplicate_relevance": "Instrument router; routes duplicate comparisons to method-specific sub-features (UPI, card, netbanking).",
        "description": "Payment instrument method (card, netbanking, wallet, upi, emi, app).",
        "nullable": False,
    },
    "amount_refunded": {
        "name": "amount_refunded",
        "data_type": "integer",
        "sample_value": 0,
        "criticality_tier": "Tier 1",
        "criticality_stars": 4,
        "duplicate_relevance": "Post-transaction balance audit; detects automated reversal or chargeback of duplicate payment.",
        "description": "Total amount refunded in currency sub-units (e.g., paise).",
        "nullable": False,
    },
    "refund_status": {
        "name": "refund_status",
        "data_type": "string",
        "sample_value": "null",
        "criticality_tier": "Tier 1",
        "criticality_stars": 4,
        "duplicate_relevance": "Settlement resolution tracking; indicates if suspected duplicate has already been refunded.",
        "description": "Status of the refund (null, partial, full).",
        "nullable": True,
    },
    "captured": {
        "name": "captured",
        "data_type": "boolean",
        "sample_value": True,
        "criticality_tier": "Tier 1",
        "criticality_stars": 5,
        "duplicate_relevance": "Financial impact trigger; true flag represents actual money debited and captured.",
        "description": "Indicates whether the payment was captured automatically or manually.",
        "nullable": False,
    },

    # --------------------------------------------------------------------------
    # TIER 2: Transaction & Payment Instrument Specifics (4-star / 5-star)
    # --------------------------------------------------------------------------
    "card_id": {
        "name": "card_id",
        "data_type": "string",
        "sample_value": "card_H2Lz9Hn2h4x3kl",
        "criticality_tier": "Tier 2",
        "criticality_stars": 4,
        "duplicate_relevance": "Instrument identity key; direct token linking repeated transactions on the same card.",
        "description": "Unique ID of the saved or tokenized card entity.",
        "nullable": True,
    },
    "card": {
        "name": "card",
        "data_type": "dict",
        "sample_value": {
            "name": "Gaurav Kumar",
            "last4": "4321",
            "network": "Visa",
            "type": "credit",
            "issuer": "HDFC",
            "international": False,
            "emi": False,
            "sub_type": "consumer",
        },
        "criticality_tier": "Tier 2",
        "criticality_stars": 4,
        "duplicate_relevance": "Card profile matching; cross-matches BIN, last 4 digits, network, and cardholder name.",
        "description": "Detailed dictionary containing card instrument properties.",
        "nullable": True,
    },
    "bank": {
        "name": "bank",
        "data_type": "string",
        "sample_value": "HDFC",
        "criticality_tier": "Tier 2",
        "criticality_stars": 4,
        "duplicate_relevance": "Netbanking gateway correlation; matches source bank channel in netbanking duplicates.",
        "description": "Bank code utilized for netbanking or mandate debit.",
        "nullable": True,
    },
    "wallet": {
        "name": "wallet",
        "data_type": "string",
        "sample_value": "paytm",
        "criticality_tier": "Tier 2",
        "criticality_stars": 4,
        "duplicate_relevance": "Wallet provider match; checks duplicate attempts on identical third-party wallets.",
        "description": "Name of the digital wallet provider (e.g., paytm, mobikwik, freecharge).",
        "nullable": True,
    },
    "vpa": {
        "name": "vpa",
        "data_type": "string",
        "sample_value": "customer@okaxis",
        "criticality_tier": "Tier 2",
        "criticality_stars": 5,
        "duplicate_relevance": "High-fidelity UPI handle match; primary customer identity anchor in UPI transactions.",
        "description": "Virtual Payment Address (VPA) / UPI ID used for payment initiation.",
        "nullable": True,
    },
    "email": {
        "name": "email",
        "data_type": "string",
        "sample_value": "customer@example.com",
        "criticality_tier": "Tier 2",
        "criticality_stars": 4,
        "duplicate_relevance": "Customer identity feature; subjected to exact and fuzzy string similarity for payer correlation.",
        "description": "Customer contact email address passed during checkout.",
        "nullable": False,
    },
    "contact": {
        "name": "contact",
        "data_type": "string",
        "sample_value": "+919876543210",
        "criticality_tier": "Tier 2",
        "criticality_stars": 4,
        "duplicate_relevance": "Customer MSISDN match; normalized E.164 phone matching across candidate transactions.",
        "description": "Customer phone number passed during checkout.",
        "nullable": False,
    },

    # --------------------------------------------------------------------------
    # TIER 3: Operational, Business Metadata & Fee Breakdown (2-star / 4-star)
    # --------------------------------------------------------------------------
    "customer_id": {
        "name": "customer_id",
        "data_type": "string",
        "sample_value": "cust_D65824985fh",
        "criticality_tier": "Tier 3",
        "criticality_stars": 4,
        "duplicate_relevance": "Merchant customer entity link; tracks cross-session repeat attempts by the same customer ID.",
        "description": "Identifier for merchant-created customer record.",
        "nullable": True,
    },
    "token_id": {
        "name": "token_id",
        "data_type": "string",
        "sample_value": "token_10000000000000",
        "criticality_tier": "Tier 3",
        "criticality_stars": 3,
        "duplicate_relevance": "Recurring mandate / saved instrument identifier for subscription duplicate tracking.",
        "description": "ID of recurring subscription token or RBI tokenized card instrument.",
        "nullable": True,
    },
    "fee": {
        "name": "fee",
        "data_type": "integer",
        "sample_value": 100,
        "criticality_tier": "Tier 3",
        "criticality_stars": 3,
        "duplicate_relevance": "Pricing audit feature; ensures fee calculation consistency across duplicates.",
        "description": "Service fee levied by Razorpay for processing the payment (in paise).",
        "nullable": True,
    },
    "tax": {
        "name": "tax",
        "data_type": "integer",
        "sample_value": 18,
        "criticality_tier": "Tier 3",
        "criticality_stars": 3,
        "duplicate_relevance": "Tax component consistency verification across candidate duplicates.",
        "description": "Goods & Services Tax (GST) applied on the service fee (in paise).",
        "nullable": True,
    },
    "error_code": {
        "name": "error_code",
        "data_type": "string",
        "sample_value": "BAD_REQUEST_ERROR",
        "criticality_tier": "Tier 3",
        "criticality_stars": 3,
        "duplicate_relevance": "Failure classification; identifies retry bursts caused by specific gateway error codes.",
        "description": "Standardized error code returned by Razorpay API on payment failure.",
        "nullable": True,
    },
    "error_description": {
        "name": "error_description",
        "data_type": "string",
        "sample_value": "Payment failed due to timeout at issuer bank",
        "criticality_tier": "Tier 3",
        "criticality_stars": 3,
        "duplicate_relevance": "Error context analysis; helps separate user retry loops from system glitches.",
        "description": "Verbose message explaining the reason for transaction failure.",
        "nullable": True,
    },
    "error_source": {
        "name": "error_source",
        "data_type": "string",
        "sample_value": "gateway",
        "criticality_tier": "Tier 3",
        "criticality_stars": 2,
        "duplicate_relevance": "Fault domain localization (customer, gateway, issuer, business).",
        "description": "Origin of the error (e.g., customer, gateway, issuer, internal).",
        "nullable": True,
    },
    "error_step": {
        "name": "error_step",
        "data_type": "string",
        "sample_value": "payment_authorization",
        "criticality_tier": "Tier 3",
        "criticality_stars": 2,
        "duplicate_relevance": "Lifecycle failure point; identifies step where user retried payment.",
        "description": "Workflow phase where error occurred (e.g., payment_initiation, payment_authorization).",
        "nullable": True,
    },
    "error_reason": {
        "name": "error_reason",
        "data_type": "string",
        "sample_value": "payment_cancelled",
        "criticality_tier": "Tier 3",
        "criticality_stars": 2,
        "duplicate_relevance": "Root cause attribution for failure retry classification.",
        "description": "Specific business reason why payment execution failed.",
        "nullable": True,
    },

    # --------------------------------------------------------------------------
    # TIER 4: Audit, Security, Timestamps & Contextual Tags (2-star / 5-star)
    # --------------------------------------------------------------------------
    "acquirer_data": {
        "name": "acquirer_data",
        "data_type": "dict",
        "sample_value": {
            "auth_code": "876543",
            "rrn": "412356789012",
            "bank_transaction_id": "TXN_9988776655",
        },
        "criticality_tier": "Tier 4",
        "criticality_stars": 4,
        "duplicate_relevance": "Banking gateway settlement reconciliation; identical RRN/auth_code confirms identical banking leg.",
        "description": "Key-value dictionary containing acquiring bank response codes, RRN, and reference IDs.",
        "nullable": True,
    },
    "notes": {
        "name": "notes",
        "data_type": "dict",
        "sample_value": {
            "merchant_order_id": "M_ORDER_10928",
            "cart_id": "CART_9988",
            "fulfillment_center": "BLR_01",
        },
        "criticality_tier": "Tier 4",
        "criticality_stars": 4,
        "duplicate_relevance": "Merchant context extraction; key-value mining for custom merchant order/cart references.",
        "description": "User-defined key-value metadata dictionary attached by merchant.",
        "nullable": False,
    },
    "created_at": {
        "name": "created_at",
        "data_type": "integer",
        "sample_value": 1718000000,
        "criticality_tier": "Tier 4",
        "criticality_stars": 5,
        "duplicate_relevance": "Temporal window anchor; drives time-delta calculations and rolling burst velocity windows.",
        "description": "Unix timestamp (in seconds) representing when payment was initiated.",
        "nullable": False,
    },
    "description": {
        "name": "description",
        "data_type": "string",
        "sample_value": "Payment for Cart Checkout #1001",
        "criticality_tier": "Tier 4",
        "criticality_stars": 3,
        "duplicate_relevance": "Contextual description match; checked via semantic and n-gram text similarity.",
        "description": "Optional merchant-provided description of the payment purpose.",
        "nullable": True,
    },
    "base_amount": {
        "name": "base_amount",
        "data_type": "integer",
        "sample_value": 50000,
        "criticality_tier": "Tier 4",
        "criticality_stars": 3,
        "duplicate_relevance": "Cross-currency baseline amount for international multi-currency conversions.",
        "description": "Original base amount in base currency when DCC/multi-currency pricing is applied.",
        "nullable": True,
    },
}


# ==============================================================================
# DUPLICATE DETECTION ENGINEERED FEATURES (25 ADVANCED FEATURES)
# ==============================================================================
DUPLICATE_FEATURES: Dict[str, DuplicateFeatureMetadata] = {
    # --------------------------------------------------------------------------
    # Group 1: Temporal & Velocity Features
    # --------------------------------------------------------------------------
    "time_delta_seconds": {
        "feature_name": "time_delta_seconds",
        "feature_group": "Temporal Dynamics",
        "data_type": "float",
        "detection_task": "Measures elapsed seconds between candidate payment and preceding transaction for same entity.",
        "computation_logic": "abs(current_payment.created_at - candidate_payment.created_at)",
        "importance_weight": 0.95,
        "description": "Temporal decay metric; delta < 300s significantly elevates duplicate charge probability.",
    },
    "burst_velocity_1m": {
        "feature_name": "burst_velocity_1m",
        "feature_group": "Velocity Aggregations",
        "data_type": "integer",
        "detection_task": "Counts total payment attempts from identical customer/card/VPA within a 60-second window.",
        "computation_logic": "COUNT(payments) OVER (PARTITION BY payer_fingerprint RANGE BETWEEN 60 PRECEDING AND CURRENT ROW)",
        "importance_weight": 0.90,
        "description": "Detects rapid-fire double-click checkouts or script-driven retry storms.",
    },
    "burst_velocity_5m": {
        "feature_name": "burst_velocity_5m",
        "feature_group": "Velocity Aggregations",
        "data_type": "integer",
        "detection_task": "Counts total payment attempts from identical customer/card/VPA within a 300-second window.",
        "computation_logic": "COUNT(payments) OVER (PARTITION BY payer_fingerprint RANGE BETWEEN 300 PRECEDING AND CURRENT ROW)",
        "importance_weight": 0.85,
        "description": "Detects short-horizon manual user retries across network lag spikes.",
    },
    "rapid_retry_status_transition": {
        "feature_name": "rapid_retry_status_transition",
        "feature_group": "Lifecycle Transitions",
        "data_type": "boolean",
        "detection_task": "Flags immediate retry execution where previous transaction was left in pending or failed state.",
        "computation_logic": "candidate.created_at - prior.created_at < 180 AND prior.status IN ('created', 'authorized', 'failed')",
        "importance_weight": 0.80,
        "description": "Identifies double payment risk where user re-attempted while first payment was in-flight and later captured.",
    },

    # --------------------------------------------------------------------------
    # Group 2: Financial & Monetary Consistency Features
    # --------------------------------------------------------------------------
    "exact_amount_match": {
        "feature_name": "exact_amount_match",
        "feature_group": "Monetary Comparison",
        "data_type": "boolean",
        "detection_task": "Verifies exact match between payment amounts in paise and ISO currency.",
        "computation_logic": "(p1.amount == p2.amount) and (p1.currency == p2.currency)",
        "importance_weight": 0.92,
        "description": "Fundamental predicate for duplicate detection; binary equality on sub-unit amount.",
    },
    "amount_ratio": {
        "feature_name": "amount_ratio",
        "feature_group": "Monetary Comparison",
        "data_type": "float",
        "detection_task": "Computes ratio of transaction amounts to capture partial settlement or split charges.",
        "computation_logic": "min(p1.amount, p2.amount) / max(p1.amount, p2.amount) if max > 0 else 0.0",
        "importance_weight": 0.65,
        "description": "Measures proportional monetary alignment (1.0 indicates identical amount).",
    },

    # --------------------------------------------------------------------------
    # Group 3: Merchant & Order Identity Correlation
    # --------------------------------------------------------------------------
    "order_id_match": {
        "feature_name": "order_id_match",
        "feature_group": "Entity Correlation",
        "data_type": "boolean",
        "detection_task": "Verifies whether both payments are bound to the exact same Razorpay order_id.",
        "computation_logic": "p1.order_id is not None and p1.order_id == p2.order_id",
        "importance_weight": 0.98,
        "description": "Critical idempotency indicator; two captured payments for one order indicate a double debit.",
    },
    "merchant_notes_order_id_match": {
        "feature_name": "merchant_notes_order_id_match",
        "feature_group": "Entity Correlation",
        "data_type": "boolean",
        "detection_task": "Extracts and matches merchant custom order/cart IDs embedded inside notes dictionary.",
        "computation_logic": "extract_merchant_ref(p1.notes) == extract_merchant_ref(p2.notes) and len(ref) > 0",
        "importance_weight": 0.94,
        "description": "Bypasses fresh Razorpay order creations by anchoring on merchant internal reference keys.",
    },
    "invoice_id_match": {
        "feature_name": "invoice_id_match",
        "feature_group": "Entity Correlation",
        "data_type": "boolean",
        "detection_task": "Verifies whether candidate payments belong to the identical Razorpay invoice.",
        "computation_logic": "p1.invoice_id is not None and p1.invoice_id == p2.invoice_id",
        "importance_weight": 0.88,
        "description": "Flags duplicate payments triggered on reusable customer invoice links.",
    },

    # --------------------------------------------------------------------------
    # Group 4: Customer Identity & Fuzzy Matching
    # --------------------------------------------------------------------------
    "email_exact_match": {
        "feature_name": "email_exact_match",
        "feature_group": "Customer Identity",
        "data_type": "boolean",
        "detection_task": "Verifies exact match on normalized lowercase email address strings.",
        "computation_logic": "p1.email.strip().lower() == p2.email.strip().lower()",
        "importance_weight": 0.82,
        "description": "Standard deterministic customer email equality check.",
    },
    "email_levenshtein_similarity": {
        "feature_name": "email_levenshtein_similarity",
        "feature_group": "Customer Identity",
        "data_type": "float",
        "detection_task": "Calculates Levenshtein edit distance ratio between customer email strings.",
        "computation_logic": "1.0 - (levenshtein_distance(e1, e2) / max(len(e1), len(e2)))",
        "importance_weight": 0.75,
        "description": "Recovers duplicates where user had slight typo during rapid checkout retry.",
    },
    "contact_normalized_match": {
        "feature_name": "contact_normalized_match",
        "feature_group": "Customer Identity",
        "data_type": "boolean",
        "detection_task": "Verifies exact match on E.164 sanitized phone numbers (removing prefixes/spaces).",
        "computation_logic": "normalize_phone(p1.contact) == normalize_phone(p2.contact)",
        "importance_weight": 0.86,
        "description": "Direct phone match invariant to +91 or 0 prefix variations.",
    },
    "contact_last_4_match": {
        "feature_name": "contact_last_4_match",
        "feature_group": "Customer Identity",
        "data_type": "boolean",
        "detection_task": "Checks equality on last 4 digits of contact number when partial masking occurs.",
        "computation_logic": "p1.contact[-4:] == p2.contact[-4:] and len(p1.contact) >= 10",
        "importance_weight": 0.50,
        "description": "Fallback heuristic for masked contact telephone data.",
    },
    "customer_id_match": {
        "feature_name": "customer_id_match",
        "feature_group": "Customer Identity",
        "data_type": "boolean",
        "detection_task": "Matches merchant customer entity identifiers across sessions.",
        "computation_logic": "p1.customer_id is not None and p1.customer_id == p2.customer_id",
        "importance_weight": 0.85,
        "description": "Tracks persistent registered customer duplicate sessions.",
    },

    # --------------------------------------------------------------------------
    # Group 5: Payment Instrument Fingerprinting
    # --------------------------------------------------------------------------
    "vpa_exact_match": {
        "feature_name": "vpa_exact_match",
        "feature_group": "Instrument Fingerprinting",
        "data_type": "boolean",
        "detection_task": "Checks exact case-insensitive match on UPI Virtual Payment Address (VPA).",
        "computation_logic": "p1.vpa.strip().lower() == p2.vpa.strip().lower()",
        "importance_weight": 0.96,
        "description": "Strongest indicator for duplicate UPI payments originating from same account.",
    },
    "vpa_handle_match": {
        "feature_name": "vpa_handle_match",
        "feature_group": "Instrument Fingerprinting",
        "data_type": "boolean",
        "detection_task": "Matches UPI user username prefix across different PSP banking handles.",
        "computation_logic": "p1.vpa.split('@')[0].lower() == p2.vpa.split('@')[0].lower()",
        "importance_weight": 0.72,
        "description": "Captures user switching between GPay (@okaxis) and PhonePe (@ybl) with same username.",
    },
    "card_id_match": {
        "feature_name": "card_id_match",
        "feature_group": "Instrument Fingerprinting",
        "data_type": "boolean",
        "detection_task": "Direct equality check on Razorpay tokenized card_id.",
        "computation_logic": "p1.card_id is not None and p1.card_id == p2.card_id",
        "importance_weight": 0.95,
        "description": "Confirms both transactions utilized the identical saved card token.",
    },
    "card_fingerprint_match": {
        "feature_name": "card_fingerprint_match",
        "feature_group": "Instrument Fingerprinting",
        "data_type": "boolean",
        "detection_task": "Matches composite card signature (issuer + network + last4 + cardholder).",
        "computation_logic": "(p1.card.issuer == p2.card.issuer) and (p1.card.last4 == p2.card.last4) and (p1.card.network == p2.card.network)",
        "importance_weight": 0.91,
        "description": "Robust card matching across non-saved / guest checkout transactions.",
    },
    "bank_code_match": {
        "feature_name": "bank_code_match",
        "feature_group": "Instrument Fingerprinting",
        "data_type": "boolean",
        "detection_task": "Matches Netbanking bank code identifier between candidate payments.",
        "computation_logic": "p1.bank is not None and p1.bank == p2.bank",
        "importance_weight": 0.60,
        "description": "Ensures Netbanking transactions originated through the same institutional gateway.",
    },

    # --------------------------------------------------------------------------
    # Group 6: Banking Settlement & Gateway Audit
    # --------------------------------------------------------------------------
    "acquirer_rrn_match": {
        "feature_name": "acquirer_rrn_match",
        "feature_group": "Settlement Reconciliation",
        "data_type": "boolean",
        "detection_task": "Checks exact collision on Banking Retrieval Reference Number (RRN).",
        "computation_logic": "p1.acquirer_data.get('rrn') == p2.acquirer_data.get('rrn') and len(rrn) > 5",
        "importance_weight": 0.99,
        "description": "Definitive proof of identical banking debit at NPCI / Visa / Mastercard switch.",
    },
    "acquirer_auth_code_match": {
        "feature_name": "acquirer_auth_code_match",
        "feature_group": "Settlement Reconciliation",
        "data_type": "boolean",
        "detection_task": "Matches acquiring bank authorization code.",
        "computation_logic": "p1.acquirer_data.get('auth_code') == p2.acquirer_data.get('auth_code')",
        "importance_weight": 0.85,
        "description": "Validates whether issuer authorized two distinct authorizations or replayed one.",
    },

    # --------------------------------------------------------------------------
    # Group 7: Semantic & Contextual Matching
    # --------------------------------------------------------------------------
    "description_jaccard_similarity": {
        "feature_name": "description_jaccard_similarity",
        "feature_group": "Contextual Similarity",
        "data_type": "float",
        "detection_task": "Computes tokenized Jaccard similarity on payment description strings.",
        "computation_logic": "len(tokens1 & tokens2) / len(tokens1 | tokens2) if (tokens1 | tokens2) else 1.0",
        "importance_weight": 0.60,
        "description": "Quantifies text description overlap between candidate transactions.",
    },
    "method_consistency": {
        "feature_name": "method_consistency",
        "feature_group": "Instrument Fingerprinting",
        "data_type": "boolean",
        "detection_task": "Checks whether the same payment instrument method was attempted.",
        "computation_logic": "p1.method == p2.method",
        "importance_weight": 0.70,
        "description": "Flags whether payer persisted with same instrument or switched payment methods.",
    },
    "error_cascade_similarity": {
        "feature_name": "error_cascade_similarity",
        "feature_group": "Lifecycle Transitions",
        "data_type": "boolean",
        "detection_task": "Identifies matching error_code and error_step sequence prior to successful capture.",
        "computation_logic": "(p1.error_code == p2.error_code) and (p1.error_step == p2.error_step) and p1.error_code is not None",
        "importance_weight": 0.78,
        "description": "Correlates repeated client retry behavior against specific upstream gateway failures.",
    },
    "composite_duplicate_risk_score": {
        "feature_name": "composite_duplicate_risk_score",
        "feature_group": "Ensemble Scoring",
        "data_type": "float",
        "detection_task": "Normalized weighted ensemble probability score (0.0 to 1.0) synthesized from all feature vectors.",
        "computation_logic": "sum(feature_i * weight_i for i in features) / sum(weights)",
        "importance_weight": 1.00,
        "description": "Final calibrated risk score used for automated refund triggering and alerting.",
    },
}


def get_field_by_criticality_tier(tier: Literal["Tier 1", "Tier 2", "Tier 3", "Tier 4"]) -> Dict[str, PaymentFieldMetadata]:
    """
    Filter Razorpay payment schema fields by criticality tier.

    Args:
        tier: Criticality tier ('Tier 1', 'Tier 2', 'Tier 3', or 'Tier 4').

    Returns:
        Dictionary of matching payment fields.
    """
    return {
        field_name: metadata
        for field_name, metadata in RAZORPAY_PAYMENT_FIELDS.items()
        if metadata["criticality_tier"] == tier
    }


def get_features_by_group(group: str) -> Dict[str, DuplicateFeatureMetadata]:
    """
    Filter duplicate detection engineered features by feature group.

    Args:
        group: Feature category group name.

    Returns:
        Dictionary of matching duplicate detection features.
    """
    return {
        feature_name: metadata
        for feature_name, metadata in DUPLICATE_FEATURES.items()
        if metadata["feature_group"].lower() == group.lower()
    }
