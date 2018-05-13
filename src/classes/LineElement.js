'use strict';

import { DrawElement } from './DrawElement';

export class LineElement extends DrawElement {
  
  constructor(color = '#ff0000',
              width = 1,
              autoCompleteRange = 30,
              autoCompleteColor = '#0000ff',
              autoCompleteOpacity = 0.5) {
    super();
    this.color = color;
    this.width = width;
    this.autoCompleteRange = autoCompleteRange;
    this.autoCompleteColor = autoCompleteColor;
    this.autoCompleteOpacity = autoCompleteOpacity;
    this.points = [];
  }
  
  isEmpty() {
    return !this.points.length;
  }
  
  canComplete(point) {
    if (!this.points.length || !point) return false;
    
    const start = this.points[0];
    return this.canBeClosed() && start.isNear(point, this.autoCompleteRange);
  }
  
  canBeClosed() {
    return this.points.length >= 2;
  }
  
  addPoint(point) {
    this.points.push(point);
  }
  
  getStartPoint() {
    return this.points[0] || null;
  }
  
  isStartPoint(point) {
    if (this.isEmpty()) return false;
    
    const start = this.points[0];
    
    return (point.x === start.x) && (point.y === start.y);
  }
  
  setCandidatePoint(point) {
    this.candidatePoint = point;
  }
  
  removeCandidatePoint() {
    this.candidatePoint = null;
  }
  
  draw(ctx) {
    if (this.isEmpty()) return;
    
    const start = this.points[0];
    
    ctx.beginPath();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    
    ctx.moveTo(start.x, start.y);
    
    for (let point of this.points.slice(1)) {
      ctx.lineTo(point.x, point.y);
    }
    
    const shouldDoAutoComplete = this.canComplete(this.candidatePoint);
    
    if (shouldDoAutoComplete) {
      this.candidatePoint = start;
    }
    if (this.candidatePoint) {
      ctx.lineTo(this.candidatePoint.x, this.candidatePoint.y);
    }
    
    ctx.stroke();
    ctx.closePath();
    
    // draw auto complete circle
    if (shouldDoAutoComplete) {
      ctx.beginPath();
      ctx.arc(start.x, start.y, this.autoCompleteRange, 2 * Math.PI, false);
      ctx.fillStyle = this.autoCompleteColor;
      ctx.globalAlpha = this.autoCompleteOpacity;
      ctx.closePath();
      ctx.fill();
    }
  }
}