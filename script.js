// script.js

var img = new Image(); // used to load image from <input> and draw to canvas
// Fires whenever the img object loads a new image (such as with img.src =)
var user_input = document.getElementById("image-input");
var canvas = document.getElementById("user-image");
var ctx = canvas.getContext('2d');
const form = document.getElementById("generate-meme");
const buttons = document.getElementById("button-group").querySelectorAll('button'); // clear/ read text
var btn = form.querySelector('button'); // submit
var top_text = document.getElementById('text-top');
var bottom_text = document.getElementById('text-bottom');
var voiceSelect = document.getElementById('voice-selection');
var volume = document.getElementById('volume-group').querySelector('input');
var voice_volume = volume.value/100;
var synth = window.speechSynthesis;
var voices = [];
function populateVoiceList() {
  voices = synth.getVoices();
  voiceSelect.innerHTML = '';
  voices.forEach((voice) => {
      var listItem = document.createElement('option');
      listItem.textContent = voice.name;
      listItem.setAttribute('data-lang', voice.lang);
      listItem.setAttribute('data-name', voice.name);
      voiceSelect.appendChild(listItem);
  });
    voiceSelect.selectedIndex = 0;
}
populateVoiceList();
if(speechSynthesis !== undefined){
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

document.getElementById("image-input").addEventListener('change', (e) => {
  const file = e.target.files[0];
  const imgURL = URL.createObjectURL(file);
  img.src = imgURL;
  var filename = e.target.files[0].name;
  img.alt = filename;
  btn.disabled = false;
  buttons[0].disabled = true;
  buttons[1].disabled = true;
  voiceSelect.disabled = true;
});

img.addEventListener('load', () => {
  var dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  let edge_length;
  if(dimensions.width < dimensions.height)
    edge_length = dimensions.height;
  else
    edge_length = dimensions.width;
  if(edge_length == canvas.width)
    edge_length = edge_length*0.8;
  ctx.drawImage(img, 0, 0, img.width, img.height, 
    (canvas.width-edge_length)/2, (canvas.height-edge_length)/2, edge_length, edge_length);
  btn.disabled = false;
  buttons[0].disabled = true;
  buttons[1].disabled = true;
  voiceSelect.disabled = true;
});

form.addEventListener('submit', (e) => {
  ctx.font = "30px Comic Sans MS";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(top_text.value, canvas.width/2, 30);
  ctx.fillText(bottom_text.value, canvas.width/2, canvas.height-10);
  btn.disabled = true;
  buttons[0].disabled = false;
  buttons[1].disabled = false;
  voiceSelect.disabled = false;
  e.preventDefault();
});

buttons[0].addEventListener('click',() => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  btn.disabled = false;
  buttons[0].disabled = true;
  buttons[1].disabled = true;
  voiceSelect.disabled = true;
});

buttons[1].addEventListener('click',() => {
  var toSpeak = new SpeechSynthesisUtterance(top_text.value);
  var selectedVoiceName = voiceSelect.selectedOptions[0].getAttribute('data-name');
  let myVoice;
  for(let i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedVoiceName) {
      myVoice = voices[i];
    }
  }
  toSpeak.voice = myVoice;
  toSpeak.volume = voice_volume;
  synth.speak(toSpeak);
  toSpeak = new SpeechSynthesisUtterance(bottom_text.value);
  toSpeak.voice = myVoice;
  toSpeak.volume = voice_volume;
  synth.speak(toSpeak);
});

volume.addEventListener("change", function(e) {
  voice_volume = e.target.value / 100;
  let icon = document.getElementById("volume-group").querySelector('img');
  if(e.target.value > 67){
    icon.src = "icons/volume-level-3.svg";
    icon.alt = "Volume Level 3";
  }else if(e.target.value > 0 && e.target.value < 33){
    icon.src = "icons/volume-level-1.svg";
    icon.alt = "Volume Level 1";
  }else if(e.target.value == 0){
    icon.src = "icons/volume-level-0.svg";
    icon.alt = "Volume Level 0";
  }else{
    icon.src = "icons/volume-level-2.svg";
    icon.alt = "Volume Level 2";
  }
});
/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
