'use strict';

const $ = require('jquery');
const _ = require('lodash');

require('bootstrap/dist/css/bootstrap.min.css');

const fileUtils = require('./file-utils');

const canvasElement = document.getElementById('segmentCanvas');
const $input = $('#fileInput');
const $imgLoadBtn = $('#imageLoadBtn');
const $imageList = $('#imageList');

let isDrawing = false;
let isFinished = false;

let points = [];
let imageItems = [];

const range = 20;
let ctx = canvasElement.getContext('2d');
let currentImageItem = null;

$imgLoadBtn.on('click', () => {
  $input.click();
});

$imageList.on('click', '.image-list-item', function () {
  const $this = $(this);
  if ($this.hasClass('active')) return;
  
  $imageList.find('.image-list-item').removeClass('active');
  $this.addClass('active');
  
  const name = $this.html().trim();
  const item = _findElementByName(imageItems, name);
  
  if (!item) return;
  
  selectImageItem(item);
});

function _findElementByName(arr, name) {
  const i = _.findIndex(arr, el => el.name === name);
  
  return arr[i] || null;
}

$input.on('change', async () => {
  imageItems = await fileUtils.readImages($input[0]);
  let firstItem = null;
  
  $imageList.html('');
  imageItems.forEach(image => {
    const $el = $(document.createElement('p'));
    
    $el.addClass('image-list-item');
    $el.attr('data-name', image.name);
    $el.html(image.name);
    
    image.$el = $el;
    $imageList.append($el);
  });
  
  firstItem = imageItems[0];
  firstItem.$el.addClass('active');
  
  selectImageItem(firstItem);
});

function selectImageItem(item) {
  const el = new Image();
  el.src = item.data;
  drawElements.push({
    type: 'image',
    data: el
  });
  
  $(el).on('load', () => {
    currentImageItem = item;
    drawImage(el);
    isDrawing = false;
    isFinished = false;
    points = [];
  });
}

canvasElement.onclick = (e) => {
  if (isFinished) return;
  if (!isDrawing) isDrawing = true;
  
  const point = getCurrentPoint(e);
  
  if (points.length && isNearPoint(point, points[0], range)) {
    points.push(points[0]);
    isDrawing = false;
    points = cleanPathPoints(points);
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    drawImage(currentImage);
    drawWithPoints(ctx, points);
    isFinished = true;
    return;
  }
  
  points.push(point);
};

canvasElement.onmousemove = (e) => {
  if (!isDrawing) return;
  if (isFinished) return;
  if (!points.length) return;
  
  const current = getCurrentPoint(e);
  const begin = points[0];
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  ctx.globalAlpha = 1;
  
  // draw image
  drawImage(currentImage);
  
  ctx.beginPath();
  ctx.moveTo(begin[0], begin[1]);
  
  points.forEach(point => {
    ctx.lineTo(point[0], point[1]);
  });
  
  if ((points.length > 2) && isNearPoint(current, begin, range)) {
    ctx.lineTo(begin[0], begin[1]);
    ctx.strokeStyle = 'red';
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(begin[0], begin[1], range, 0, 2 * Math.PI, false);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.closePath();
  } else {
    ctx.lineTo(current[0], current[1]);
    ctx.strokeStyle = 'red';
    ctx.stroke();
  }
};

function getCurrentPoint(e) {
  const rect = canvasElement.getBoundingClientRect();
  const x = e.x - rect.left;
  const y = e.y - rect.top;
  
  return [x, y];
}

function isNearPoint(a, b, range) {
  const diffX = Math.abs(a[0] - b[0]);
  const diffY = Math.abs(a[1] - b[1]);
  
  return diffX < range && diffY < range;
}

function drawWithPoints(ctx) {
  
  const begin = points[0];
  
  ctx.beginPath();
  ctx.moveTo(begin[0], begin[1]);
  
  points.slice(1).forEach(point => {
    ctx.lineTo(point[0], point[1]);
  });
  
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = 'red';
  ctx.fill();
}

function cleanPathPoints(points) {
  const cleanedPoints = [];
  
  points.forEach(point => {
    if (!cleanedPoints.length) {
      cleanedPoints.push(point);
      return;
    }
    
    const lastPoint = lastElementInArray(cleanedPoints);
    if (isSamePoint(lastPoint, point)) return;
    
    cleanedPoints.push(point);
  });
  
  return cleanedPoints;
}

function drawImage(img) {
  if (!img) return;
  
  canvasElement.width = img.width;
  canvasElement.height = img.height;
  ctx = canvasElement.getContext('2d');
  
  ctx.drawImage(img, 0, 0);
}

function isSamePoint(a, b) {
  return (a[0] === b[0]) && (a[1] === b[1]);
}

function lastElementInArray(arr) {
  const index = arr.length - 1;
  if (index < 0) return null;
  
  return arr[index];
}