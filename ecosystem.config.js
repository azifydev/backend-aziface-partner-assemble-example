const { config } = require('dotenv');
config({ path: '.env' });

const instances = Number(process.env.INSTANCES_NUMBER || '1');
const maxMemory = process.env.MAX_MEMORY || '2G';
const nodeEnv = process.env.NODE_ENV || 'development';
const appName = process.env.APP_NAME || 'assemble';

module.exports = {
  apps: [
    {
      name: `${appName}-${nodeEnv}`.toUpperCase(),
      script: './dist/main.js',
      instances: instances,
      exec_mode: 'cluster',
      max_memory_restart: maxMemory,
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_type: 'json',
      log_file: './logs/combined.log',
      max_size: '5M',
      merge_logs: true,
    },
  ],
};
