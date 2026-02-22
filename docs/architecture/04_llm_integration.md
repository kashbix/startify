# 🤖 LLM Integration Architecture

## 1. Overview

STRATA-AI uses a **provider-agnostic LLM abstraction layer** that enables seamless switching between multiple AI providers without changing application code.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                                    │
│                                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                    │
│   │  Ideation   │    │  Roadmap    │    │  Insights   │                    │
│   │  Service    │    │  Service    │    │  Service    │                    │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                    │
│          │                  │                  │                            │
│          └──────────────────┼──────────────────┘                            │
│                             │                                                │
│                             ▼                                                │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                    LLM ABSTRACTION LAYER                             │  │
│   │  ┌─────────────────────────────────────────────────────────────┐    │  │
│   │  │                  LLMService Interface                        │    │  │
│   │  │  • generate_completion(prompt, config) -> str                │    │  │
│   │  │  • stream_completion(prompt, config) -> AsyncIterator        │    │  │
│   │  │  • generate_structured(prompt, schema, config) -> dict       │    │  │
│   │  └─────────────────────────────────────────────────────────────┘    │  │
│   │                             │                                        │  │
│   │                             ▼                                        │  │
│   │  ┌─────────────────────────────────────────────────────────────┐    │  │
│   │  │                   Provider Factory                           │    │  │
│   │  │  • get_provider(name) -> LLMProvider                         │    │  │
│   │  │  • get_fallback_chain() -> List[LLMProvider]                 │    │  │
│   │  └─────────────────────────────────────────────────────────────┘    │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LLM PROVIDERS                                       │
│                                                                              │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────┐  │
│   │   Groq    │  │  Gemini   │  │  OpenAI   │  │  Ollama   │  │ Custom  │  │
│   │ (Default) │  │           │  │           │  │  (Local)  │  │Endpoint │  │
│   └───────────┘  └───────────┘  └───────────┘  └───────────┘  └─────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Provider Configuration

### 2.1 Environment Variables

```bash
# Primary Provider (required)
LLM_PROVIDER=groq                          # groq | gemini | openai | ollama | custom

# Provider API Keys
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxx

# Ollama Configuration (for local deployment)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:70b

# Custom OpenAI-Compatible Endpoint
CUSTOM_LLM_BASE_URL=https://api.custom-provider.com/v1
CUSTOM_LLM_API_KEY=custom_key_xxxxx
CUSTOM_LLM_MODEL=custom-model-name

# Fallback Configuration
LLM_FALLBACK_ENABLED=true
LLM_FALLBACK_CHAIN=groq,gemini             # comma-separated provider names

# Timeout & Retry
LLM_TIMEOUT_SECONDS=30
LLM_MAX_RETRIES=3
LLM_RETRY_DELAY_SECONDS=1
```

### 2.2 Provider Comparison

| Provider | Model | Free Tier | Speed | Quality | Privacy |
|----------|-------|-----------|-------|---------|---------|
| **Groq** (Default) | Llama 3.1 70B | ~30 req/min | ⚡ Fastest | ★★★★☆ | Cloud |
| **Gemini** | Gemini 1.5 Flash | 60 req/min | Fast | ★★★★☆ | Cloud |
| **OpenAI** | GPT-3.5-turbo | Paid only | Medium | ★★★★☆ | Cloud |
| **OpenAI** | GPT-4 | Paid only | Slow | ★★★★★ | Cloud |
| **Ollama** | Llama 3.1 (local) | Unlimited | Varies | ★★★★☆ | ✅ Local |
| **Custom** | Any compatible | Varies | Varies | Varies | Varies |

## 3. Architecture Components

### 3.1 LLM Provider Interface

