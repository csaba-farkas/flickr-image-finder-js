/**
 * @author Csaba Farkas
 * Student ID: R00117945
 * Email: csaba.farkas@mycit.ie
 * Date of last modification: 20/05/2016
 *
 * UPDATE:
 * urlEncode function added to remove any non-HTTP-safe character from the URL
 *
 * UPDATE 2:
 * I managed to get the preloader image to rotate thanks to Stackoverflow
 * Link: http://stackoverflow.com/questions/6410730/webkit-css-endless-rotation-animation-how
 * Code is referenced in the CSS file
 */
$(document).ready(init);

var API_KEY = "INSERT YOUR API KEY HERE";

var findButton;

var form;
var plusButton;
var inputDivs;
var activeImg;
var newScript;
var noResultsDiv;
var preloader;
var images;
var imageObjects;
var isStart;
var mainImage;

function init() {

  findButton = document.getElementById('findButton');
  findButton.onclick = findImages;

  form = document.getElementById('myForm');
  plusButton = document.getElementById('plusButton');
  plusButton.onclick = addField;

  inputDivs = new Array();

  //Create 'No Results' div
  noResultsDiv = document.createElement('div');
  noResultsDiv.appendChild(
    document.createElement('h2')
  );
  noResultsDiv.getElementsByTagName('h2')[0].innerHTML = 'No Results';
  noResultsDiv.style.position = "absolute";
  noResultsDiv.style.left = "50%";
  noResultsDiv.style.transform = "translateX(-50%)";
  noResultsDiv.style.fontFamily = "Arial, Helvetica, sans-serif";
  noResultsDiv.style.color = "gray";

  //Create spinning preloader image
  preloader = document.createElement('img');
  preloader.setAttribute('id', 'preloader');
  preloader.setAttribute('src', 'img/load.png');

  //Create img element for main image
  mainImage = document.createElement('img');
  mainImage.setAttribute('id', 'mainImage');

  //Arrow images fade in effect
  $('#carousel').mouseenter(function() {
    $('.navigation-arrow').fadeIn();
  });

  //Set up click handlers on left and right arrow images
  document.getElementById('left-arrow').onclick = slideRight;
  document.getElementById('right-arrow').onclick = slideLeft;

  //Set up key event handlers on left and right key.
  //Code is courtesy of Sygmoral http://stackoverflow.com/questions/1402698/binding-arrow-keys-in-js-jquery
  $(document).keyup(function(e) {
    switch(e.which) {
      case 39:
      slideLeft();
      break;
      case 37:
      slideRight();
      break;
      default:
      return;
    }
    e.preventDefault();
  });

  //Arrow images fade out effect
  $('#carousel').mouseleave(function() {
    $('.navigation-arrow').fadeOut();
  });

  $('#mainArea').css('height', $(window).height() * 0.9);
}

/**
 * This method adds a new textfield to the form on the left-hand side of
 * the page.
 */
function addField() {
  var container = document.createElement('div');
  //Create textfield
  var newField = document.createElement('input');
  newField.setAttribute('type', 'text');
  //Create - button
  var minusButton = document.createElement('input');
  minusButton.setAttribute('type', 'button');
  minusButton.setAttribute('value', '-');
  minusButton.onclick = function() {
    removeInput(this);
  }
  container.appendChild(newField);
  container.appendChild(minusButton);
  form.appendChild(container);

  //Add div to Array
  inputDivs.push(container);
}

/**
 * This method removes an text field from the form
 */
function removeInput(button) {
  for(var i = 0; i < inputDivs.length; i++) {
    if(inputDivs[i].getElementsByTagName('input')[1] === button) {
      form.removeChild(inputDivs[i]);
      inputDivs.splice(i, 1);
    }
  }
}

/**
 * Click event handler of 'Find Images' button.
 * Removes all the images from #inner-carousel.
 * Collects the tags from the input fields.
 * Creates a string from the tags which can be used in the URI.
 * I.e. it appends each tag with "%2C+" except for the last tag.
 * Then it constructs the URI and calls send_JSONP_Request function.
 */
