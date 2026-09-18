import FruitDrop from './FruitDrop.js';

const fruitDrop: FruitDrop = new FruitDrop(document.getElementById('game') as HTMLCanvasElement);

window.addEventListener('load', () => {
  fruitDrop.start();
});
