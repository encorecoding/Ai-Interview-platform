const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const rootDir = path.join(__dirname, '..');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

const services = [
  {
    name: 'AI-SERVICE',
    color: COLORS.green,
    port: 5004,
    cmd: 'node',
    args: ['services/ai-service/src/server.js'],
    cwd: rootDir,
    env: { ...process.env, AI_SERVICE_PORT: '5004', PORT: '5004' },
  },
  {
    name: 'USER-SERVICE',
    color: COLORS.yellow,
    port: 5001,
    cmd: 'node',
    args: ['services/user-service/src/server.js'],
    cwd: rootDir,
    env: { ...process.env, USER_SERVICE_PORT: '5001', PORT: '5001' },
  },
  {
    name: 'RESUME-SERVICE',
    color: COLORS.magenta,
    port: 5002,
    cmd: 'node',
    args: ['services/resume-service/src/server.js'],
    cwd: rootDir,
    env: { ...process.env, RESUME_SERVICE_PORT: '5002', PORT: '5002' },
  },
  {
    name: 'INTERVIEW-SERVICE',
    color: COLORS.blue,
    port: 5003,
    cmd: 'node',
    args: ['services/interview-service/src/server.js'],
    cwd: rootDir,
    env: { ...process.env, INTERVIEW_SERVICE_PORT: '5003', PORT: '5003' },
  },
  {
    name: 'FEEDBACK-SERVICE',
    color: COLORS.yellow,
    port: 5005,
    cmd: 'node',
    args: ['services/feedback-service/src/server.js'],
    cwd: rootDir,
    env: { ...process.env, FEEDBACK_SERVICE_PORT: '5005', PORT: '5005' },
  },
  {
    name: 'ROADMAP-SERVICE',
    color: COLORS.cyan,
    port: 5006,
    cmd: 'node',
    args: ['services/roadmap-service/src/server.js'],
    cwd: rootDir,
    env: { ...process.env, ROADMAP_SERVICE_PORT: '5006', PORT: '5006' },
  },
  {
    name: 'GATEWAY',
    color: COLORS.bright + COLORS.cyan,
    port: 5000,
    cmd: 'node',
    args: ['services/api-gateway/src/server.js'],
    cwd: rootDir,
    env: { ...process.env, API_GATEWAY_PORT: '5000', PORT: '5000' },
  },
  {
    name: 'FRONTEND',
    color: COLORS.bright + COLORS.green,
    port: 5173,
    cmd: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'dev'],
    cwd: path.join(rootDir, 'frontend'),
    env: { ...process.env },
  },
];

console.log(`${COLORS.bright}====================================================${COLORS.reset}`);
console.log(`${COLORS.bright}  🚀 PrepAI Platform — Starting All Services...     ${COLORS.reset}`);
console.log(`${COLORS.bright}====================================================${COLORS.reset}\n`);

const processes = [];

services.forEach((s) => {
  const prefix = `${s.color}[${s.name}]${COLORS.reset} `;

  const proc = spawn(s.cmd, s.args, {
    cwd: s.cwd,
    env: s.env,
    shell: true,
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().trimEnd().split('\n');
    lines.forEach((line) => {
      if (line.trim()) console.log(`${prefix}${line}`);
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().trimEnd().split('\n');
    lines.forEach((line) => {
      if (line.trim()) console.error(`${prefix}${COLORS.red}${line}${COLORS.reset}`);
    });
  });

  proc.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`${prefix}${COLORS.red}exited with code ${code}${COLORS.reset}`);
    }
  });

  processes.push(proc);
});

function cleanup() {
  console.log(`\n${COLORS.yellow}Shutting down all services...${COLORS.reset}`);
  processes.forEach((proc) => {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', proc.pid, '/f', '/t']);
      } else {
        proc.kill('SIGTERM');
      }
    } catch {
      // Ignore
    }
  });
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
