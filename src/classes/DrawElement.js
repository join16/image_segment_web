'use strict';

let id = 0;

// base class
export class DrawElement {
  
  constructor() {
    this.id = ++id;
  }
  
  // virtual method
  draw() {
    throw new Error('draw method should be override');
  }
}