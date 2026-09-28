import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');
mkdirSync(root, { recursive: true });

const RATE = 22050;

function tone(time, frequency, { attack = 0.01, release = 0.08, volume = 0.35, harmonics = 0 } = {}) {
  const envelope = time < attack ? time / attack : Math.exp(-(time - attack) / release);
  const fundamental = Math.sin(2 * Math.PI * frequency * time);
  const overtone = harmonics ? Math.sin(2 * Math.PI * frequency * harmonics * time) * 0.25 : 0;
  return Math.max(-1, Math.min(1, (fundamental + overtone) * envelope * volume));
}

function mix(duration, voices) {
  const count = Math.ceil(duration * RATE);
  const samples = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    const time = index / RATE;
    samples[index] = voices.reduce((sum, voice) => sum + voice(time), 0);
  }
  return samples;
}

function writeWav(name, samples) {
  const bytes = Buffer.alloc(44 + samples.length * 2);
  bytes.write('RIFF', 0);
  bytes.writeUInt32LE(36 + samples.length * 2, 4);
  bytes.write('WAVE', 8);
  bytes.write('fmt ', 12);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(RATE, 24);
  bytes.writeUInt32LE(RATE * 2, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36);
  bytes.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((sample, index) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    bytes.writeInt16LE(Math.round(clamped * 32767), 44 + index * 2);
  });
  writeFileSync(join(root, name), bytes);
}

writeWav(
  'coin.wav',
  mix(0.28, [
    (time) => (time < 0.12 ? tone(time, 880, { release: 0.05, volume: 0.28 }) : 0),
    (time) => (time > 0.08 ? tone(time - 0.08, 1320, { release: 0.08, volume: 0.22 }) : 0),
  ]),
);

writeWav(
  'buy.wav',
  mix(0.24, [(time) => tone(time, 520, { release: 0.07, volume: 0.24, harmonics: 2 })]),
);

writeWav(
  'reward.wav',
  mix(0.42, [
    (time) => tone(time, 523, { release: 0.08, volume: 0.22 }),
    (time) => (time > 0.1 ? tone(time - 0.1, 659, { release: 0.08, volume: 0.2 }) : 0),
    (time) => (time > 0.2 ? tone(time - 0.2, 784, { release: 0.1, volume: 0.2 }) : 0),
  ]),
);

writeWav(
  'rest.wav',
  mix(0.5, [(time) => tone(time, 392, { attack: 0.04, release: 0.22, volume: 0.16 })]),
);

writeWav(
  'pet.wav',
  mix(0.18, [(time) => tone(time, 740, { attack: 0.005, release: 0.05, volume: 0.16 })]),
);

writeWav(
  'error.wav',
  mix(0.28, [
    (time) => tone(time, 220, { release: 0.08, volume: 0.18 }),
    (time) => (time > 0.08 ? tone(time - 0.08, 185, { release: 0.09, volume: 0.16 }) : 0),
  ]),
);
