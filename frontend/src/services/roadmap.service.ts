import type { Roadmap, Phase, Task } from '@/types/roadmap.types';
import { apiClient } from './api.client';

interface APITask {
  id: string;
  title: string;
  description: string;
  estimated_hours?: number;
  assignee_role?: string;
  is_completed: boolean;
}

interface APIKPI {
  metric: string;
  target: string;
  measurement_method: string;
}

interface APIPhase {
  phase_number: number;
  title: string;
  description: string;
  duration_weeks: number;
  tasks: APITask[];
  kpis: APIKPI[];
  resources_needed: string[];
  dependencies: string[];
  risks: string[];
}

interface APIRoadmapResponse {
  id: string;
  title: string;
  strategy_description: string;
  total_duration_weeks: number;
  phases: APIPhase[];
  success_criteria: string[];
  budget_estimate?: string;
  created_at: string;
}

// Local storage for roadmaps
const roadmapsDB: Roadmap[] = [];

// Transform API response to frontend Roadmap type
const transformAPIRoadmap = (apiRoadmap: APIRoadmapResponse): Roadmap => {
  const phases: Phase[] = apiRoadmap.phases.map((phase) => ({
    id: `phase_${phase.phase_number}`,
    phaseNumber: phase.phase_number,
    name: phase.title,
    description: phase.description,
    durationWeeks: phase.duration_weeks,
    tasks: phase.tasks.map((task): Task => ({
      id: task.id,
      title: task.title,
      description: task.description, // Include description
      isCompleted: task.is_completed,
    })),
  }));

  return {
    id: apiRoadmap.id,
    title: apiRoadmap.title,
    totalDurationWeeks: apiRoadmap.total_duration_weeks,
    progress: 0, // Calculate based on completed tasks if needed
    phases,
  };
};

export const getRoadmaps = async (): Promise<Roadmap[]> => {
  console.log('Fetching roadmaps...');
  return [...roadmapsDB];
};

export const getRoadmapById = async (id: string): Promise<Roadmap | undefined> => {
  console.log(`Fetching roadmap by id: ${id}`);
  return roadmapsDB.find(r => r.id === id);
};

