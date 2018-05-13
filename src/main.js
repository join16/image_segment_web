'use strict';

import $ from 'jquery';

import 'bootstrap/dist/css/bootstrap.min.css';

import { CanvasController } from './classes/CanvasController';
import { LineElement } from './classes/LineElement';
import { PointElement } from './classes/PointElement';
import { ImageElement } from './classes/ImageElement';
import { SegmentAreaElement } from './classes/SegmentAreaElement';
import * as fileUtils from './file-utils';

const $fileInput = $('#fileInput');
const $imgLoadBtn = $('#imageLoadBtn');
const $imageList = $('#imageList');
const $clearBtn = $('#clearBtn');
const $saveBtn = $('#saveBtn');

const KEY_CODES = {
  ESC: 27,
  ENTER: 13,
  ARROW_LEFT: 37,
  ARROW_TOP: 38,
  ARROW_RIGHT: 39,
  ARROW_DOWN: 40
};
const canvasElement = document.getElementById('segmentCanvas');
const canvasController = new CanvasController(canvasElement);
let segmentElement = null;
let imageItems = [];
let selectedImageItem = null;
let lineElement = null;
let grabbedPoint = null;

// event listeners

$imgLoadBtn.on('click', () => {
  $fileInput.click();
});

$imageList.on('click', '.image-list-item', async function () {
  const $this = $(this);
  if ($this.hasClass('active')) return;
  
  $imageList.find('.image-list-item').removeClass('active');
  $this.addClass('active');
  
  const name = $this.attr('data-name');
  const item = _findElementByName(imageItems, name);
  
  if (!item) return;
  
  selectedImageItem = item;
  await _handleSelectedImageItem();
});

$saveBtn.on('click', async () => {
  const images = [];
  
  for (let imageItem of imageItems) {
    if (!imageItem.segmentElement) continue;
    
    await imageItem.imageElement.load();
    canvasController.initialize(imageItem.imageElement);
    canvasController.addElement(imageItem.segmentElement);
    canvasController.draw();
    
    const data = canvasElement.toDataURL('image/jpeg').replace(/^data\:image\/jpeg\;base64\,/, '');
    images.push({ name: imageItem.name, data });
  }
  
  if (!images.length) {
    return alert('No Result to save!');
  }
  
  await fileUtils.saveAsZipFile(images, 'segment_result.zip');
  
  selectedImageItem = imageItems[0];
  _handleSelectedImageItem();
});

$clearBtn.on('click', () => {
  if (!imageItems.length) return;
  
  const isConfirmed = confirm('Are you sure?');
  if (!isConfirmed) return;
  
  localStorage.setItem('segmentResult', JSON.stringify({ segments: [] }));
  for (let imageItem of imageItems) {
    imageItem.segmentElement = null;
    imageItem.$el.removeClass('done');
  }
  
  selectedImageItem = imageItems[0];
  _handleSelectedImageItem();
});

$fileInput.on('change', async () => {
  imageItems = [];
  const images = await fileUtils.readImages($fileInput[0]);
  
  $imageList.html('');
  images.forEach((image, i) => {
    const $el = $(document.createElement('p'));
    const imageItem = {
      name: image.name,
      $el,
      index: i,
      segmentElement: null,
      imageElement: new ImageElement(image.data)
    };
    
    $el.addClass('image-list-item');
    $el.attr('data-name', image.name);
    $el.html(image.name);
    $el.append('<span class="badge badge-success">Done</span>');
    
    image.$el = $el;
    $imageList.append($el);
    imageItems.push(imageItem);
  });
  
  _loadSavedResults();
  
  selectedImageItem = imageItems[0];
  await _handleSelectedImageItem();
});

$(document).on('keydown', (e) => {
  let shouldDraw = false;
  
  switch (e.keyCode) {
    
    case KEY_CODES.ESC:
      if (lineElement) {
        canvasController.removeElement(lineElement);
        lineElement = null;
        shouldDraw = true;
        
      } else if (segmentElement) {
        canvasController.removeElement(segmentElement);
        segmentElement = null;
        grabbedPoint = null;
        shouldDraw = true;
        selectedImageItem.segmentElement = null;
        selectedImageItem.$el.removeClass('done');
        _saveAtLocalStorage();
        
      } else {
        const previousIndex = selectedImageItem.index - 1;
        if (previousIndex < 0) break;
        
        selectedImageItem = imageItems[previousIndex];
        _handleSelectedImageItem();
      }
      break;
    
    case KEY_CODES.ARROW_LEFT:
      if (!segmentElement) break;
      segmentElement.move(-1, 0);
      shouldDraw = true;
      break;
    
    case KEY_CODES.ARROW_RIGHT:
      if (!segmentElement) break;
      segmentElement.move(1, 0);
      shouldDraw = true;
      break;
    
    case KEY_CODES.ARROW_TOP:
      if (!segmentElement) break;
      segmentElement.move(0, -1);
      shouldDraw = true;
      break;
    
    case KEY_CODES.ARROW_DOWN:
      if (!segmentElement) break;
      segmentElement.move(0, 1);
      shouldDraw = true;
      break;
      
    case KEY_CODES.ENTER:
      if (!segmentElement) break;
      
      _saveAtLocalStorage();
      selectedImageItem.segmentElement = segmentElement;
      selectedImageItem.$el.addClass('done');
      const nextIndex = selectedImageItem.index + 1;
      if (nextIndex >= imageItems.length) break;
      
      selectedImageItem = imageItems[nextIndex];
      _handleSelectedImageItem();
      break;
    
  }
  
  if (shouldDraw) {
    canvasController.draw();
  }
});

