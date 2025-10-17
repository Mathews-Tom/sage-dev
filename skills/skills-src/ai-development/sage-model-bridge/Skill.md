---
name: Sage Model Bridge
description: Create integration boilerplate for multiple LLM providers, complete with error handling, streaming support, retries, and cost tracking.
version: 1.0.0
dependencies: python>=3.12, requests, grpcio
---

# Sage Model Bridge

Seamless LLM provider integration with production-ready boilerplate.

## Purpose

Generate robust integration code for connecting to multiple LLM providers (OpenAI, Anthropic, Cohere, local models) with error handling, streaming, retries, rate limiting, and cost tracking built-in.

## When to Use

- Integrating LLM providers into applications
- Building multi-provider LLM routers
- Implementing fallback strategies across providers
- Adding streaming support for real-time responses
- Tracking LLM costs and usage
- Building local LLM inference pipelines

## Core Workflow

### 1. Provider Client Generation

Generate unified client interfaces for multiple providers:

```python
from abc import ABC, abstractmethod
from typing import Protocol, AsyncIterator
from dataclasses import dataclass
from enum import Enum

class ModelProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    COHERE = "cohere"
    LOCAL = "local"

@dataclass
class Message:
    role: str  # "system", "user", "assistant"
    content: str

@dataclass
class CompletionRequest:
    messages: list[Message]
    model: str
    temperature: float = 0.7
    max_tokens: int | None = None
    stream: bool = False

@dataclass
class CompletionResponse:
    content: str
    model: str
    provider: ModelProvider
    usage: dict[str, int]
    finish_reason: str

class LLMProvider(Protocol):
    """Protocol for LLM provider clients."""

    async def complete(self, request: CompletionRequest) -> CompletionResponse:
        """Generate completion."""
        ...

    async def stream(self, request: CompletionRequest) -> AsyncIterator[str]:
        """Stream completion chunks."""
        ...

    async def get_embeddings(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings."""
        ...
```

### 2. OpenAI Integration

```python
from openai import AsyncOpenAI
import os

class OpenAIProvider:
    """OpenAI API client with error handling and retries."""

    def __init__(
        self,
        api_key: str | None = None,
        organization: str | None = None,
        timeout: int = 60
    ):
        self.client = AsyncOpenAI(
            api_key=api_key or os.environ["OPENAI_API_KEY"],
            organization=organization,
            timeout=timeout
        )

    async def complete(self, request: CompletionRequest) -> CompletionResponse:
        """Generate completion with OpenAI."""
        try:
            response = await self.client.chat.completions.create(
                model=request.model,
                messages=[{"role": m.role, "content": m.content} for m in request.messages],
                temperature=request.temperature,
                max_tokens=request.max_tokens,
            )

            return CompletionResponse(
                content=response.choices[0].message.content,
                model=response.model,
                provider=ModelProvider.OPENAI,
                usage={
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                },
                finish_reason=response.choices[0].finish_reason
            )
        except Exception as e:
            raise ProviderError(f"OpenAI request failed: {str(e)}") from e

    async def stream(self, request: CompletionRequest) -> AsyncIterator[str]:
        """Stream completion chunks."""
        try:
            stream = await self.client.chat.completions.create(
                model=request.model,
                messages=[{"role": m.role, "content": m.content} for m in request.messages],
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                stream=True,
            )

            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            raise ProviderError(f"OpenAI streaming failed: {str(e)}") from e
```

### 3. Anthropic Integration

