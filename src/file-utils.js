'use strict';

import JSZip from 'jszip';
import * as FileSaver from 'file-saver';

const fileUtils = exports;

fileUtils.readImages = async (inputElement) => {
  if (!inputElement || !inputElement.files || !inputElement.files.length) return;
  
  let files = [];
  
  for (let file of inputElement.files) {
    files.push(file);
  }
  
  files = files.filter(file => /\.(jpg|png|jpeg)$/.test(file.name));
  
  return await Promise.all(files.map(file => fileUtils.readInputFile(file)));
};

fileUtils.readInputFile = (file) => {
  const reader = new FileReader();
  
  return new Promise((resolve, reject) => {
    reader.onload = (e) => {
      resolve({
        name: file.name,
        data: e.target.result
      });
    };
    
    reader.readAsDataURL(file);
  });
};

fileUtils.saveAsZipFile = async (images, name) => {
  const zip = new JSZip();
  const folder = zip.folder('result');
  
  for (let image of images) {
    folder.file(image.name, image.data, { base64: true });
  }
  
  const blob = await zip.generateAsync({ type: 'blob' });
  
  FileSaver.saveAs(blob, name);
};