import { extname } from 'path';

/**
 * Agent metadata
 */
export interface AgentMetadata {
  name: string;
  description: string;
  applicableFileTypes: string[];
  modulePath: string;
}

/**
 * Agent instance with execute method
 */
export interface Agent {
  execute(input: unknown): Promise<unknown>;
}

/**
 * Agent cache for session-based caching
 */
const agentCache = new Map<string, Agent>();

/**
 * Available agent metadata registry
 */
const AGENT_REGISTRY: AgentMetadata[] = [
  {
    name: 'type-enforcer',
    description: 'Python 3.12 type checking via Pyright',
    applicableFileTypes: ['.py'],
    modulePath: './agents/type-enforcer.js',
  },
  {
    name: 'doc-validator',
    description: 'Python docstring validation (Google-style)',
    applicableFileTypes: ['.py'],
    modulePath: './agents/doc-validator.js',
  },
  {
    name: 'test-coverage',
    description: 'Pytest coverage enforcement',
    applicableFileTypes: ['.py'],
    modulePath: './agents/test-coverage.js',
  },
  {
    name: 'security-scanner',
    description: 'Security vulnerability and secret detection',
    applicableFileTypes: ['.py', '.ts', '.js', '.tsx', '.jsx'],
    modulePath: './agents/security-scanner.js',
  },
];

/**
 * Discovers available enforcement agents
 * @returns Array of agent metadata
 */
export function discoverAgents(): AgentMetadata[] {
  return [...AGENT_REGISTRY];
}

/**
 * Gets applicable agents for a file type
 * @param filePath - File path to check
 * @returns Array of agent names applicable to file type
 */
export function getApplicableAgents(filePath: string): string[] {
  const ext = extname(filePath).toLowerCase();
  const applicableAgents: string[] = [];

  for (const agent of AGENT_REGISTRY) {
    if (agent.applicableFileTypes.includes(ext)) {
      applicableAgents.push(agent.name);
    }
  }

  return applicableAgents;
}

/**
 * Gets agent metadata by name
 * @param agentName - Agent name
 * @returns Agent metadata or undefined if not found
 */
export function getAgentMetadata(agentName: string): AgentMetadata | undefined {
  return AGENT_REGISTRY.find(agent => agent.name === agentName);
}

/**
 * Loads an agent dynamically by name
 * Uses session-based caching to avoid reloading agents
 * @param agentName - Agent name to load
 * @returns Agent instance
 * @throws Error if agent not found or loading fails
 */
export async function getAgent(agentName: string): Promise<Agent> {
  // Check cache first
  if (agentCache.has(agentName)) {
    const cached = agentCache.get(agentName);
    if (cached) return cached;
  }

  // Find agent metadata
  const metadata = getAgentMetadata(agentName);
  if (!metadata) {
    throw new Error(`Agent not found: ${agentName}`);
  }

  // Load agent module dynamically
  try {
    const module = await import(metadata.modulePath);

    // Get factory function (e.g., createTypeEnforcer)
    const factoryName = `create${agentName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')}`;

    const factory = module[factoryName];

    if (typeof factory !== 'function') {
      throw new Error(`Factory function ${factoryName} not found in ${metadata.modulePath}`);
    }

    // Create agent instance
    const agent = factory();

    // Cache for session
    agentCache.set(agentName, agent);

    return agent;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load agent ${agentName}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Loads all applicable agents for a file
 * @param filePath - File path
 * @returns Array of agent instances
 */
export async function loadAgentsForFile(filePath: string): Promise<Agent[]> {
  const agentNames = getApplicableAgents(filePath);

  return Promise.all(agentNames.map(name => getAgent(name)));
}

/**
 * Clears agent cache
 * Useful for testing or session cleanup
 */
export function clearAgentCache(): void {
  agentCache.clear();
}

/**
 * Gets count of cached agents
 * @returns Number of cached agents
 */
export function getCachedAgentCount(): number {
  return agentCache.size;
}