```python
from anthropic import AsyncAnthropic

class AnthropicProvider:
    """Anthropic API client."""

    def __init__(self, api_key: str | None = None):
        self.client = AsyncAnthropic(
            api_key=api_key or os.environ["ANTHROPIC_API_KEY"]
        )

    async def complete(self, request: CompletionRequest) -> CompletionResponse:
        """Generate completion with Claude."""
        # Extract system message
        system_msg = next(
            (m.content for m in request.messages if m.role == "system"),
            None
        )
        messages = [
            {"role": m.role, "content": m.content}
            for m in request.messages
            if m.role != "system"
        ]

        try:
            response = await self.client.messages.create(
                model=request.model,
                system=system_msg,
                messages=messages,
                temperature=request.temperature,
                max_tokens=request.max_tokens or 4096,
            )

            return CompletionResponse(
                content=response.content[0].text,
                model=response.model,
                provider=ModelProvider.ANTHROPIC,
                usage={
                    "prompt_tokens": response.usage.input_tokens,
                    "completion_tokens": response.usage.output_tokens,
                    "total_tokens": response.usage.input_tokens + response.usage.output_tokens,
                },
                finish_reason=response.stop_reason
            )
        except Exception as e:
            raise ProviderError(f"Anthropic request failed: {str(e)}") from e

    async def stream(self, request: CompletionRequest) -> AsyncIterator[str]:
        """Stream completion chunks."""
        system_msg = next(
            (m.content for m in request.messages if m.role == "system"),
            None
        )
        messages = [
            {"role": m.role, "content": m.content}
            for m in request.messages
            if m.role != "system"
        ]

        try:
            async with self.client.messages.stream(
                model=request.model,
                system=system_msg,
                messages=messages,
                temperature=request.temperature,
                max_tokens=request.max_tokens or 4096,
            ) as stream:
                async for text in stream.text_stream:
                    yield text
        except Exception as e:
            raise ProviderError(f"Anthropic streaming failed: {str(e)}") from e
```

### 4. Error Handling & Retries

```python
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)
import httpx

class ProviderError(Exception):
    """Base exception for provider errors."""
    pass

class RateLimitError(ProviderError):
    """Rate limit exceeded."""
    pass

class APIError(ProviderError):
    """API returned an error."""
    pass

@retry(
    retry=retry_if_exception_type((RateLimitError, httpx.TimeoutException)),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
)
async def call_with_retry(provider: LLMProvider, request: CompletionRequest) -> CompletionResponse:
    """Call provider with exponential backoff retry."""
    try:
        return await provider.complete(request)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            raise RateLimitError("Rate limit exceeded") from e
        elif e.response.status_code >= 500:
            raise APIError(f"Server error: {e.response.status_code}") from e
        else:
            raise ProviderError(f"API error: {e.response.status_code}") from e
```

### 5. Multi-Provider Router

```python
from typing import Literal

class LLMRouter:
    """Route requests to different providers with fallback."""

    def __init__(self):
        self.providers: dict[ModelProvider, LLMProvider] = {
            ModelProvider.OPENAI: OpenAIProvider(),
            ModelProvider.ANTHROPIC: AnthropicProvider(),
        }
        self.fallback_order = [
            ModelProvider.OPENAI,
            ModelProvider.ANTHROPIC,
        ]

    async def complete(
        self,
        request: CompletionRequest,
        preferred_provider: ModelProvider | None = None
    ) -> CompletionResponse:
        """Complete with fallback to alternative providers."""
        providers_to_try = (
            [preferred_provider] + self.fallback_order
            if preferred_provider
            else self.fallback_order
        )

        last_error = None
        for provider_type in providers_to_try:
            provider = self.providers.get(provider_type)
            if not provider:
                continue

            try:
                return await call_with_retry(provider, request)
            except ProviderError as e:
                last_error = e
                continue

        raise ProviderError(f"All providers failed. Last error: {last_error}")

    async def stream(
        self,
        request: CompletionRequest,
        provider: ModelProvider = ModelProvider.OPENAI
    ) -> AsyncIterator[str]:
        """Stream from specific provider."""
        provider_client = self.providers[provider]
        async for chunk in provider_client.stream(request):
            yield chunk
```

### 6. Cost Tracking

```python
from datetime import datetime
from collections import defaultdict
import json

# Pricing per 1M tokens (as of 2024)
PRICING = {
    "gpt-4-turbo": {"input": 10.0, "output": 30.0},
    "gpt-4": {"input": 30.0, "output": 60.0},
    "gpt-3.5-turbo": {"input": 0.5, "output": 1.5},
    "claude-3-opus-20240229": {"input": 15.0, "output": 75.0},
    "claude-3-sonnet-20240229": {"input": 3.0, "output": 15.0},
    "claude-3-haiku-20240307": {"input": 0.25, "output": 1.25},
}

class CostTracker:
    """Track LLM usage and costs."""

    def __init__(self):
        self.usage: dict[str, dict] = defaultdict(lambda: {
            "requests": 0,
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_cost": 0.0,
        })

    def record(self, response: CompletionResponse):
        """Record usage from a completion response."""
        model = response.model
        usage = response.usage

        self.usage[model]["requests"] += 1
        self.usage[model]["prompt_tokens"] += usage["prompt_tokens"]
        self.usage[model]["completion_tokens"] += usage["completion_tokens"]

        # Calculate cost
        if model in PRICING:
            pricing = PRICING[model]
            cost = (
                (usage["prompt_tokens"] / 1_000_000) * pricing["input"] +
                (usage["completion_tokens"] / 1_000_000) * pricing["output"]
            )
            self.usage[model]["total_cost"] += cost

    def get_stats(self) -> dict:
        """Get usage statistics."""
        total_cost = sum(data["total_cost"] for data in self.usage.values())
        total_tokens = sum(
            data["prompt_tokens"] + data["completion_tokens"]
            for data in self.usage.values()
        )

        return {
            "by_model": dict(self.usage),
            "total_cost": total_cost,
            "total_tokens": total_tokens,
            "timestamp": datetime.utcnow().isoformat(),
        }

    def export_json(self, filepath: str):
        """Export usage stats to JSON."""
        with open(filepath, 'w') as f:
            json.dump(self.get_stats(), f, indent=2)
```

