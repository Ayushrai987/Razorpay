"""
Production Utility Functions and Logging Infrastructure for Razorpay Duplicate Detection.

This module provides core utilities including:
- Dual-target structured logging (console + output/system.log).
- Financial currency conversion utilities between INR Rupees and sub-unit Paise.
- UTC Unix timestamp generators.
- Robust, pure standard-library .env configuration loader with default fallbacks.
"""

from datetime import datetime, timezone
import logging
import os
from pathlib import Path
import re
import sys
import time
from typing import Any, Callable, Dict, Optional, Type, TypeVar, Union

T = TypeVar("T")


# ==============================================================================
# LOGGING INFRASTRUCTURE
# ==============================================================================
class RazorpayLogFormatter(logging.Formatter):
    """
    Custom enterprise log formatter supporting standard structured formatting
    and ANSI colorization for terminal streams.
    """

    # ANSI Color Escape Codes
    COLOR_RESET: str = "\033[0m"
    COLOR_DEBUG: str = "\033[36m"     # Cyan
    COLOR_INFO: str = "\033[32m"      # Green
    COLOR_WARNING: str = "\033[33m"   # Yellow
    COLOR_ERROR: str = "\033[31m"     # Red
    COLOR_CRITICAL: str = "\033[41m\033[37m"  # White on Red
    COLOR_GREY: str = "\033[90m"      # Grey for metadata

    LOG_FORMAT: str = (
        "%(asctime)s.%(msecs)03d | %(levelname)-8s | [%(name)s] "
        "%(filename)s:%(lineno)d (%(funcName)s) - %(message)s"
    )
    DATE_FORMAT: str = "%Y-%m-%d %H:%M:%S"

    def __init__(self, use_color: bool = False) -> None:
        """
        Initialize the formatter.

        Args:
            use_color: If True, ANSI color codes will be embedded into log records.
        """
        super().__init__(fmt=self.LOG_FORMAT, datefmt=self.DATE_FORMAT)
        self.use_color: bool = use_color

    def format(self, record: logging.LogRecord) -> str:
        """
        Format the specified record into a log string.

        Args:
            record: The LogRecord instance to format.

        Returns:
            Formatted log message string.
        """
        # Save original levelname to restore after formatting
        orig_levelname = record.levelname

        if self.use_color:
            color_map = {
                logging.DEBUG: self.COLOR_DEBUG,
                logging.INFO: self.COLOR_INFO,
                logging.WARNING: self.COLOR_WARNING,
                logging.ERROR: self.COLOR_ERROR,
                logging.CRITICAL: self.COLOR_CRITICAL,
            }
            color = color_map.get(record.levelno, self.COLOR_RESET)
            record.levelname = f"{color}{record.levelname:<8}{self.COLOR_RESET}"

        formatted_msg = super().format(record)
        record.levelname = orig_levelname
        return formatted_msg


