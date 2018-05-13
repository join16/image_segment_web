'use strict';

import { DrawElement } from './DrawElement';

export class SegmentAreaElement extends DrawElement {
  constructor(points, color = '#ff0000', opacity = 0.5) {
    super();
    this.color = color;
    this.opacity = opacity;
    this.points = points;
  }
  
  static createFromJSON(json, color, opacity) {
    return new SegmentAreaElement(json.points, color, opacity);
  }
  
  move(x, y) {
    for (let point of this.points.slice(1)) {
      point.x += x;
      point.y += y;
    }
  }
  
  toJSON() {
    const points = this.points.map(point => ({ x: point.x, y: point.y }));
    
    return {
      points,
    };
  }
  
  isInArea(point) {
    let isInside = false;
    
    for (let i = 0, j = this.points.length - 1; i < this.points.length - 1; j = i++) {
      const a = this.points[i];
      const b = this.points[j];
  
      let isIntersect = ((a.y > point.y) !== (b.y > point.y)) &&
        (point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x);
      
      if (isIntersect) isInside = !isInside;
    }
    
    return isInside;
  }
  
  draw(ctx) {
    const start = this.points[0];
  
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    
    for (let point of this.points.slice(1)) {
      ctx.lineTo(point.x, point.y);
    }
  
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.fill();
    
    ctx.closePath();
  }
}