### 7. Rate Limiting

```python
import asyncio
from datetime import datetime, timedelta

class RateLimiter:
    """Token bucket rate limiter."""

    def __init__(
        self,
        rate: int,  # requests per minute
        burst: int | None = None  # max burst size
    ):
        self.rate = rate
        self.burst = burst or rate
        self.tokens = self.burst
        self.last_update = datetime.now()
        self.lock = asyncio.Lock()

    async def acquire(self):
        """Acquire permission to make a request."""
        async with self.lock:
            now = datetime.now()
            elapsed = (now - self.last_update).total_seconds()

            # Refill tokens
            self.tokens = min(
                self.burst,
                self.tokens + elapsed * (self.rate / 60)
            )
            self.last_update = now

            if self.tokens >= 1:
                self.tokens -= 1
                return

            # Wait for next token
            wait_time = (1 - self.tokens) / (self.rate / 60)
            await asyncio.sleep(wait_time)
            self.tokens = 0
            self.last_update = datetime.now()
```

### 8. Local Model Integration

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

class LocalLLMProvider:
    """Local model provider using HuggingFace Transformers."""

    def __init__(self, model_name: str = "meta-llama/Llama-2-7b-chat-hf"):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
            device_map="auto"
        )

    async def complete(self, request: CompletionRequest) -> CompletionResponse:
        """Generate completion with local model."""
        # Format messages into prompt
        prompt = self._format_messages(request.messages)

        # Tokenize
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)

        # Generate
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=request.max_tokens or 512,
                temperature=request.temperature,
                do_sample=True,
            )

        # Decode
        generated_text = self.tokenizer.decode(
            outputs[0][inputs['input_ids'].shape[1]:],
            skip_special_tokens=True
        )

        return CompletionResponse(
            content=generated_text,
            model=request.model,
            provider=ModelProvider.LOCAL,
            usage={
                "prompt_tokens": inputs['input_ids'].shape[1],
                "completion_tokens": outputs.shape[1] - inputs['input_ids'].shape[1],
                "total_tokens": outputs.shape[1],
            },
            finish_reason="stop"
        )

    def _format_messages(self, messages: list[Message]) -> str:
        """Format messages into model-specific prompt."""
        # Llama-2 chat format
        formatted = "<s>"
        for msg in messages:
            if msg.role == "system":
                formatted += f"<<SYS>>\n{msg.content}\n<</SYS>>\n\n"
            elif msg.role == "user":
                formatted += f"[INST] {msg.content} [/INST]"
            elif msg.role == "assistant":
                formatted += f"{msg.content}</s><s>[INST] "
        return formatted
```

## Best Practices

1. **Error Handling**: Implement retries with exponential backoff
2. **Rate Limiting**: Respect provider rate limits
3. **Cost Tracking**: Monitor usage and costs in real-time
4. **Timeouts**: Set appropriate timeout values
5. **Fallbacks**: Have backup providers configured
6. **Streaming**: Use streaming for real-time UX
7. **Caching**: Cache responses when appropriate
8. **Monitoring**: Log all requests and errors

## Quality Checklist

- [ ] Multiple provider support
- [ ] Retry logic with exponential backoff
- [ ] Rate limiting implementation
- [ ] Cost tracking enabled
- [ ] Error handling for all failure modes
- [ ] Streaming support
- [ ] Timeout configuration
- [ ] Logging and monitoring
- [ ] API key management (env vars)
- [ ] Type hints throughout
