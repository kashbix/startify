"""
LLM Provider Management API Endpoints

Allows users to:
- View available LLM providers and models
- Get current LLM configuration
- Update LLM provider/model settings
- Test LLM connection
- Manage API keys securely
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.core.config import settings
import os
from groq import AsyncGroq

# Default system configuration - uses environment variables
SYSTEM_DEFAULT_PROVIDER = "groq"
SYSTEM_DEFAULT_MODEL = settings.LLM_MODEL  # "llama-3.3-70b-versatile"
SYSTEM_GROQ_API_KEY = settings.GROQ_API_KEY  # From .env file

router = APIRouter()


# ============ Schemas ============

class LLMProvider(BaseModel):
    """Available LLM provider info"""
    id: str
    name: str
    description: str
    models: List[str]
    requires_api_key: bool
    api_key_env_var: str
    is_configured: bool = False


class LLMConfig(BaseModel):
    """Current LLM configuration"""
    provider: str
    model: str
    is_connected: bool
    api_key_set: bool
    available_providers: List[LLMProvider]


class UpdateLLMConfig(BaseModel):
    """Request to update LLM configuration"""
    provider: str = Field(..., description="LLM provider (groq, openai, gemini, ollama)")
    model: str = Field(..., description="Model name")
    api_key: Optional[str] = Field(None, description="API key (optional, for updating)")


class TestLLMRequest(BaseModel):
    """Request to test LLM connection"""
    provider: Optional[str] = None
    model: Optional[str] = None
    api_key: Optional[str] = None
    prompt: str = "Say 'Hello, STRATA-AI is connected!' in exactly those words."


class TestLLMResponse(BaseModel):
    """Response from LLM test"""
    success: bool
    message: str
    response: Optional[str] = None
    latency_ms: Optional[int] = None


class LLMUsageStats(BaseModel):
    """LLM usage statistics"""
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    total_tokens_used: int = 0
    avg_latency_ms: float = 0


# ============ Provider Definitions ============

AVAILABLE_PROVIDERS = [
    LLMProvider(
        id="groq",
        name="Groq",
        description="Ultra-fast inference with Llama models. Best for speed and cost-efficiency.",
        models=[
            "llama-3.3-70b-versatile",
            "llama-3.1-70b-versatile", 
            "llama-3.1-8b-instant",
            "llama3-70b-8192",
            "llama3-8b-8192",
            "mixtral-8x7b-32768",
            "gemma2-9b-it",
        ],
        requires_api_key=True,
        api_key_env_var="GROQ_API_KEY",
    ),
    LLMProvider(
        id="openai",
        name="OpenAI",
        description="GPT-4 and GPT-3.5 models. Industry-leading quality and capabilities.",
        models=[
            "gpt-4-turbo-preview",
            "gpt-4",
            "gpt-4-32k",
            "gpt-3.5-turbo",
            "gpt-3.5-turbo-16k",
        ],
        requires_api_key=True,
        api_key_env_var="OPENAI_API_KEY",
    ),
    LLMProvider(
        id="gemini",
        name="Google Gemini",
        description="Google's latest AI models with strong reasoning capabilities.",
        models=[
            "gemini-pro",
            "gemini-pro-vision",
            "gemini-1.5-pro",
            "gemini-1.5-flash",
        ],
        requires_api_key=True,
        api_key_env_var="GOOGLE_API_KEY",
    ),
    LLMProvider(
        id="ollama",
        name="Ollama (Local)",
        description="Run models locally. No API key required, but requires Ollama installation.",
        models=[
            "llama3:latest",
            "llama3:70b",
            "mistral:latest",
            "mixtral:latest",
            "codellama:latest",
            "phi3:latest",
        ],
        requires_api_key=False,
        api_key_env_var="",
    ),
]


# ============ In-memory user LLM settings (per-user) ============
# In production, this should be stored in the database per user

user_llm_settings: dict = {}


def get_user_llm_config(user_id: str) -> dict:
    """Get user's LLM configuration or return defaults with system Groq API key"""
    if user_id not in user_llm_settings:
        # Initialize with system defaults - Groq is pre-configured
        user_llm_settings[user_id] = {
            "provider": SYSTEM_DEFAULT_PROVIDER,
            "model": SYSTEM_DEFAULT_MODEL,
            "api_keys": {},  # User's custom API keys (stored encrypted in production)
            "use_system_groq": True  # Flag to use system's Groq API key
        }
    return user_llm_settings[user_id]