function findImages() {
  if(document.getElementById('staticField').value.trim() === "") {
    alert("Please enter at least one tag");
    return;
  }
  //Remove all images from inner-carousel
  $("#inner-carousel").empty();
  $("#bigImg").empty();

  var imgTags = new Array();
  imgTags.push(document.getElementById('staticField').value);


  for(var i = 0; i < inputDivs.length; i++) {
    imgTags.push(inputDivs[i].getElementsByTagName('input')[0].value);
  }

    var url = encodeURI("https://api.flickr.com/services/rest/?"+
                        "method=flickr.photos.search" +
                        "&api_key=" + API_KEY +
                        "&tags=" + imgTags +
                        "&content_type=application%2Fjson" +
                        "&format=json" +
                        "&tag_mode=all" +
                        "&page=1" +
                        "&per_page=100" +
                        "&sort=date-taken-desc" +
                        "&callback=jsonFlickrApi" );

      send_JSONP_Request(url);
    }

/**
 * This function creates the script, which is used to get the images from
 * the API.
 */
function send_JSONP_Request(request) {
  //If 'No Results' is displayed, remove it
  if(document.getElementById('bigImg').getElementsByTagName('div')[0] === noResultsDiv) {
    document.getElementById('bigImg').removeChild(noResultsDiv);
  }

  //Set the preloader image as innerHTML of 'Find Button'

  findButton.innerHTML = '';
  findButton.appendChild(preloader);

  findButton.disabled = true;
  findButton.style.cursor = "wait";

  //Create API call script and add it to the head
  newScript = document.createElement('script');
  newScript.setAttribute('src', request);
  newScript.setAttribute('type', 'text/javascript');
  document.getElementsByTagName('head')[0].appendChild(newScript);
}

/**
 * This function is called when the API call is completed.
 * The images that are returned (if there are any) are parsed from the JSON.
 * Source of images are built individually.
 * Image elements are created and added to the carousel.
 * I store the Images as objects in a different array. Every image object has an
 * onload handler attached to it. If all of the images are loaded, activeImg is
 * set to 0, and the addImagesToCarousel is called. The piece of code is courtesy
 * of jfriend00 http://stackoverflow.com/questions/8264528/image-preloader-javascript-that-supports-events/8265310#8265310
 */
function jsonFlickrApi(data) {
  //Add preloader image to the 'bigImg' div.
  document.getElementById('bigImg').appendChild(preloader);


  if(data.stat !== "ok") {
    findButton.innerHTML = 'Find Images';
    findButton.disabled = false;
    findButton.style.cursor = "auto";
    return;
  }

  findButton.innerHTML = 'Find Images';
  findButton.disabled = false;
  findButton.style.cursor = "auto";

  document.head.removeChild(newScript);

  //Check if photos are included in the returned data and create urls that are
  //being used as src attributes of the images.
  if(data.photos.photo[0] !== undefined) {
    images = [];
    imageObjects = [];
    var remaining = data.photos.photo.length;
    for(var i = 0; i < data.photos.photo.length; i++) {
      var thisData = data.photos.photo[i];
      var url = "http://farm" + thisData.farm +
                  ".staticflickr.com/" + thisData.server +
                  "/" + thisData.id + "_" + thisData.secret + "_b.jpg";

      var newImg = document.createElement('img');
      newImg.setAttribute('src', url);
      newImg.setAttribute('class', 'thumbnail')
      images[i] = newImg;

      imageObjects[i] = new Image();
      imageObjects[i].src = url;
      imageObjects[i].onload = function() {
        remaining--;
        if(remaining <= 0) {
          activeImg = 0;
          isStart = true;
          document.getElementById('bigImg').removeChild(preloader);
          addImagesToCarousel();
        }
      }
    }
  } else {
    document.getElementById('bigImg').removeChild(preloader);
    document.getElementById('bigImg').appendChild(noResultsDiv);
  }
}

/**
 * The following method adds all the image elements created before and stored in the images
 * array to the DOM by appending #inner-carousel.
 * It also adds a click event handler to each image so when one of them is clicked, it becomes
 * the active image.
 */
function addImagesToCarousel() {
  for(var i = 0; i < images.length; i++) {
    document.getElementById('inner-carousel').appendChild(images[i]);
    imageRef = images[i];
    imageRef.nameIndex = i;
    imageRef.onclick = function() {
      activeImg = this.nameIndex;
      centerActiveImage();
    }
    //Call the next function only after the image elements were added. Otherwise the first
    //image will have 0 width (because it's not added to its parent element yet) and the
    //calculation of the image offset will be wrong.
    if(i === images.length -1) {
      centerThumbnails();
    }
  }
}

