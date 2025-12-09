/**
 * 🤖 ZZIK Base Agent
 * ==================
 * 모든 에이전트의 기본 클래스
 */

import type { Agent, AgentTask, AgentExecutionResult, TaskResult } from './agent-types';

export abstract class BaseAgent implements Agent {
  abstract id: string;
  abstract name: string;
  abstract emoji: string;
  abstract description: string;
  abstract category: Agent['category'];
  abstract tasks: AgentTask[];

  protected log(message: string): void {
    console.log(`[${this.emoji} ${this.name}] ${message}`);
  }

  protected warn(message: string): void {
    console.warn(`[${this.emoji} ${this.name}] ⚠️ ${message}`);
  }

  protected error(message: string): void {
    console.error(`[${this.emoji} ${this.name}] ❌ ${message}`);
  }

  protected success(message: string): void {
    console.log(`[${this.emoji} ${this.name}] ✅ ${message}`);
  }

  /**
   * 각 에이전트가 구현해야 하는 태스크 실행 메서드
   */
  protected abstract executeTask(task: AgentTask): Promise<TaskResult>;

  /**
   * 에이전트 실행
   */
  async run(): Promise<AgentExecutionResult> {
    const startTime = new Date();
    const taskResults: TaskResult[] = [];
    let completedTasks = 0;
    let failedTasks = 0;
    let skippedTasks = 0;

    this.log(`Starting execution with ${this.tasks.length} tasks...`);

    // 우선순위별로 정렬
    const sortedTasks = this.sortTasksByPriority([...this.tasks]);

    for (const task of sortedTasks) {
      this.log(`\n📋 Task: ${task.name}`);
      this.log(`   Priority: ${task.priority}`);
      this.log(`   Target files: ${task.targetFiles.length}`);

      // 의존성 체크
      if (task.dependencies?.length) {
        const unmetDeps = this.checkDependencies(task.dependencies, taskResults);
        if (unmetDeps.length > 0) {
          this.warn(`Skipping task - unmet dependencies: ${unmetDeps.join(', ')}`);
          task.status = 'skipped';
          skippedTasks++;
          continue;
        }
      }

      task.status = 'in_progress';

      try {
        const result = await this.executeTask(task);
        task.result = result;
        taskResults.push(result);

        if (result.success) {
          task.status = 'completed';
          completedTasks++;
          this.success(`Task completed: ${result.issuesFixed}/${result.issuesFound} issues fixed`);
        } else {
          task.status = 'failed';
          failedTasks++;
          this.error(`Task failed: ${result.message}`);
        }
      } catch (error) {
        task.status = 'failed';
        failedTasks++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.error(`Task threw error: ${errorMessage}`);
        taskResults.push({
          success: false,
          message: errorMessage,
          filesModified: [],
          issuesFound: 0,
          issuesFixed: 0
        });
      }
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    const summary = this.generateSummary(completedTasks, failedTasks, skippedTasks, duration);
    this.log(`\n${summary}`);

    return {
      agentId: this.id,
      startTime,
      endTime,
      totalTasks: this.tasks.length,
      completedTasks,
      failedTasks,
      skippedTasks,
      summary,
      taskResults
    };
  }

  /**
   * 우선순위별로 태스크 정렬
   */
  private sortTasksByPriority(tasks: AgentTask[]): AgentTask[] {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  /**
   * 의존성 체크
   */
  private checkDependencies(dependencies: string[], completedResults: TaskResult[]): string[] {
    return dependencies.filter(dep => {
      const depTask = this.tasks.find(t => t.id === dep);
      return !depTask || depTask.status !== 'completed';
    });
  }

  /**
   * 실행 요약 생성
   */
  private generateSummary(completed: number, failed: number, skipped: number, durationMs: number): string {
    const total = completed + failed + skipped;
    const successRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';
    
    return `
─────────────────────────────────────────────
📊 ${this.name} Execution Summary
─────────────────────────────────────────────
✅ Completed: ${completed}/${total} tasks
❌ Failed: ${failed} tasks  
⏭️ Skipped: ${skipped} tasks
📈 Success Rate: ${successRate}%
⏱️ Duration: ${durationMs}ms
─────────────────────────────────────────────
`.trim();
  }

  /**
   * 태스크 초기화 헬퍼
   */
  protected createTask(
    id: string,
    name: string,
    description: string,
    priority: AgentTask['priority'],
    targetFiles: string[],
    estimatedMinutes: number = 5,
    dependencies?: string[]
  ): AgentTask {
    return {
      id,
      name,
      description,
      priority,
      estimatedMinutes,
      status: 'pending',
      targetFiles,
      dependencies
    };
  }
}
