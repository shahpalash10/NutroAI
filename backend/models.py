"""Pydantic models for Nutro AI backend."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class MacroTargets(BaseModel):
    calories: float
    protein: float
    carbs: float
    fats: float


class MacroConsumed(BaseModel):
    calories: float
    protein: float
    carbs: float
    fats: float


class FitnessProfile(BaseModel):
    user_id: str
    name: str
    targets: MacroTargets
    consumed: MacroConsumed
    remaining: MacroTargets
    activity_level: str
    last_workout: str


class MacroInfo(BaseModel):
    calories: float
    protein: float
    carbs: float
    fats: float


class CartItem(BaseModel):
    id: str
    name: str
    source: str  # "food" | "instamart"
    restaurant: str | None = None
    price: float
    quantity: int = 1
    macros: MacroInfo
    in_stock: bool = True


class CartSummary(BaseModel):
    items: list[CartItem]
    total_price: float
    total_macros: MacroInfo
    checkout_url: str | None = None


class TerminalLogLevel(str, Enum):
    CALLING = "calling"
    PARSING = "parsing"
    EXECUTING = "executing"
    SUCCESS = "success"
    ERROR = "error"
    INFO = "info"


class TerminalLog(BaseModel):
    id: str
    timestamp: str
    level: TerminalLogLevel
    server: str
    tool: str
    message: str
    payload: dict[str, Any] | None = None


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


class AgentResult(BaseModel):
    message: str
    logs: list[TerminalLog]
    cart: CartSummary | None = None
    profile: FitnessProfile | None = None


class JsonRpcRequest(BaseModel):
    jsonrpc: str = "2.0"
    id: str | int
    method: str
    params: dict[str, Any] = Field(default_factory=dict)


class JsonRpcResponse(BaseModel):
    jsonrpc: str = "2.0"
    id: str | int
    result: Any | None = None
    error: dict[str, Any] | None = None


class Address(BaseModel):
    address_id: str
    label: str
    line1: str
    city: str
    pincode: str
    lat: float
    lng: float


class FoodItem(BaseModel):
    item_id: str
    name: str
    restaurant_id: str
    restaurant_name: str
    price: float
    rating: float
    cuisine: str
    macros: MacroInfo
    in_stock: bool = True
    tags: list[str] = Field(default_factory=list)


class GroceryProduct(BaseModel):
    product_id: str
    name: str
    brand: str
    price: float
    unit: str
    macros: MacroInfo
    in_stock: bool = True
    category: str


def utc_now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"