```python
# app/llm/base.py

from abc import ABC, abstractmethod
from typing import AsyncIterator, Optional
from pydantic import BaseModel

class LLMConfig(BaseModel):
    """Configuration for LLM requests."""
    temperature: float = 0.7
    max_tokens: int = 2000
    top_p: float = 0.9
    stop_sequences: list[str] = []
    
class LLMResponse(BaseModel):
    """Standardized LLM response."""
    content: str
    provider: str
    model: str
    usage: dict  # tokens used
    latency_ms: int

class LLMProvider(ABC):
    """Abstract base class for LLM providers."""
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Provider name identifier."""
        pass
    
    @property
    @abstractmethod
    def default_model(self) -> str:
        """Default model for this provider."""
        pass
    
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        config: Optional[LLMConfig] = None
    ) -> LLMResponse:
        """Generate a completion."""
        pass
    
    @abstractmethod
    async def stream(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        config: Optional[LLMConfig] = None
    ) -> AsyncIterator[str]:
        """Stream a completion."""
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """Check if provider is available."""
        pass
```

### 3.2 Provider Implementations

#### Groq Provider

```python
# app/llm/providers/groq.py

from groq import AsyncGroq
from ..base import LLMProvider, LLMConfig, LLMResponse

class GroqProvider(LLMProvider):
    """Groq API provider - fastest inference."""
    
    def __init__(self, api_key: str):
        self.client = AsyncGroq(api_key=api_key)
        self._model = "llama-3.1-70b-versatile"
    
    @property
    def name(self) -> str:
        return "groq"
    
    @property
    def default_model(self) -> str:
        return self._model
    
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        config: Optional[LLMConfig] = None
    ) -> LLMResponse:
        config = config or LLMConfig()
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        start_time = time.time()
        
        response = await self.client.chat.completions.create(
            model=self._model,
            messages=messages,
            temperature=config.temperature,
            max_tokens=config.max_tokens,
            top_p=config.top_p
        )
        
        latency_ms = int((time.time() - start_time) * 1000)
        
        return LLMResponse(
            content=response.choices[0].message.content,
            provider=self.name,
            model=self._model,
            usage={
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            },
            latency_ms=latency_ms
        )
    
    async def stream(self, prompt: str, ...) -> AsyncIterator[str]:
        # Streaming implementation
        ...
    
    async def health_check(self) -> bool:
        try:
            await self.generate("Hi", config=LLMConfig(max_tokens=5))
            return True
        except Exception:
            return False
```

#### Gemini Provider

```python
# app/llm/providers/gemini.py

import google.generativeai as genai
from ..base import LLMProvider, LLMConfig, LLMResponse

class GeminiProvider(LLMProvider):
    """Google Gemini API provider."""
    
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self._model = "gemini-1.5-flash"
        self.client = genai.GenerativeModel(self._model)
    
    @property
    def name(self) -> str:
        return "gemini"
    
    @property
    def default_model(self) -> str:
        return self._model
    
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        config: Optional[LLMConfig] = None
    ) -> LLMResponse:
        config = config or LLMConfig()
        
        full_prompt = prompt
        if system_prompt:
            full_prompt = f"{system_prompt}\n\n{prompt}"
        
        start_time = time.time()
        
        response = await self.client.generate_content_async(
            full_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=config.temperature,
                max_output_tokens=config.max_tokens,
                top_p=config.top_p
            )
        )
        
        latency_ms = int((time.time() - start_time) * 1000)
        
        return LLMResponse(
            content=response.text,
            provider=self.name,
            model=self._model,
            usage={"total_tokens": response.usage_metadata.total_token_count},
            latency_ms=latency_ms
        )
```

#### Ollama Provider (Local)