export const generateRoadmapFromIdea = async (ideaTitle: string, ideaDescription?: string): Promise<Roadmap> => {
  console.log(`Generating roadmap for idea: ${ideaTitle}`);

  try {
    const response = await apiClient.post<APIRoadmapResponse>('/roadmaps/generate', {
      strategy_title: ideaTitle,
      strategy_description: ideaDescription || `Execute the strategy: ${ideaTitle}. Focus on validating the concept, building an MVP, and acquiring early customers.`,
      available_runway_months: 12,
      team_size: 3,
      priority: 'high',
    });

    const roadmap = transformAPIRoadmap(response);
    roadmapsDB.push(roadmap);
    
    console.log('Roadmap generated from API.');
    return roadmap;
  } catch (error) {
    console.error('Failed to generate roadmap:', error);
    
    // Fallback to local generation with detailed tasks
    const fallbackRoadmap: Roadmap = {
      id: `rdmp_${Date.now()}`,
      title: `${ideaTitle} Execution Plan`,
      totalDurationWeeks: 12,
      progress: 0,
      phases: [
        { 
          id: 'p1', 
          phaseNumber: 1, 
          name: 'Phase 1: Research & Validation', 
          description: 'Validate the idea and understand the market', 
          durationWeeks: 3, 
          tasks: [
            { id: 't1', title: 'Market Research', description: 'Analyze target market size, growth trends, and customer segments. Identify key demographics, pain points, and willingness to pay. Use tools like Google Trends, industry reports, and market research platforms.', isCompleted: false },
            { id: 't2', title: 'Competitor Analysis', description: 'Identify top 5-10 competitors (direct and indirect). Analyze their pricing, features, marketing strategies, and customer reviews. Create a comparison matrix highlighting gaps and opportunities.', isCompleted: false },
            { id: 't3', title: 'Customer Interviews', description: 'Conduct 15-20 interviews with potential customers. Prepare a discussion guide focusing on current solutions, pain points, and feature priorities. Document insights and identify common patterns.', isCompleted: false },
            { id: 't4', title: 'Validate Problem-Solution Fit', description: 'Create a landing page or mockup to test interest. Set up tracking for key metrics (sign-ups, clicks). Aim for at least 100 sign-ups or 5% conversion to validate demand.', isCompleted: false },
          ] 
        },
        { 
          id: 'p2', 
          phaseNumber: 2, 
          name: 'Phase 2: Planning & Strategy', 
          description: 'Define scope and create execution plan', 
          durationWeeks: 2, 
          tasks: [
            { id: 't5', title: 'Define MVP Scope', description: 'List all potential features and prioritize using MoSCoW method (Must have, Should have, Could have, Won\'t have). Focus on 3-5 core features that solve the main problem.', isCompleted: false },
            { id: 't6', title: 'Create Project Timeline', description: 'Break down MVP into 2-week sprints. Set milestones for alpha, beta, and launch. Include buffer time (20-30%) for unexpected delays.', isCompleted: false },
            { id: 't7', title: 'Resource Allocation', description: 'Identify required skills (dev, design, marketing). Assess team capacity and skill gaps. Decide on hiring, outsourcing, or tools to fill gaps.', isCompleted: false },
            { id: 't8', title: 'Define Success Metrics', description: 'Set SMART goals for launch (Specific, Measurable, Achievable, Relevant, Time-bound). Examples: 100 paying customers in 90 days, $10K MRR.', isCompleted: false },
          ] 
        },
        { 
          id: 'p3', 
          phaseNumber: 3, 
          name: 'Phase 3: Build & Test', 
          description: 'Build MVP and validate with real users', 
          durationWeeks: 4, 
          tasks: [
            { id: 't9', title: 'Build MVP Core Features', description: 'Develop the 3-5 core features identified in planning. Use agile methodology with daily standups. Focus on functionality over polish.', isCompleted: false },
            { id: 't10', title: 'Internal Testing & QA', description: 'Create test cases covering all user flows. Test on multiple devices/browsers. Document and prioritize bugs by severity.', isCompleted: false },
            { id: 't11', title: 'Beta Testing with Real Users', description: 'Recruit 20-50 beta testers. Provide clear feedback channels (surveys, interviews, in-app feedback). Run beta for 2-4 weeks.', isCompleted: false },
            { id: 't12', title: 'Iterate Based on Feedback', description: 'Analyze beta feedback and usage data. Prioritize improvements by impact vs effort. Make critical fixes and top-requested improvements.', isCompleted: false },
          ] 
        },
        { 
          id: 'p4', 
          phaseNumber: 4, 
          name: 'Phase 4: Launch & Growth', 
          description: 'Launch to market and acquire users', 
          durationWeeks: 3, 
          tasks: [
            { id: 't13', title: 'Prepare Marketing Materials', description: 'Create compelling landing page with clear value proposition. Prepare demo videos, screenshots, and case studies. Write press kit and outreach emails.', isCompleted: false },
            { id: 't14', title: 'Soft Launch', description: 'Launch to limited audience (beta users, email list, communities). Monitor closely for issues. Gather testimonials and reviews.', isCompleted: false },
            { id: 't15', title: 'Full Public Launch', description: 'Execute launch campaign across all channels. Post on Product Hunt, Hacker News, relevant subreddits. Reach out to press and influencers.', isCompleted: false },
            { id: 't16', title: 'Post-Launch Optimization', description: 'Monitor key metrics daily for first 2 weeks. Respond quickly to user feedback. A/B test landing page and onboarding. Double down on channels that work.', isCompleted: false },
          ] 
        },
      ],
    };
    roadmapsDB.push(fallbackRoadmap);
    return fallbackRoadmap;
  }
};

// Get roadmap templates from API
export const getRoadmapTemplates = async () => {
  try {
    const response = await apiClient.get<{ templates: Array<{ id: string; title: string; description: string; suggested_team_size: number; typical_duration_weeks: number }> }>('/roadmaps/templates');
    return response.templates;
  } catch (error) {
    console.error('Failed to fetch roadmap templates:', error);
    return [];
  }
};

// Toggle task completion status
export const toggleTaskCompletion = async (roadmapId: string, phaseId: string, taskId: string): Promise<Roadmap> => {
  console.log(`Toggling task ${taskId} in phase ${phaseId} of roadmap ${roadmapId}`);
  
  // Find the roadmap in local storage
  const roadmapIndex = roadmapsDB.findIndex(r => r.id === roadmapId);
  if (roadmapIndex === -1) {
    throw new Error('Roadmap not found');
  }
  
  const roadmap = roadmapsDB[roadmapIndex];
  
  // Find the phase and task, then toggle
  const updatedPhases = roadmap.phases.map(phase => {
    if (phase.id === phaseId) {
      return {
        ...phase,
        tasks: phase.tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, isCompleted: !task.isCompleted };
          }
          return task;
        }),
      };
    }
    return phase;
  });
  
  // Calculate new progress
  const totalTasks = updatedPhases.reduce((sum, phase) => sum + phase.tasks.length, 0);
  const completedTasks = updatedPhases.reduce((sum, phase) => 
    sum + phase.tasks.filter(t => t.isCompleted).length, 0);
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Update the roadmap
  const updatedRoadmap: Roadmap = {
    ...roadmap,
    phases: updatedPhases,
    progress,
  };
  
  roadmapsDB[roadmapIndex] = updatedRoadmap;
  
  return updatedRoadmap;
};
