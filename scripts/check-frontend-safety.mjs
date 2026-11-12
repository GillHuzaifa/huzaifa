import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(process.cwd(), 'pulseq');
const scanRoots = [join(root, 'src'), join(root, 'public')];
const secretPattern = /(-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:api[_-]?key|client[_-]?secret|access[_-]?token|refresh[_-]?token|password)\s*[:=]\s*['"][^'"]{8,}['"])/i;
const findings = [];

function scan(directory) {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory)) {
    const file = join(directory, entry);
    if (statSync(file).isDirectory()) {
      scan(file);
      continue;
    }
    if (!/\.(css|html|js|json|scss|ts|txt|xml)$/.test(file)) continue;
    if (secretPattern.test(readFileSync(file, 'utf8'))) findings.push(relative(process.cwd(), file));
  }
}

for (const directory of scanRoots) scan(directory);

const browserOutput = join(root, 'dist', 'pulseq', 'browser');
function hasSourceMap(directory) {
  if (!existsSync(directory)) return false;
  return readdirSync(directory).some((entry) => {
    const file = join(directory, entry);
    return statSync(file).isDirectory() ? hasSourceMap(file) : file.endsWith('.map');
  });
}

if (hasSourceMap(browserOutput)) findings.push('pulseq/dist/pulseq/browser/*.map');

if (findings.length) {
  console.error(`Frontend safety check failed:\n${findings.join('\n')}`);
  process.exit(1);
}

console.log('Frontend safety check passed: no matching secrets or browser source maps found.');
