/**
 * 🛡️ RED TEAM ADVERSARIAL VALIDATOR
 * ====================================
 * "Project U-100 파괴 실험"
 * 낙관적 편향을 제거하고, 극한의 스트레스 테스트를 수행하는 검증 엔진
 * 
 * @author Red Team Leader AI
 * @version 1.0.0 (Hardcore Mode)
 */

// 검증 대상 (이전 시뮬레이션 우승 모델)
const TARGET_MODEL = {
  name: "Project U-100",
  market: "Inbound Tourism Korea",
  tech: "Stablecoin",
  target: "Foreign Tourists",
  location: "Hannam-dong" // or Seongsu
};

// 🌪️ 파괴적 시나리오 (Doom Scenarios)
const DOOM_SCENARIOS = [
  {
    name: "Scenario A: Crypto Ban",
    description: "정부의 암호화폐 결제 전면 금지",
    impact: { tech: 0.1, market: 0.8, target: 1.0 }, // 기술 점수 90% 하락
    probability: 0.15 // 15% 확률
  },
  {
    name: "Scenario B: Tech Giant Entry",
    description: "네이버/카카오/토스의 동일 모델 진입",
    impact: { tech: 0.5, market: 0.6, target: 0.7 }, // 시장 점유율 반토막
    probability: 0.35
  },
  {
    name: "Scenario C: Global Pandemic 2.0",
    description: "국경 폐쇄 및 관광객 90% 감소",
    impact: { tech: 1.0, market: 0.1, target: 0.1 }, // 시장/타겟 90% 증발
    probability: 0.05
  },
  {
    name: "Scenario D: UX Friction",
    description: "관광객들이 지갑 설치/KYC를 귀찮아해서 이탈",
    impact: { tech: 1.0, market: 1.0, target: 0.4 }, // 전환율 60% 하락
    probability: 0.40
  },
  {
    name: "Scenario E: Hype Collapse",
    description: "K-컬쳐 유행 종료, 관광객 감소",
    impact: { tech: 1.0, market: 0.6, target: 0.7 }, 
    probability: 0.20
  }
];

class RedTeamValidator {
  constructor() {
    this.ITERATIONS = 10000;
    this.RESILIENCE_THRESHOLD = 60; // 생존 최소 점수
  }

  runStressTest() {
    console.log(`\n🚨 RED TEAM PROTOCOL INITIATED...`);
    console.log(`🎯 TARGET: ${TARGET_MODEL.name} (${TARGET_MODEL.target} + ${TARGET_MODEL.tech})`);
    console.log(`⚡ STRESS LEVEL: MAXIMUM (10,000 Iterations)\n`);

    const results = [];
    const failureLog = {};

    for (let i = 0; i < this.ITERATIONS; i++) {
      const result = this.simulateOneRound(i);
      results.push(result);
      
      if (result.survived === false) {
        failureLog[result.cause] = (failureLog[result.cause] || 0) + 1;
      }
    }

    return this.analyzeResults(results, failureLog);
  }

  simulateOneRound(id) {
    // 기본 체력 (이전 시뮬레이션의 점수 95~100에서 시작하되, 거품 제거 -10)
    let health = 90 + (Math.random() * 10); 
    let survived = true;
    let cause = "N/A";
    let activeScenarios = [];

    // 🎲 시나리오 랜덤 발동 (중복 발생 가능 - 엎친 데 덮친 격)
    for (const scenario of DOOM_SCENARIOS) {
      if (Math.random() < scenario.probability) {
        activeScenarios.push(scenario.name);
        
        // 데미지 계산 (곱연산으로 치명타 적용)
        // 예: Tech Impact 0.1이면 체력이 10%로 줄어듦 (데미지 90%)
        const damageFactor = (scenario.impact.tech + scenario.impact.market + scenario.impact.target) / 3;
        health *= damageFactor;
      }
    }

    // 📉 레드팀 추가 공격: 경쟁사 대응 속도 변수
    const competitorSpeed = Math.random(); // 0(느림) ~ 1(빠름)
    if (competitorSpeed > 0.8) {
      health -= 20; // 경쟁사가 빨라서 점유율 뺏김
      activeScenarios.push("Fast Follower Attack");
    }

    // 판정
    if (health < this.RESILIENCE_THRESHOLD) {
      survived = false;
      cause = activeScenarios.length > 0 ? activeScenarios.join(" + ") : "Unknown Weakness";
    }

    return { id, health, survived, cause, activeScenarios };
  }

  analyzeResults(results, failureLog) {
    const survivors = results.filter(r => r.survived).length;
    const survivalRate = (survivors / this.ITERATIONS) * 100;
    const avgHealth = results.reduce((acc, cur) => acc + cur.health, 0) / this.ITERATIONS;

    // 실패 원인 TOP 5
    const topFailures = Object.entries(failureLog)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalIterations: this.ITERATIONS,
      survivors,
      survivalRate,
      avgHealth,
      topFailures,
      assessment: this.getFinalAssessment(survivalRate)
    };
  }

  getFinalAssessment(rate) {
    if (rate > 80) return "DIAMOND (💎) - 압도적 생존력. 즉시 실행 권장.";
    if (rate > 60) return "PLATINUM (💿) - 우수하지만 리스크 관리(규제 등) 필요.";
    if (rate > 40) return "GOLD (🥇) - 평범한 생존력. Pivot 고려.";
    return "RUST (💩) - 실행 시 사망 확정.";
  }
}

// 실행
const validator = new RedTeamValidator();
const report = validator.runStressTest();

console.log("═══════════════════════════════════════════════════════════════");
console.log("🛡️ CROSS-VALIDATION REPORT (RED TEAM)");
console.log("═══════════════════════════════════════════════════════════════");
console.log(`📊 Survival Rate: ${report.survivalRate.toFixed(2)}%`);
console.log(`❤️ Avg Resilience Score: ${report.avgHealth.toFixed(2)} / 100`);
console.log(`🏆 Final Grade: ${report.assessment}\n`);

console.log("💀 TOP 5 DEATH CAUSES (Why did it fail?):");
report.topFailures.forEach((item, idx) => {
  console.log(`   ${idx + 1}. ${item[0]}: ${item[1]} deaths`);
});

console.log("\n💡 RED TEAM INSIGHT:");
if (report.survivalRate > 70) {
  console.log("   \"이 모델은 좀비처럼 살아남습니다. 악재가 겹쳐도 기초 체력(타겟 니즈)이 너무 강합니다.\"");
  console.log("   \"단, 'Crypto Ban' 시나리오에서는 생존율이 급감하므로, [Hybrid Payment] 우회로가 필수입니다.\"");
} else {
  console.log("   \"이 모델은 위험합니다. 외부 충격에 취약합니다.\"");
}

// JSON 저장
const fs = require('fs');
fs.writeFileSync('/home/user/webapp/CROSS_VALIDATION_REPORT.json', JSON.stringify(report, null, 2));
