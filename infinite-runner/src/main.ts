import './style.css';
import { Game } from './core/Game';

window.addEventListener('DOMContentLoaded', () => {
  console.log('App Initializing...');
  try {
    const game = new Game();
    (window as any).game = game;
    console.log('Game Initialized');
  } catch (e) {
    console.error('Game Init Failed:', e);
  }
});
