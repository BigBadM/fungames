export default class SoundManager {
    static play(sound, volume = 1) {
        const audio = new Audio(sound);
        audio.volume = volume;
        audio.play();
    }
}
//# sourceMappingURL=soundManager.js.map