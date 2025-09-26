import { GoogleGenAI, Type } from "@google/genai";
import { getDocumentation } from './prompts';
import { getEffectivePrompts, getAgentConfig } from './promptService';
import type { ProgressUpdate, TechStack, DevelopedIdea, DevelopmentPlan, DocumentType, AgentName } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

export interface AgentTask {
  agent: AgentName;
  goal: string;
  focus: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

async function callAgent<T>(
  prompt: string,
  options: { expectJson?: boolean; schema?: any } = {}
): Promise<T> {
  try {
    const config: any = {};
    if (options.expectJson || options.schema) {
      config.responseMimeType = "application/json";
    }
    if (options.schema) {
      config.responseSchema = options.schema;
    }
    
    const response = await ai.models.generateContent({ model, contents: prompt, config });
    const text = response.text;
    
    if (options.expectJson || options.schema) {
       // Simple fallback for JSON extraction from markdown
      const cleanedText = text.replace(/^```json\s*|```\s*$/g, '').trim();
      return JSON.parse(cleanedText) as T;
    }
    return text as T;
  } catch (error) {
    console.error('Error during Gemini API call:', error);
    if (error instanceof Error) {
        console.error('Response text:', (error as any).text);
    }
    throw new Error(`Agent failed to respond correctly: ${error instanceof Error ? error.message : 'Unknown API error'}`);
  }
}

export async function developIdea(
  initialIdea: string,
  techStack: TechStack,
  requestedDocuments: DocumentType[],
  onProgress: (progress: ProgressUpdate) => void
): Promise<{ finalResult: DevelopedIdea, agentTasks: AgentTask[] }> {
  // Use the prompt service to get the latest prompts (custom or default)
  const AGENT_PROMPTS = getEffectivePrompts();

  const techStackString = JSON.stringify(techStack, null, 2);
  let plan: DevelopmentPlan = { userIdea: initialIdea, techStack };

  // 1. Orchestrator Agent: Create a dynamic plan
  onProgress({ 
    agentTasks: [], 
    currentIteration: 0, 
    totalIterations: 1, 
    currentTaskDescription: 'Orchestrator is planning the architectural documents...',
    currentAgent: 'OrchestratorAgent'
  });

  const orchestratorPrompt = AGENT_PROMPTS.OrchestratorAgent
      .replace('{{USER_IDEA}}', initialIdea)
      .replace('{{TECH_STACK}}', techStackString)
      .replace('{{REQUESTED_DOCUMENTS}}', requestedDocuments.join(', '));
  
  const agentTasksSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        agent: { type: Type.STRING },
        goal: { type: Type.STRING },
        focus: { type: Type.STRING },
      },
      required: ['agent', 'goal', 'focus'],
    },
  };

  const agentTasks = await callAgent<AgentTask[]>(orchestratorPrompt, { expectJson: true, schema: agentTasksSchema });
  const totalIterations = agentTasks.length + 1;

  // 2. Execute Specialized Agents
  for (let i = 0; i < agentTasks.length; i++) {
    const task = agentTasks[i];
    const agentName = task.agent;
    onProgress({
      agentTasks,
      currentIteration: i + 1,
      totalIterations,
      currentTaskDescription: task.goal,
      currentAgent: agentName,
    });
    
    // Get the agent's full configuration to check for enabled tools
    const agentConfig = getAgentConfig(agentName);
    
    // Only provide documentation if the 'DocumentationSearch' tool is enabled
    const documentation = agentConfig.tools.find(tool => tool.id === 'DocumentationSearch' && tool.enabled)
        ? getDocumentation(techStack, agentName)
        : 'Documentation access is disabled for this agent.';

    const planContext = JSON.stringify(plan, null, 2);

    const agentPrompt = AGENT_PROMPTS[agentName]
        .replace('{{PLAN_CONTEXT}}', planContext)
        .replace('{{TASK_GOAL}}', task.goal)
        .replace('{{TASK_FOCUS}}', task.focus)
        .replace('{{DOCUMENTATION}}', documentation);
    
    const result = await callAgent<string>(agentPrompt);

    // FIX: The original key derivation was flawed, causing both type errors and incorrect property names on the plan object.
    // Using a switch statement ensures a correct, type-safe mapping from agent names to DevelopmentPlan keys.
    // This correctly handles agents like DBSchemaAgent -> dbSchema and UserPersonaAgent -> userPersonas.
    let planKey: keyof Omit<DevelopmentPlan, 'userIdea' | 'techStack'> | null = null;
    switch (agentName) {
      case 'ProjectBriefAgent': planKey = 'projectBrief'; break;
      case 'UserPersonaAgent': planKey = 'userPersonas'; break;
      case 'UserFlowAgent': planKey = 'userFlow'; break;
      case 'DBSchemaAgent': planKey = 'dbSchema'; break;
      case 'APIEndpointAgent': planKey = 'apiEndpoints'; break;
      case 'ComponentArchitectureAgent': planKey = 'componentArchitecture'; break;
      case 'TechRationaleAgent': planKey = 'techRationale'; break;
      case 'RoadmapAgent': planKey = 'projectRoadmap'; break;
    }

    if (planKey) {
      plan[planKey] = result;
    }
  }

  // 3. Document Generator Agent: Produce final files
  onProgress({
    agentTasks,
    currentIteration: totalIterations,
    totalIterations,
    currentTaskDescription: 'Assembling the final project documents...',
    currentAgent: 'DocumentGeneratorAgent'
  });
  
  const finalPrompt = AGENT_PROMPTS.DocumentGeneratorAgent
      .replace('{{PLAN_CONTEXT}}', JSON.stringify(plan, null, 2))
      .replace('{{REQUESTED_DOCUMENTS}}', requestedDocuments.join(', '));

  try {
    const finalResult = await callAgent<DevelopedIdea>(finalPrompt, { expectJson: true });
    return { finalResult, agentTasks };
  } catch (error) {
     console.error("Failed to parse final JSON response from DocumentGeneratorAgent:", error);
     throw new Error("The AI returned an invalid document structure. Please try again.");
  }
}