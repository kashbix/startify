"""
Pydantic schemas for Smart Execution Roadmap API (FR-7).
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class TaskItemResponse(BaseModel):
    """A single task within a phase."""
    id: str
    title: str
    description: str
    estimated_hours: Optional[int] = None
    assignee_role: Optional[str] = None
    is_completed: bool = False


class PhaseKPIResponse(BaseModel):
    """Key Performance Indicator for a phase."""
    metric: str
    target: str
    measurement_method: str


class RoadmapPhaseResponse(BaseModel):
    """A single phase in the execution roadmap."""
    phase_number: int
    title: str
    description: str
    duration_weeks: int
    tasks: List[TaskItemResponse]
    kpis: List[PhaseKPIResponse]
    resources_needed: List[str]
    dependencies: List[str]
    risks: List[str]


class RoadmapResponse(BaseModel):
    """Complete execution roadmap response."""
    id: str
    title: str
    strategy_description: str
    total_duration_weeks: int
    phases: List[RoadmapPhaseResponse]
    success_criteria: List[str]
    budget_estimate: Optional[str] = None
    created_at: str


class RoadmapGenerateRequest(BaseModel):
    """Request for generating a roadmap."""
    strategy_title: str = Field(
        ..., 
        min_length=3, 
        max_length=200,
        description="Title of the strategy/pivot to execute"
    )
    strategy_description: str = Field(
        ..., 
        min_length=10, 
        max_length=2000,
        description="Detailed description of the strategy"
    )
    available_runway_months: Optional[float] = Field(
        None, 
        ge=0,
        description="Current runway in months"
    )
    team_size: Optional[int] = Field(
        None, 
        ge=1, 
        le=1000,
        description="Current team size"
    )
    budget_constraint: Optional[str] = Field(
        None, 
        max_length=500,
        description="Budget constraints or notes"
    )
    priority: Optional[str] = Field(
        None, 
        pattern="^(low|medium|high)$",
        description="Priority level: low, medium, high"
    )


class RoadmapFromStrategyRequest(BaseModel):
    """Request to generate roadmap from an AI-suggested strategy."""
    strategy_index: int = Field(
        ..., 
        ge=0,
        description="Index of the strategy from AI suggestions (0-based)"
    )
    additional_context: Optional[str] = Field(
        None,
        max_length=1000,
        description="Additional context or requirements"
    )


class RoadmapExportResponse(BaseModel):
    """Exported roadmap in Markdown format."""
    roadmap_id: str
    title: str
    markdown_content: str
    export_format: str = "markdown"
