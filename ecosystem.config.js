// ecosystem.config.js
// PM2 configuration for local Windows deployment.
// Runs both backend and frontend as managed processes.
// Auto-restarts on crash. Starts automatically on Windows boot.

module.exports = {
  apps: [
    {
      // ── Backend: Express + Node.js ────────────────────────────────────
      name: 'moto-pos-backend',
      script: './backend/dist/server.js', // Built TypeScript output
      cwd: './backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
    {
      // ── Frontend: Next.js standalone ─────────────────────────────────
      name: 'moto-pos-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
}
