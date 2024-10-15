import {AnimatedSprite, Container, Graphics, Texture} from 'pixi.js';

import {Constants, Models} from '@jouer/common';
import {Player} from './Player';
import {Card} from './Card';

export interface BaseProps {
  // x: number;
  // y: number;
  // radius: number;
  // zIndex?: number;
}

export class BaseEntity {
  container: Container;

  debug?: Graphics;

  constructor() {
    this.container = new Container();
    // Debug
    if (Constants.DEBUG) {
      this.debug = new Graphics();
      this.debug.setStrokeStyle({
        color: 'red',
        width: 1,
      });
      this.debug.circle(this.container.width / 2, this.container.height / 2, this.container.width / 2);
      this.debug.rect(0, 0, this.container.width, this.container.height);
      this.debug.fill();
      this.container.addChild(this.debug);
    }

    // Container
    this.container.pivot.set(this.container.width / 2, this.container.height / 2);
    // this.container.x = props.x;
    // this.container.y = props.y;
    this.container.sortChildren();
  }

  // Setters
  set visible(visible: boolean) {
    this.container.visible = visible;
  }

  // Getters
  get visible(): boolean {
    return this.container.visible;
  }
}
