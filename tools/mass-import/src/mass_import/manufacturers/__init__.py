"""Manufacturer adapters for mass-import (LOCAL ONLY)."""

from .base import ManufacturerAdapter, get_adapter
from .jub import JubAdapter
from .poli_farbe import PoliFarbeAdapter
from .ppg_trilak import PpgTrilakAdapter

__all__ = [
    "ManufacturerAdapter",
    "get_adapter",
    "PpgTrilakAdapter",
    "PoliFarbeAdapter",
    "JubAdapter",
]
