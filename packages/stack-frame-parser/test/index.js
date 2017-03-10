//@flow
const path = require('path');
const fs = require('fs');
const c = require('chalk');
const { parse: parseError } = require('..');

const tests = fs
  .readdirSync(__dirname)
  .filter(f => fs.statSync(path.join(__dirname, f)).isDirectory());

let passes = 0, failures = 0;
for (const test of tests) {
  console.log(`testing ${c.blue(test)}`);
  const dir = path.join(__dirname, test);
  const parts = fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.js') && fs.statSync(path.join(dir, f)).isFile());
  for (const part of parts) {
    console.log(`\trunning ${c.yellow(part)} ...`);
    // $FlowFixMe
    const { stack, expected } = require(path.join(dir, part));
    try {
      const parsed = parseError({ stack });
      if (parsed.length !== expected.length) {
        throw new Error('Parsed stack trace count mismatch.');
      }
      for (let index = 0; index < parsed.length; ++index) {
        const p = parsed[index], e = expected[index];
        const keys = Object.keys(p).filter(k => p[k] != null);
        const eKeys = Object.keys(e);
        if (keys.length !== eKeys.length) {
          throw new Error(
            `Expected key length mismatch: ${keys.toString()} vs ${eKeys.toString()}`
          );
        }
        for (const key of keys) {
          if (p[key] !== e[key]) {
            throw new Error(
              `Stack mismatch for ${key}. Expected ${e[key]}, got ${p[key]}.`
            );
          }
        }
      }
      ++passes;
    } catch (e) {
      console.log(e);
      ++failures;
    }
  }
  console.log();
}
if (failures > 0) {
  process.exit(1);
}