```python
# app/llm/providers/ollama.py

import httpx
from ..base import LLMProvider, LLMConfig, LLMResponse

class OllamaProvider(LLMProvider):
    """Ollama local deployment provider - maximum privacy."""
    
    def __init__(self, base_url: str, model: str = "llama3.1:70b"):
        self.base_url = base_url.rstrip("/")
        self._model = model
        self.client = httpx.AsyncClient(timeout=60.0)
    
    @property
    def name(self) -> str:
        return "ollama"
    
    @property
    def default_model(self) -> str:
        return self._model
    
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        config: Optional[LLMConfig] = None
    ) -> LLMResponse:
        config = config or LLMConfig()
        
        payload = {
            "model": self._model,
            "prompt": prompt,
            "system": system_prompt or "",
            "stream": False,
            "options": {
                "temperature": config.temperature,
                "num_predict": config.max_tokens,
                "top_p": config.top_p
            }
        }
        
        start_time = time.time()
        
        response = await self.client.post(
            f"{self.base_url}/api/generate",
            json=payload
        )
        response.raise_for_status()
        data = response.json()
        
        latency_ms = int((time.time() - start_time) * 1000)
        
        return LLMResponse(
            content=data["response"],
            provider=self.name,
            model=self._model,
            usage={
                "prompt_tokens": data.get("prompt_eval_count", 0),
                "completion_tokens": data.get("eval_count", 0)
            },
            latency_ms=latency_ms
        )
    
    async def health_check(self) -> bool:
        try:
            response = await self.client.get(f"{self.base_url}/api/tags")
            return response.status_code == 200
        except Exception:
            return False
```

### 3.3 Provider Factory

```python
# app/llm/factory.py

from typing import Optional
from .base import LLMProvider
from .providers.groq import GroqProvider
from .providers.gemini import GeminiProvider
from .providers.openai import OpenAIProvider
from .providers.ollama import OllamaProvider
from .providers.custom import CustomProvider
from app.config import settings

class ProviderFactory:
    """Factory for creating and managing LLM providers."""
    
    _providers: dict[str, LLMProvider] = {}
    
    @classmethod
    def get_provider(cls, name: Optional[str] = None) -> LLMProvider:
        """Get provider by name, or default provider."""
        name = name or settings.LLM_PROVIDER
        
        if name not in cls._providers:
            cls._providers[name] = cls._create_provider(name)
        
        return cls._providers[name]
    
    @classmethod
    def _create_provider(cls, name: str) -> LLMProvider:
        """Create a new provider instance."""
        match name:
            case "groq":
                return GroqProvider(api_key=settings.GROQ_API_KEY)
            case "gemini":
                return GeminiProvider(api_key=settings.GEMINI_API_KEY)
            case "openai":
                return OpenAIProvider(api_key=settings.OPENAI_API_KEY)
            case "ollama":
                return OllamaProvider(
                    base_url=settings.OLLAMA_BASE_URL,
                    model=settings.OLLAMA_MODEL
                )
            case "custom":
                return CustomProvider(
                    base_url=settings.CUSTOM_LLM_BASE_URL,
                    api_key=settings.CUSTOM_LLM_API_KEY,
                    model=settings.CUSTOM_LLM_MODEL
                )
            case _:
                raise ValueError(f"Unknown provider: {name}")
    
    @classmethod
    def get_fallback_chain(cls) -> list[LLMProvider]:
        """Get ordered list of fallback providers."""
        if not settings.LLM_FALLBACK_ENABLED:
            return [cls.get_provider()]
        
        chain = []
        for name in settings.LLM_FALLBACK_CHAIN:
            try:
                chain.append(cls.get_provider(name))
            except Exception:
                continue
        
        return chain if chain else [cls.get_provider()]
```

### 3.4 LLM Service (Main Interface)

