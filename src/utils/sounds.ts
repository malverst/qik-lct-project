import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

export type SoundName = 'coin' | 'buy' | 'reward' | 'rest' | 'pet' | 'error';

const SOURCES: Record<SoundName, number> = {
  coin: require('../../assets/sounds/coin.wav'),
  buy: require('../../assets/sounds/buy.wav'),
  reward: require('../../assets/sounds/reward.wav'),
  rest: require('../../assets/sounds/rest.wav'),
  pet: require('../../assets/sounds/pet.wav'),
  error: require('../../assets/sounds/error.wav'),
};

const players = new Map<SoundName, AudioPlayer>();
let modeReady: Promise<void> | null = null;

function prepareMode(): Promise<void> {
  modeReady ??= setAudioModeAsync({
    playsInSilentMode: false,
    shouldPlayInBackground: false,
    interruptionMode: 'mixWithOthers',
  }).catch(() => undefined);
  return modeReady;
}

export function playSound(name: SoundName): void {
  void prepareMode().then(async () => {
    let player = players.get(name);
    if (!player) {
      player = createAudioPlayer(SOURCES[name]);
      players.set(name, player);
    }
    try {
      await player.seekTo(0);
      player.play();
    } catch {
      // Звук только дополняет действие и не должен его останавливать.
    }
  });
}