/**
 * This function vertically centers the thumbnail images.
 */
function centerThumbnails() {
  //Set images height in carousel to the height of the carousel itself
  var innerCarouselHeight = $('#inner-carousel').height();
  $('.thumbnail').height(innerCarouselHeight*0.8);
  $('.thumbnail').css('margin-top', (innerCarouselHeight/2) + 'px');
  $('.thumbnail').css('transform', 'translateY(-50%)');
  $('#bigImgContainer').css('height', $('#mainArea').height() - $('#carousel').height());
  centerActiveImage();
}

/**
 * This function is called whenever user moves the carousel. It calculates the inner-offset
 * of the active image by getting its offsetLeft property value subtracted from half of the
 * width of the outer-container.
 * It also sets the url of the big image to the url of the active image and formats it so
 * it fits into the display area.
 */
function centerActiveImage() {

  outerDivWidth = $('#carousel').width();
  innerLeftOffset = images[activeImg].offsetLeft;
  innerDivOffset = outerDivWidth/2 - innerLeftOffset;

  //Calculate half of the width of the image
  imgOffset = images[activeImg].width/2;

  //Images are sliding in from the right when the program starts
  if(isStart) {
    $('#inner-carousel').css('left', '100%');
    isStart = false;
  }
  $('#inner-carousel').animate({
      left: (innerDivOffset - imgOffset) + 'px'
  }, 500);

  //Set the src of the image in the middle (the active image) to the thumbnail that is in the middle
  mainImage.setAttribute('src', imageObjects[activeImg].src);

  //Depending on the widht/height ratio, I changed either the width or the height property
  //of the image in the middle.
  //This was the trickiest part for me, until I realized that I had to remove the css height
  //property first when I set the width. And I had to remove the css width property when I
  //set the height.
  if(imageObjects[activeImg].width / imageObjects[activeImg].height > 1) {
    if($(mainImage).css('height') !== '') {
      $(mainImage).css('height', '');
    }
    $(mainImage).css('width', outerDivWidth * 0.8);
    //Sometimes the new height of the image is still larger, than the height of the container.
    //To avoid these issues, I set up the following while loop that gradually reduces the width
    //until it is smaller than the height of the container.
    borderWidth = $(mainImage).css('border-top-width');
    parsedBorderWidth = parseInt(borderWidth);
    parsedBorderWidth *= 2;
    imageTotalHeightWithBorder = $(mainImage).height() + parsedBorderWidth;

    containerHeight = $('#bigImgContainer').height();
    while(imageTotalHeightWithBorder + 10 > containerHeight) { //I added 10 from the actual height so to give some padding
      newWidth = $(mainImage).width() * .9;
      $(mainImage).css('width', newWidth);
      imageTotalHeightWithBorder = $(mainImage).height() + parsedBorderWidth;
    }

  } else {
    if($(mainImage).css('width') !== '') {
      $(mainImage).css('width', '');
    }
    $(mainImage).css('height', $('#bigImgContainer').height() * 0.8);


  }
  setOpacity();
  $('#bigImg').append(mainImage);
}

/**
 * To make the display area responsive, I created the next function which is fired at
 * every window size change.
 */
window.onresize = function() {
  $('#mainArea').css('height', $(window).height() * 0.9);
  if(images.length !== undefined && images.length > 0) {
    addImagesToCarousel();
  }
};

/**
 * Function is called in the following cases:
 * User clicks on the right navigation-arrow image.
 * User presses and releases right arrow key
 * User clicks on an image which is right to the active image.
 */
function slideLeft() {
  if(activeImg < images.length - 1) {
    activeImg++;
    centerActiveImage();
  } else {
    activeImg = 0;
    centerActiveImage();
  }
}

/**
 * Same as above, but going the other way and using the opposite methods to fire
 * the function.
 */
function slideRight() {
  if(activeImg > 0) {
    activeImg--;
    centerActiveImage();
  } else {
    activeImg = images.length - 1;
    centerActiveImage();
  }
}

/**
 * The following function sets the opacity of each thumbnail image except for the
 * active image to 0.4
 */
function setOpacity() {
  for(var i = 0; i < images.length; i++) {
    if(i !== activeImg) {
      images[i].style.opacity = 0.4;
    } else {
      images[i].style.opacity = 1.0;
    }
  }
}