```python
# app/llm/service.py

from typing import Optional, AsyncIterator
from .base import LLMConfig, LLMResponse
from .factory import ProviderFactory
from app.config import settings
import asyncio

class LLMService:
    """Main service for LLM interactions with fallback support."""
    
    @classmethod
    async def generate(
        cls,
        prompt: str,
        system_prompt: Optional[str] = None,
        config: Optional[LLMConfig] = None,
        provider_name: Optional[str] = None
    ) -> LLMResponse:
        """
        Generate a completion with automatic fallback.
        
        Args:
            prompt: User prompt
            system_prompt: System instructions
            config: Generation configuration
            provider_name: Specific provider to use (overrides default)
        
        Returns:
            LLMResponse with content and metadata
        
        Raises:
            LLMError: If all providers fail
        """
        if provider_name:
            # Use specific provider, no fallback
            provider = ProviderFactory.get_provider(provider_name)
            return await cls._generate_with_retry(
                provider, prompt, system_prompt, config
            )
        
        # Use fallback chain
        providers = ProviderFactory.get_fallback_chain()
        last_error = None
        
        for provider in providers:
            try:
                return await cls._generate_with_retry(
                    provider, prompt, system_prompt, config
                )
            except Exception as e:
                last_error = e
                continue
        
        raise LLMError(f"All providers failed. Last error: {last_error}")
    
    @classmethod
    async def _generate_with_retry(
        cls,
        provider,
        prompt: str,
        system_prompt: Optional[str],
        config: Optional[LLMConfig]
    ) -> LLMResponse:
        """Generate with retry logic."""
        for attempt in range(settings.LLM_MAX_RETRIES):
            try:
                return await asyncio.wait_for(
                    provider.generate(prompt, system_prompt, config),
                    timeout=settings.LLM_TIMEOUT_SECONDS
                )
            except asyncio.TimeoutError:
                if attempt == settings.LLM_MAX_RETRIES - 1:
                    raise
                await asyncio.sleep(settings.LLM_RETRY_DELAY_SECONDS * (attempt + 1))
            except Exception as e:
                if attempt == settings.LLM_MAX_RETRIES - 1:
                    raise
                await asyncio.sleep(settings.LLM_RETRY_DELAY_SECONDS)
    
    @classmethod
    async def stream(
        cls,
        prompt: str,
        system_prompt: Optional[str] = None,
        config: Optional[LLMConfig] = None
    ) -> AsyncIterator[str]:
        """Stream a completion (no fallback for streaming)."""
        provider = ProviderFactory.get_provider()
        async for chunk in provider.stream(prompt, system_prompt, config):
            yield chunk
    
    @classmethod
    async def health_check(cls) -> dict:
        """Check health of all configured providers."""
        results = {}
        for name in ["groq", "gemini", "openai", "ollama"]:
            try:
                provider = ProviderFactory.get_provider(name)
                results[name] = await provider.health_check()
            except Exception:
                results[name] = False
        return results
```

## 4. Prompt Templates

### 4.1 Prompt Template System

```python
# app/llm/prompts/base.py

from string import Template
from typing import Any

class PromptTemplate:
    """Base class for prompt templates."""
    
    def __init__(self, template: str, system_prompt: str = ""):
        self.template = Template(template)
        self.system_prompt = system_prompt
    
    def format(self, **kwargs: Any) -> tuple[str, str]:
        """Return (user_prompt, system_prompt) tuple."""
        return self.template.safe_substitute(**kwargs), self.system_prompt
```

### 4.2 Ideation Prompt

```python
# app/llm/prompts/ideation.py

IDEATION_SYSTEM_PROMPT = """You are a strategic business advisor for early-stage startups. 
Your role is to generate actionable, realistic pivot and expansion ideas based on the startup's context.

Guidelines:
- Suggest 3-5 ideas, ranked by feasibility given the team's skills and resources
- Be specific and actionable, not generic
- Consider the financial constraints provided
- Each idea should have a clear path to revenue
- Include honest assessments of risks and requirements

Output your response as valid JSON matching the provided schema."""

IDEATION_USER_TEMPLATE = """
## Startup Context

**Company:** $startup_name
**Industry:** $industry
**Stage:** $stage
**Product:** $product_description

**Team:**
- Size: $team_size people
- Key Skills: $team_roles
- Founder Background: $founder_background

**Target Market:** $target_market
**Customer Segments:** $customer_segments

**Financial Constraints:**
- Available Cash: $$cash_balance
- Monthly Burn: $$monthly_burn
- Runway: $runway_months months
- Max Investment for Pivot: $$max_investment

**Additional Context:**
$additional_context

**Focus Areas:** $focus_areas

---

Generate 3-5 pivot or expansion ideas for this startup. For each idea, provide:
1. Title (concise)
2. Description (2-3 sentences)
3. Rationale (why this makes sense for this specific startup)
4. Feasibility Score (1-10 based on team skills and resources)
5. Market Opportunity (low/medium/high)
6. Required Investment (estimated $)
7. Time to First Revenue (months)
8. Required Skills (list)
9. Key Risks (list)
10. First Steps (3 concrete actions)

Return as JSON array.
"""

IDEATION_TEMPLATE = PromptTemplate(
    template=IDEATION_USER_TEMPLATE,
    system_prompt=IDEATION_SYSTEM_PROMPT
)
```

