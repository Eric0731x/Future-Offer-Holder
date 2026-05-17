"""模型协议适配。"""

from offer_reserve.ai.providers.base import ModelProvider, ProviderConfig
from offer_reserve.ai.providers.openai_compat import OpenAICompatProvider
from offer_reserve.ai.providers.anthropic_compat import AnthropicProvider
from offer_reserve.ai.providers.custom import CustomProvider

__all__ = [
    "ModelProvider",
    "ProviderConfig",
    "OpenAICompatProvider",
    "AnthropicProvider",
    "CustomProvider",
    "build_provider",
]


def build_provider(cfg: ProviderConfig) -> ModelProvider:
    proto = (cfg.protocol or "").lower()
    if proto in ("openai", "openai_compat", "openai兼容", "openai 兼容"):
        return OpenAICompatProvider(cfg)
    if proto in ("anthropic", "claude"):
        return AnthropicProvider(cfg)
    return CustomProvider(cfg)