// canvas implementation

canvasController.htmlElement.onclick = (e) => {
  if (!selectedImageItem) return;
  if (segmentElement) return;
  
  let currentPoint = PointElement.getCurrentPoint(canvasElement, e);
  
  if (!lineElement) {
    // initialize all
    lineElement = new LineElement();
    canvasController.addElement(lineElement);
  }
  
  if (lineElement.canComplete(currentPoint)) {
    currentPoint = lineElement.getStartPoint();
    lineElement.addPoint(currentPoint);
    segmentElement = new SegmentAreaElement(lineElement.points);
    canvasController.removeElement(lineElement);
    canvasController.addElement(segmentElement);
    lineElement = null;
    selectedImageItem.segmentElement = segmentElement;
    _saveAtLocalStorage();
    selectedImageItem.$el.addClass('done');
    
  } else {
    lineElement.addPoint(currentPoint);
  }
  
  canvasController.draw();
};

canvasController.htmlElement.onmousedown = (e) => {
  if (!segmentElement) return;
  if (grabbedPoint) return;
  
  const currentPoint = PointElement.getCurrentPoint(canvasElement, e);
  if (!segmentElement.isInArea(currentPoint)) return;
  console.log('inside area');
  
  grabbedPoint = currentPoint;
};

canvasController.htmlElement.onmouseup = (e) => {
  if (!segmentElement || !grabbedPoint) return;
  
  grabbedPoint = null;
  canvasController.draw();
};

canvasController.htmlElement.onmousemove = (e) => {
  if (!lineElement && !grabbedPoint) return;
  const currentPoint = PointElement.getCurrentPoint(canvasElement, e);
  if (grabbedPoint) {
    const moveX = currentPoint.x - grabbedPoint.x;
    const moveY = currentPoint.y - grabbedPoint.y;
    grabbedPoint = currentPoint;
    segmentElement.move(moveX, moveY);
  }
  if (lineElement) {
    lineElement.setCandidatePoint(currentPoint);
  }
  
  canvasController.draw();
};

// private methods

function _getSegmentResultFromLocalStorage() {
  let segmentResult = localStorage.getItem('segmentResult');
  if (segmentResult) {
    segmentResult = JSON.parse(segmentResult);
  }
  else {
    segmentResult = { segments: [] };
  }
  
  return segmentResult;
}

function _loadSavedResults() {
  const segmentResult = _getSegmentResultFromLocalStorage();
  
  for (let item of imageItems) {
    const result = _findElementByName(segmentResult.segments, item.name);
    if (!result || !result.data) continue;
    
    item.segmentElement = SegmentAreaElement.createFromJSON(result.data);
    item.$el.addClass('done');
  }
}

function _saveAtLocalStorage() {
  const segmentResult = _getSegmentResultFromLocalStorage();
  let segment = _findElementByName(segmentResult.segments, selectedImageItem.name);
  if (!segment) {
    segment = {
      name: selectedImageItem.name
    };
    segmentResult.segments.push(segment);
  }
  
  if (segmentElement) {
    segment.data = segmentElement.toJSON();
  } else {
    segment.data = null;
  }
  
  localStorage.setItem('segmentResult', JSON.stringify(segmentResult));
}

function _saveZipFile(data, name) {
  const a = document.createElement('a');
  
  document.body.appendChild(a);
  
  a.href = data;
  a.download = 'result_' + name;
  
  a.click();
  document.body.removeChild(a);
}

function _findElementByName(arr, name) {
  const i = _.findIndex(arr, el => el.name === name);
  
  return arr[i] || null;
}

async function _handleSelectedImageItem() {
  segmentElement = null;
  grabbedPoint = null;
  lineElement = null;
  
  $imageList.find('.image-list-item').removeClass('active');
  
  selectedImageItem.$el.addClass('active');
  await selectedImageItem.imageElement.load();
  
  canvasController.initialize(selectedImageItem.imageElement);
  
  if (selectedImageItem.segmentElement) {
    segmentElement = selectedImageItem.segmentElement;
    canvasController.addElement(segmentElement);
  }
  
  canvasController.draw();
}