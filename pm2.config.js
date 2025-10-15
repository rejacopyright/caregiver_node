/* eslint-disable no-undef */
module.exports = {
  apps: [
    {
      name: 'node-ts',
      exec_mode: 'cluster',
      watch: ['src'],
      watch_delay: 1000,
      ignore_watch: ['node_modules', '\\.git', '*.log'],
      instances: 1,
      script: 'node_modules/.bin/tsx',
      args: 'src/bin/www.ts',
      env_local: {
        APP_ENV: 'local',
      },
      env_dev: {
        APP_ENV: 'dev',
      },
      env_prod: {
        APP_ENV: 'prod',
        PORT: 4000,
      },
    },
  ],
}
