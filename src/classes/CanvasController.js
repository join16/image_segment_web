'use strict';

import * as _ from 'lodash';

export class CanvasController {
  constructor(htmlElement) {
    this.htmlElement = htmlElement;
    this.drawElements = [];
  }
  
  addElement(drawElement) {
    this.drawElements.push(drawElement);
  }
  
  removeElement(drawElement) {
    _.pull(this.drawElements, drawElement);
  }
  
  draw() {
    const ctx = this.htmlElement.getContext('2d');
    
    ctx.clearRect(0, 0, this.htmlElement.width, this.htmlElement.height);
    
    if (!this.drawElements.length) return;
    
    for (let drawElement of this.drawElements) {
      drawElement.draw(ctx);
    }
  }
  
  initialize(imageElement) {
    this.htmlElement.width = imageElement.width;
    this.htmlElement.height = imageElement.height;
    
    this.drawElements = [imageElement];
    this.draw();
  }
}