### 4.3 Roadmap Prompt

```python
# app/llm/prompts/roadmap.py

ROADMAP_SYSTEM_PROMPT = """You are a project planning expert for startups.
Your role is to create detailed, actionable execution roadmaps.

Guidelines:
- Break down into 3-5 phases
- Each phase should have clear deliverables and KPIs
- Tasks should be specific and completable in 1-3 days each
- Consider resource constraints
- Include realistic time estimates
- Identify dependencies and risks

Output your response as valid JSON matching the provided schema."""

ROADMAP_USER_TEMPLATE = """
## Idea to Execute

**Title:** $idea_title
**Description:** $idea_description

## Startup Context

**Team Size:** $team_size
**Available Skills:** $team_roles
**Budget for This Initiative:** $$budget
**Team Availability:** $team_availability

## Constraints

**Maximum Duration:** $max_duration_weeks weeks
**Start Date:** $start_date

---

Create a detailed execution roadmap with:

For each phase:
1. Phase name and description
2. Duration in weeks
3. Specific tasks (5-10 per phase)
4. KPIs to measure success
5. Required resources
6. Estimated costs
7. Risks and mitigation

Return as JSON with phases array.
"""

ROADMAP_TEMPLATE = PromptTemplate(
    template=ROADMAP_USER_TEMPLATE,
    system_prompt=ROADMAP_SYSTEM_PROMPT
)
```

### 4.4 Insights Prompt

```python
# app/llm/prompts/insights.py

INSIGHTS_SYSTEM_PROMPT = """You are a financial analyst for startups.
Analyze the provided financial data and generate actionable insights.

Guidelines:
- Identify trends (positive and negative)
- Flag potential issues early
- Suggest specific actions
- Be concise but specific
- Prioritize by urgency/impact

Output as JSON array of insights."""

INSIGHTS_USER_TEMPLATE = """
## Financial Data (Last 6 Months)

$financial_history

## Current Metrics
- Runway: $runway_months months
- Monthly Burn: $$monthly_burn
- MRR: $$mrr
- MRR Growth: $mrr_growth%

## Recent Changes
$recent_changes

---

Analyze this data and provide 3-5 insights. For each insight:
1. Type (warning/opportunity/info)
2. Title (concise)
3. Description (1-2 sentences)
4. Recommended Action

Return as JSON array.
"""

INSIGHTS_TEMPLATE = PromptTemplate(
    template=INSIGHTS_USER_TEMPLATE,
    system_prompt=INSIGHTS_SYSTEM_PROMPT
)
```

## 5. Response Parsing

### 5.1 Structured Output Parser

```python
# app/llm/parsers.py

import json
import re
from typing import TypeVar, Type
from pydantic import BaseModel, ValidationError

T = TypeVar('T', bound=BaseModel)

class ResponseParser:
    """Parse LLM responses into structured data."""
    
    @classmethod
    def parse_json(cls, response: str, schema: Type[T]) -> T:
        """
        Parse JSON from LLM response and validate against schema.
        
        Handles common issues:
        - Markdown code blocks
        - Trailing commas
        - Partial JSON
        """
        # Extract JSON from markdown code blocks if present
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', response)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Try to find JSON array or object
            json_match = re.search(r'(\[[\s\S]*\]|\{[\s\S]*\})', response)
            if json_match:
                json_str = json_match.group(1)
            else:
                raise ParsingError("No JSON found in response")
        
        # Clean up common issues
        json_str = cls._clean_json(json_str)
        
        try:
            data = json.loads(json_str)
            return schema.model_validate(data)
        except json.JSONDecodeError as e:
            raise ParsingError(f"Invalid JSON: {e}")
        except ValidationError as e:
            raise ParsingError(f"Schema validation failed: {e}")
    
    @classmethod
    def _clean_json(cls, json_str: str) -> str:
        """Clean common JSON issues from LLM output."""
        # Remove trailing commas before ] or }
        json_str = re.sub(r',\s*([\]}])', r'\1', json_str)
        # Remove comments
        json_str = re.sub(r'//.*?\n', '\n', json_str)
        return json_str.strip()
```

