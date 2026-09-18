export default class SoundManager {
  public static play(sound: string, volume: number = 1): void {
    const audio: HTMLAudioElement = new Audio(sound);
    audio.volume = volume;
    audio.play();
  }
}

