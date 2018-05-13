'use strict';

import { DrawElement } from './DrawElement';

export class ImageElement extends DrawElement {
  constructor(data) {
    super();
    this.data = data;
    this.htmlElement = null;
    this.width = -1;
    this.height = -1;
  }
  
  async load() {
    this.htmlElement = new Image();
    
    await new Promise((resolve, reject) => {
      this.htmlElement.src = this.data;
      this.htmlElement.onload = () => {
        this.width = this.htmlElement.width;
        this.height = this.htmlElement.height;
        resolve();
      };
    });
  }
  
  draw(ctx) {
    ctx.globalAlpha = 1;
    ctx.drawImage(this.htmlElement, 0, 0);
  }
}