## 6. Usage Examples

### 6.1 Generating Pivot Ideas

```python
# In AI service

from app.llm.service import LLMService
from app.llm.prompts.ideation import IDEATION_TEMPLATE
from app.llm.parsers import ResponseParser
from app.schemas.ai import IdeationResponse

async def generate_pivot_ideas(startup: Startup, constraints: dict) -> list[Idea]:
    # Build prompt with context
    prompt, system = IDEATION_TEMPLATE.format(
        startup_name=startup.name,
        industry=startup.industry,
        stage=startup.stage,
        product_description=startup.product_description,
        team_size=startup.team.size,
        team_roles=", ".join(startup.team.roles),
        founder_background=startup.team.founder_background,
        target_market=startup.target_market,
        customer_segments=", ".join(startup.customer_segments),
        cash_balance=startup.current_cash_balance,
        monthly_burn=calculate_burn(startup),
        runway_months=calculate_runway(startup),
        max_investment=constraints.get("max_investment", 50000),
        additional_context=constraints.get("additional_context", ""),
        focus_areas=", ".join(constraints.get("focus_areas", []))
    )
    
    # Generate completion
    response = await LLMService.generate(
        prompt=prompt,
        system_prompt=system,
        config=LLMConfig(temperature=0.8, max_tokens=3000)
    )
    
    # Parse response
    ideas_data = ResponseParser.parse_json(response.content, IdeationResponse)
    
    # Save and return
    ideas = []
    for idea_data in ideas_data.ideas:
        idea = await save_idea(startup.id, idea_data, response)
        ideas.append(idea)
    
    return ideas
```

### 6.2 Streaming Roadmap Generation

```python
# In API endpoint

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter()

@router.post("/ai/roadmap/stream")
async def stream_roadmap(request: RoadmapRequest):
    async def generate():
        prompt, system = ROADMAP_TEMPLATE.format(...)
        
        async for chunk in LLMService.stream(prompt, system):
            yield f"data: {chunk}\n\n"
        
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream"
    )
```

## 7. Error Handling

```python
# app/llm/exceptions.py

class LLMError(Exception):
    """Base exception for LLM errors."""
    pass

class ProviderError(LLMError):
    """Error from specific provider."""
    def __init__(self, provider: str, message: str):
        self.provider = provider
        super().__init__(f"[{provider}] {message}")

class RateLimitError(LLMError):
    """Rate limit exceeded."""
    def __init__(self, provider: str, retry_after: int = None):
        self.provider = provider
        self.retry_after = retry_after
        super().__init__(f"Rate limit exceeded for {provider}")

class ParsingError(LLMError):
    """Failed to parse LLM response."""
    pass

class TimeoutError(LLMError):
    """LLM request timed out."""
    pass
```

## 8. Monitoring & Logging

```python
# All LLM calls are logged with:

{
    "event": "llm_request",
    "provider": "groq",
    "model": "llama-3.1-70b-versatile",
    "prompt_tokens": 1500,
    "completion_tokens": 800,
    "latency_ms": 2340,
    "success": true,
    "user_id": "507f1f77bcf86cd799439011",
    "endpoint": "ideation"
}
```

---

**Next:** See [05_frontend_architecture.md](./05_frontend_architecture.md) for frontend component design.