def get_effective_api_key(user_config: dict, provider: str) -> str:
    """
    Get the effective API key for a provider.
    Priority:
    1. User's custom API key for the provider
    2. System's Groq API key (if provider is groq and use_system_groq is True)
    3. Environment variable for the provider
    """
    # Check user's custom API key first
    user_api_key = user_config.get("api_keys", {}).get(provider)
    if user_api_key:
        return user_api_key
    
    # For Groq, use system API key by default
    if provider == "groq" and user_config.get("use_system_groq", True):
        if SYSTEM_GROQ_API_KEY:
            return SYSTEM_GROQ_API_KEY
    
    # Fall back to environment variables
    provider_info = next((p for p in AVAILABLE_PROVIDERS if p.id == provider), None)
    if provider_info and provider_info.api_key_env_var:
        return os.getenv(provider_info.api_key_env_var, "")
    
    return ""


# ============ Endpoints ============

@router.get("/config", response_model=LLMConfig)
async def get_llm_config(current_user: User = Depends(get_current_user)):
    """
    Get current LLM configuration and available providers.
    Groq is pre-configured with system API key by default.
    """
    user_config = get_user_llm_config(str(current_user.id))
    
    # Check which providers are configured
    providers_with_status = []
    for provider in AVAILABLE_PROVIDERS:
        provider_dict = provider.model_dump()
        if provider.requires_api_key:
            # Get effective API key (includes system Groq key)
            effective_key = get_effective_api_key(user_config, provider.id)
            provider_dict["is_configured"] = bool(effective_key)
        else:
            provider_dict["is_configured"] = True  # Ollama doesn't need API key
        providers_with_status.append(LLMProvider(**provider_dict))
    
    # Check if current provider is connected
    current_provider = user_config.get("provider", SYSTEM_DEFAULT_PROVIDER)
    current_model = user_config.get("model", SYSTEM_DEFAULT_MODEL)
    
    # Get effective API key for current provider
    effective_api_key = get_effective_api_key(user_config, current_provider)
    is_connected = bool(effective_api_key) or current_provider == "ollama"
    api_key_set = bool(effective_api_key)
    
    return LLMConfig(
        provider=current_provider,
        model=current_model,
        is_connected=is_connected,
        api_key_set=api_key_set,
        available_providers=providers_with_status,
    )


@router.put("/config", response_model=LLMConfig)
async def update_llm_config(
    config: UpdateLLMConfig,
    current_user: User = Depends(get_current_user)
):
    """
    Update LLM provider and model configuration.
    """
    # Validate provider
    valid_provider_ids = [p.id for p in AVAILABLE_PROVIDERS]
    if config.provider not in valid_provider_ids:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid provider. Must be one of: {', '.join(valid_provider_ids)}"
        )
    
    # Validate model for the provider
    provider = next(p for p in AVAILABLE_PROVIDERS if p.id == config.provider)
    if config.model not in provider.models:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid model for {provider.name}. Available models: {', '.join(provider.models)}"
        )
    
    # Update user's LLM config
    user_config = get_user_llm_config(str(current_user.id))
    user_config["provider"] = config.provider
    user_config["model"] = config.model
    
    # Update API key if provided
    if config.api_key:
        if "api_keys" not in user_config:
            user_config["api_keys"] = {}
        user_config["api_keys"][config.provider] = config.api_key
    
    user_llm_settings[str(current_user.id)] = user_config
    
    # Return updated config
    return await get_llm_config(current_user)