def setup_logger(
    name: str = "razorpay_duplicate_engine",
    log_file: str = "output/system.log",
    level: int = logging.INFO,
    console_output: bool = True,
) -> logging.Logger:
    """
    Initialize and configure a production-grade logger instance with dual output
    destinations: standard console (colorized) and a persistent log file.

    Args:
        name: Logger identifier namespace.
        log_file: Relative or absolute path to the persistent system log file.
        level: Root logging threshold level (e.g., logging.INFO, logging.DEBUG).
        console_output: Flag to toggle stdout streaming.

    Returns:
        Configured logging.Logger instance.

    Example:
        >>> logger = setup_logger("payment_pipeline")
        >>> logger.info("Payment pipeline initialized successfully.")
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Avoid duplicate handlers if setup_logger is invoked multiple times
    if logger.hasHandlers():
        logger.handlers.clear()

    logger.propagate = False

    # 1. Console Handler (with ANSI color formatting)
    if console_output:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(level)
        console_handler.setFormatter(RazorpayLogFormatter(use_color=True))
        logger.addHandler(console_handler)

    # 2. Persistent File Handler (plain text formatting)
    if log_file:
        log_path = Path(log_file)
        # Ensure target directory exists
        log_path.parent.mkdir(parents=True, exist_ok=True)

        file_handler = logging.FileHandler(filename=str(log_path), mode="a", encoding="utf-8")
        file_handler.setLevel(level)
        file_handler.setFormatter(RazorpayLogFormatter(use_color=False))
        logger.addHandler(file_handler)

    return logger


# Default system logger instance
logger: logging.Logger = setup_logger()


# ==============================================================================
# FINANCIAL & CURRENCY UTILITIES
# ==============================================================================
def amount_to_rupees(paise: int) -> float:
    """
    Convert payment monetary value from currency sub-units (paise) to INR rupees.

    In the Razorpay payment infrastructure, all monetary amounts are stored
    as integers in paise to prevent IEEE 754 floating-point precision issues.

    Args:
        paise: Monetary amount in paise (integer). Must be non-negative.

    Returns:
        Monetary amount in Indian Rupees (INR) rounded to 2 decimal places.

    Raises:
        TypeError: If paise is not an integer.
        ValueError: If paise is negative.

    Example:
        >>> amount_to_rupees(50000)
        500.0
        >>> amount_to_rupees(12345)
        123.45
    """
    if not isinstance(paise, int) or isinstance(paise, bool):
        raise TypeError(f"Amount in paise must be an integer, received: {type(paise).__name__}")
    if paise < 0:
        raise ValueError(f"Amount in paise cannot be negative, received: {paise}")

    return round(paise / 100.0, 2)


def rupees_to_paise(rupees: Union[float, int]) -> int:
    """
    Convert monetary value from INR rupees to currency sub-units (paise).

    Applies exact arithmetic rounding to mitigate floating-point multiplication
    inaccuracies (e.g., 19.99 * 100 -> 1999 instead of 1998.9999999999998).

    Args:
        rupees: Monetary amount in INR rupees (float or integer). Must be non-negative.

    Returns:
        Monetary amount in paise (integer).

    Raises:
        TypeError: If rupees is not a float or integer.
        ValueError: If rupees is negative.

    Example:
        >>> rupees_to_paise(500.0)
        50000
        >>> rupees_to_paise(123.45)
        12345
    """
    if not isinstance(rupees, (int, float)) or isinstance(rupees, bool):
        raise TypeError(f"Amount in rupees must be a float or integer, received: {type(rupees).__name__}")
    if rupees < 0:
        raise ValueError(f"Amount in rupees cannot be negative, received: {rupees}")

    return int(round(float(rupees) * 100))


def get_unix_timestamp() -> int:
    """
    Generate current UTC Unix epoch timestamp in seconds.

    Returns:
        Integer representing current UTC timestamp in seconds.

    Example:
        >>> ts = get_unix_timestamp()
        >>> isinstance(ts, int)
        True
    """
    return int(datetime.now(timezone.utc).timestamp())


# ==============================================================================
# ROBUST ENVIRONMENT CONFIGURATION LOADER (STANDARD LIBRARY ONLY)
# ==============================================================================
def load_env_config(
    env_file: str = ".env",
    defaults: Optional[Dict[str, Any]] = None,
    override: bool = False,
) -> Dict[str, str]:
    """
    Robust pure standard library .env file parser and environment loader.

    Features:
    - Strips inline comments (`# ...`) and whitespace.
    - Handles single and double-quoted values (`'value'` or `"value"`).
    - Preserves escaped newline sequences.
    - Applies fallback default values if variable is unset.
    - Populates `os.environ` if requested or missing.

    Args:
        env_file: Path to the target .env file.
        defaults: Fallback key-value dictionary for missing configurations.
        override: If True, values in the .env file will overwrite existing `os.environ` keys.

    Returns:
        Dictionary containing merged configuration key-value strings.

    Example:
        >>> config = load_env_config(".env", defaults={"PORT": "8080", "ENV": "development"})
        >>> config.get("PORT")
        '8080'
    """
    config: Dict[str, str] = {}

    # 1. Apply defaults first
    if defaults:
        for key, val in defaults.items():
            config[str(key)] = str(val)

    # 2. Parse .env file if it exists
    env_path = Path(env_file)
    if env_path.is_file():
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line_num, raw_line in enumerate(f, start=1):
                    line = raw_line.strip()
                    # Skip empty lines or full comment lines
                    if not line or line.startswith("#"):
                        continue

                    # Match KEY=VALUE structure
                    match = re.match(r"^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$", line)
                    if not match:
                        continue

                    key, val = match.groups()
                    val = val.strip()

                    # Handle quoted strings and inline comments
                    if val.startswith('"') and '"' in val[1:]:
                        end_quote = val.find('"', 1)
                        val = val[1:end_quote]
                    elif val.startswith("'") and "'" in val[1:]:
                        end_quote = val.find("'", 1)
                        val = val[1:end_quote]
                    else:
                        # Strip inline comment if not quoted
                        val = val.split("#", 1)[0].strip()

                    # Unescape common escape sequences
                    val = val.replace(r"\n", "\n").replace(r"\t", "\t")

                    config[key] = val
        except Exception as exc:
            logger.warning("Failed to parse .env file at %s: %s", env_file, exc)

    # 3. Synchronize with os.environ
    for key, val in config.items():
        if override or key not in os.environ:
            os.environ[key] = val

    return config


def get_env_variable(
    key: str,
    default: Optional[T] = None,
    cast_type: Optional[Type[T]] = None,
    required: bool = False,
) -> Union[T, str, None]:
    """
    Retrieve an environment variable with optional type casting and default fallback.

    Args:
        key: The environment variable key.
        default: Fallback value if environment variable is not present.
        cast_type: Callable type converter (e.g., int, float, bool).
        required: If True, raises ValueError if the key is not found and no default is provided.

    Returns:
        The resolved value cast to the requested type, or default.

    Raises:
        ValueError: If required is True and the key is missing from environment.

    Example:
        >>> port = get_env_variable("PORT", default=8000, cast_type=int)
        >>> is_debug = get_env_variable("DEBUG", default=False, cast_type=bool)
    """
    raw_value = os.environ.get(key)

    if raw_value is None:
        if required and default is None:
            raise ValueError(f"Required environment variable '{key}' is not set.")
        return default

    if cast_type is None:
        return raw_value

    # Handle boolean conversion semantics
    if cast_type is bool:
        return raw_value.strip().lower() in ("1", "true", "yes", "on", "t")  # type: ignore[return-value]

    try:
        return cast_type(raw_value)
    except (ValueError, TypeError) as exc:
        logger.warning(
            "Failed to cast environment variable '%s' (value='%s') to type %s: %s. Using default.",
            key,
            raw_value,
            cast_type.__name__,
            exc,
        )
        return default
