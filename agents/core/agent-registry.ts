/**
 * 🗂️ ZZIK Agent Registry
 * =======================
 * 모든 에이전트를 등록하고 관리하는 중앙 레지스트리
 */

import type { Agent, AgentRegistry, AgentExecutionResult } from './agent-types';

class AgentRegistryImpl implements AgentRegistry {
  agents: Map<string, Agent> = new Map();

  register(agent: Agent): void {
    if (this.agents.has(agent.id)) {
      console.warn(`⚠️ Agent with ID "${agent.id}" already registered. Overwriting.`);
    }
    this.agents.set(agent.id, agent);
    console.log(`✅ Registered agent: ${agent.emoji} ${agent.name} (${agent.id})`);
  }

  get(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getAll(): Agent[] {
    return Array.from(this.agents.values());
  }

  getByCategory(category: Agent['category']): Agent[] {
    return this.getAll().filter(agent => agent.category === category);
  }

  async runAll(): Promise<AgentExecutionResult[]> {
    console.log('\n🚀 Running all agents...\n');
    const results: AgentExecutionResult[] = [];
    
    for (const agent of this.getAll()) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`${agent.emoji} Running: ${agent.name}`);
      console.log(`${'='.repeat(60)}\n`);
      
      try {
        const result = await agent.run();
        results.push(result);
        console.log(`✅ ${agent.name} completed: ${result.completedTasks}/${result.totalTasks} tasks`);
      } catch (error) {
        console.error(`❌ ${agent.name} failed:`, error);
        results.push({
          agentId: agent.id,
          startTime: new Date(),
          endTime: new Date(),
          totalTasks: agent.tasks.length,
          completedTasks: 0,
          failedTasks: agent.tasks.length,
          skippedTasks: 0,
          summary: `Agent failed with error: ${error}`,
          taskResults: []
        });
      }
    }

    return results;
  }

  async runByCategory(category: Agent['category']): Promise<AgentExecutionResult[]> {
    console.log(`\n🚀 Running ${category} agents...\n`);
    const agents = this.getByCategory(category);
    const results: AgentExecutionResult[] = [];
    
    for (const agent of agents) {
      try {
        const result = await agent.run();
        results.push(result);
      } catch (error) {
        console.error(`❌ ${agent.name} failed:`, error);
      }
    }

    return results;
  }

  printSummary(results: AgentExecutionResult[]): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 AGENT EXECUTION SUMMARY');
    console.log('='.repeat(80) + '\n');

    let totalTasks = 0;
    let completedTasks = 0;
    let failedTasks = 0;

    for (const result of results) {
      const agent = this.get(result.agentId);
      const emoji = agent?.emoji || '🤖';
      const name = agent?.name || result.agentId;
      
      console.log(`${emoji} ${name}`);
      console.log(`   Tasks: ${result.completedTasks}/${result.totalTasks} completed`);
      console.log(`   Status: ${result.failedTasks === 0 ? '✅ Success' : '⚠️ Partial'}`);
      console.log(`   Duration: ${(result.endTime.getTime() - result.startTime.getTime())}ms\n`);

      totalTasks += result.totalTasks;
      completedTasks += result.completedTasks;
      failedTasks += result.failedTasks;
    }

    console.log('─'.repeat(40));
    console.log(`📈 Total: ${completedTasks}/${totalTasks} tasks completed`);
    console.log(`❌ Failed: ${failedTasks} tasks`);
    console.log(`✅ Success Rate: ${((completedTasks / totalTasks) * 100).toFixed(1)}%`);
    console.log('='.repeat(80) + '\n');
  }
}

// 싱글톤 인스턴스
export const agentRegistry = new AgentRegistryImpl();

// 유틸리티 함수들
export function registerAgent(agent: Agent): void {
  agentRegistry.register(agent);
}

export function getAgent(id: string): Agent | undefined {
  return agentRegistry.get(id);
}

export function getAllAgents(): Agent[] {
  return agentRegistry.getAll();
}

export async function runAllAgents(): Promise<AgentExecutionResult[]> {
  const results = await agentRegistry.runAll();
  agentRegistry.printSummary(results);
  return results;
}

export async function runAgentsByCategory(category: Agent['category']): Promise<AgentExecutionResult[]> {
  const results = await agentRegistry.runByCategory(category);
  agentRegistry.printSummary(results);
  return results;
}
