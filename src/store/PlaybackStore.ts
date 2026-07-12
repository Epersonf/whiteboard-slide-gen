import { makeAutoObservable } from 'mobx';

/**
 * Estado de reprodução do quadro único (tocando ou não, visível ou não
 * durante o fade). É efêmero — existe só enquanto o preview está tocando —
 * por isso vive numa instância separada do ProjectStore: misturar os dois
 * faria o dado do projeto "piscar" a cada troca de opacidade.
 */
export class PlaybackStore {
  isPlaying = false;
  /** Alvo de opacidade do quadro durante o play — o CSS anima até esse valor. */
  visible = true;
  /** Elemento sendo editado no momento — o <Stage> desenha uma caixa de debug em cima dele. */
  selectedElementId: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  play() {
    this.isPlaying = true;
    this.visible = false;
  }

  stop() {
    this.isPlaying = false;
    this.visible = true;
  }

  setVisible(visible: boolean) {
    this.visible = visible;
  }

  selectElement(id: string | null) {
    this.selectedElementId = id;
  }

  reset() {
    this.isPlaying = false;
    this.visible = true;
    this.selectedElementId = null;
  }
}
