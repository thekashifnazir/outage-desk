import { spawn } from 'node:child_process';
const stages = process.argv.slice(2);
if (!stages.length || !stages.every(n => /^[1-9]$/.test(n))) throw new Error('Usage: node --env-file=.env.local scripts/run-astra.ts 1 2 3 4 5 6 7 8 9');
async function run(script: string, args: string[]) {
  if (!args.length) return;
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, ['--env-file=.env.local', `scripts/${script}.ts`, ...args], { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${script} exited ${code}`)));
  });
}
await run('astra-batch', stages);
await run('astra-drafts', stages.filter(n => n !== '9'));
await run('astra-verify', stages.filter(n => n !== '9'));
