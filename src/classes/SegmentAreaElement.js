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
    const points = json.points.slice(0, json.points.length - 1);
    points.push(points[0]);
    return new SegmentAreaElement(points, color, opacity);
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
    const points = this.points.slice(1);
    
    // for (let i = 0, j = points.length - 1; i < points.length - 1; j = i++) {
    //   const a = points[i];
    //   const b = points[j];
    //
    //   let isIntersect = ((a.y > point.y) !== (b.y > point.y)) &&
    //     (point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x);
    //
    //   if (isIntersect) isInside = !isInside;
    // }
    
    return _isInPolygon(point, points);
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

// private methods

function _isInPolygon(point, coords) {
  let isInside = false;
  for (let i = -1, length = coords.length, j = length - 1; ++i < length; j = i) {
    const a = coords[i];
    const b = coords[j];
    
    if (((a.y <= point.y && point.y < b.y) || (b.y <= point.y && point.y < a.y))
      && (point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x)) {
      isInside = !isInside;
    }
  }
  
  return isInside;
}