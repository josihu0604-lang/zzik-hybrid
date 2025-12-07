/**
 * PM2 Ecosystem Configuration
 *
 * 30시간+ 무중단 운영을 위한 프로세스 관리
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 logs zzik-ux-monitor
 *   pm2 monit
 */

module.exports = {
  apps: [
    {
      name: 'zzik-ux-monitor',
      script: 'pnpm',
      args: 'exec tsx scripts/continuous-ux-monitor.ts',
      cwd: '/home/ubuntu/zzik-hybrid',

      // 자동 재시작
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',

      // 재시작 정책
      restart_delay: 5000,
      max_restarts: 100,

      // 로그 설정
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/home/ubuntu/zzik-hybrid/logs/ux-monitor-error.log',
      out_file: '/home/ubuntu/zzik-hybrid/logs/ux-monitor-out.log',
      merge_logs: true,

      // 환경 변수
      env: {
        NODE_ENV: 'production',
        UX_AUTO_FIX: 'false',
      },
      env_autofix: {
        NODE_ENV: 'production',
        UX_AUTO_FIX: 'true',
      },

      // 크론 재시작 (매일 자정)
      cron_restart: '0 0 * * *',

      // 인스턴스 (단일)
      instances: 1,
      exec_mode: 'fork',
    },

    {
      name: 'zzik-dev-server',
      script: 'pnpm',
      args: 'dev',
      cwd: '/home/ubuntu/zzik-hybrid',

      autorestart: true,
      watch: false,
      max_memory_restart: '1G',

      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },

      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/home/ubuntu/zzik-hybrid/logs/dev-server-error.log',
      out_file: '/home/ubuntu/zzik-hybrid/logs/dev-server-out.log',
    },
  ],
};