@router.post("/test", response_model=TestLLMResponse)
async def test_llm_connection(
    request: TestLLMRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Test LLM connection with a simple prompt.
    Uses system Groq API key by default if no custom key is provided.
    """
    import time
    
    user_config = get_user_llm_config(str(current_user.id))
    
    # Use provided values or fall back to user's config
    provider = request.provider or user_config.get("provider", SYSTEM_DEFAULT_PROVIDER)
    model = request.model or user_config.get("model", SYSTEM_DEFAULT_MODEL)
    
    # Get API key: use provided key, or get effective key (includes system Groq key)
    api_key = request.api_key if request.api_key else get_effective_api_key(user_config, provider)
    
    if not api_key and provider != "ollama":
        return TestLLMResponse(
            success=False,
            message=f"No API key configured for {provider}. Please add your API key.",
            response=None,
            latency_ms=None,
        )
    
    start_time = time.time()
    
    try:
        if provider == "groq":
            client = AsyncGroq(api_key=api_key)
            response = await client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": request.prompt}
                ],
                model=model,
                max_tokens=100,
                temperature=0.3,
            )
            result = response.choices[0].message.content
            
        elif provider == "openai":
            # OpenAI implementation
            try:
                from openai import AsyncOpenAI
                client = AsyncOpenAI(api_key=api_key)
                response = await client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": request.prompt}
                    ],
                    model=model,
                    max_tokens=100,
                    temperature=0.3,
                )
                result = response.choices[0].message.content
            except ImportError:
                return TestLLMResponse(
                    success=False,
                    message="OpenAI package not installed. Run: pip install openai",
                    response=None,
                    latency_ms=None,
                )
                
        elif provider == "gemini":
            # Google Gemini implementation
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                model_instance = genai.GenerativeModel(model)
                response = await model_instance.generate_content_async(request.prompt)
                result = response.text
            except ImportError:
                return TestLLMResponse(
                    success=False,
                    message="Google Generative AI package not installed. Run: pip install google-generativeai",
                    response=None,
                    latency_ms=None,
                )
                
        elif provider == "ollama":
            # Ollama local implementation
            try:
                import httpx
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "http://localhost:11434/api/generate",
                        json={
                            "model": model,
                            "prompt": request.prompt,
                            "stream": False,
                        },
                        timeout=30.0,
                    )
                    if response.status_code == 200:
                        result = response.json().get("response", "")
                    else:
                        return TestLLMResponse(
                            success=False,
                            message=f"Ollama error: {response.text}",
                            response=None,
                            latency_ms=None,
                        )
            except Exception as e:
                return TestLLMResponse(
                    success=False,
                    message=f"Cannot connect to Ollama. Make sure it's running on localhost:11434. Error: {str(e)}",
                    response=None,
                    latency_ms=None,
                )
        else:
            return TestLLMResponse(
                success=False,
                message=f"Provider {provider} not yet implemented",
                response=None,
                latency_ms=None,
            )
        
        latency = int((time.time() - start_time) * 1000)
        
        return TestLLMResponse(
            success=True,
            message=f"Successfully connected to {provider} using {model}",
            response=result,
            latency_ms=latency,
        )
        
    except Exception as e:
        latency = int((time.time() - start_time) * 1000)
        return TestLLMResponse(
            success=False,
            message=f"Connection failed: {str(e)}",
            response=None,
            latency_ms=latency,
        )


@router.delete("/api-key/{provider}")
async def delete_api_key(
    provider: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete stored API key for a provider.
    """
    user_config = get_user_llm_config(str(current_user.id))
    
    if "api_keys" in user_config and provider in user_config["api_keys"]:
        del user_config["api_keys"][provider]
        return {"message": f"API key for {provider} deleted successfully"}
    
    return {"message": f"No API key found for {provider}"}


@router.get("/providers", response_model=List[LLMProvider])
async def get_available_providers(current_user: User = Depends(get_current_user)):
    """
    Get list of all available LLM providers and their models.
    Groq shows as configured by default (uses system API key).
    """
    user_config = get_user_llm_config(str(current_user.id))
    
    providers_with_status = []
    for provider in AVAILABLE_PROVIDERS:
        provider_dict = provider.model_dump()
        if provider.requires_api_key:
            # Use effective API key check (includes system Groq key)
            effective_key = get_effective_api_key(user_config, provider.id)
            provider_dict["is_configured"] = bool(effective_key)
        else:
            provider_dict["is_configured"] = True
        providers_with_status.append(LLMProvider(**provider_dict))
    
    return providers_with_status
