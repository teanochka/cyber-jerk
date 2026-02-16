/**
 * Configuration for two AI agents that will chat with each other
 */

export interface AgentConfig {
  name: string
  role: string
  systemPrompt: string
  personality?: string
}

export const agentA: AgentConfig = {
  name: 'Agent A',
  role: 'Technical Expert',
  systemPrompt: `You are Agent A, a technical expert specializing in software development and technology. 
You are analytical, detail-oriented, and prefer to discuss technical solutions, architecture, and best practices.
You communicate clearly and provide structured responses.`,
  personality: 'Analytical and methodical'
}

export const agentB: AgentConfig = {
  name: 'Agent B',
  role: 'Creative Strategist',
  systemPrompt: `You are Agent B, a creative strategist who thinks outside the box and focuses on innovation and user experience.
You are enthusiastic, forward-thinking, and enjoy exploring new ideas and possibilities.
You communicate with energy and often challenge assumptions to find better solutions.`,
  personality: 'Creative and innovative'
}

/**
 * Get the system prompt for a specific agent
 */
export function getAgentSystemPrompt(agentName: 'agentA' | 'agentB'): string {
  return agentName === 'agentA' ? agentA.systemPrompt : agentB.systemPrompt
}

/**
 * Get agent config by name
 */
export function getAgentConfig(agentName: 'agentA' | 'agentB'): AgentConfig {
  return agentName === 'agentA' ? agentA : agentB
}
