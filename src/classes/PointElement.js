'use strict';

export class PointElement {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  static getCurrentPoint(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.x - rect.left;
    const y = e.y - rect.top;
    
    return new PointElement(x, y);
  }
  
  isNear(point, range) {
    const diffX = Math.abs(this.x - point.x);
    const diffY = Math.abs(this.y - point.y);
  
    return (diffX < range) && (diffY < range);
  }
  
}