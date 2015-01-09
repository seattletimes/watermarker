(function() {

  //dom patching
  var queryAll = function(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  };
  var query = document.querySelector.bind(document);

  //globals
  var download = query(".download-button");
  var canvas = query("canvas");
  var context = canvas.getContext("2d");
  context.imageSmoothingEnabled = true;
  var config = {
    markLocation: { x: 10, y: 10 }
  };
  var light = new Image();
  light.src = "data:image/png;base64,<%= light %>";
  var dark = new Image();
  dark.src = "data:image/png;base64,<%= dark %>";
  var sourceImage;

  //updates
  var updateConfig = function() {
    config.limit = query(".limit").value;
    config.contrast = query("[name=contrast]:checked").value;
  };

  var render = function() {
    if (!sourceImage) return;
    if (sourceImage.width > sourceImage.height) {
      canvas.width = config.limit;
      var height = sourceImage.height / sourceImage.width;
      canvas.height = config.limit * height;
    } else {
      canvas.height = config.limit;
      var width = sourceImage.width / sourceImage.height;
      canvas.width = config.limit * width;
    }
    context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
    var watermark = config.contrast == "light" ? light : dark;
    context.drawImage(watermark, config.markLocation.x, config.markLocation.y);
    var data = canvas.toDataURL("image/jpeg");
    download.setAttribute("href", data);
  };

  //listeners
  var cancel = function(e) { e.preventDefault() };

  var onDrop = function(e) {
    e.stopPropagation();
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    //handle image links (maybe, probably not due to CORS)
    if (!file) {
      var url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
      sourceImage = new Image();
      sourceImage.onload = render;
      sourceImage.src = url;
      return;
    }
    var reader = new FileReader();
    reader.onload = function() {
      sourceImage = new Image();
      sourceImage.onload = render;
      sourceImage.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  document.body.addEventListener("dragover", cancel);
  document.body.addEventListener("drop", onDrop);

  var onClickCanvas = function(e) {
    if (e.target !== canvas) return;
    var canvasCoords = canvas.getBoundingClientRect();
    var adjusted = {
      x: e.pageX - canvasCoords.left,
      y: e.pageY - canvasCoords.top
    };
    if (adjusted.x > canvasCoords.width / 2) {
      config.markLocation.x = canvas.width - 10 - light.width;
    } else {
      config.markLocation.x = 10;
    }
    if (adjusted.y > canvasCoords.height / 2) {
      config.markLocation.y = canvas.height - 10 - light.height;
    } else {
      config.markLocation.y = 10;
    }
    render();
  };

  document.body.addEventListener("click", onClickCanvas);

  var onChange = function() {
    updateConfig();
    render();
  };

  document.body.addEventListener("change", onChange);
  document.body.addEventListener("keyup", onChange);

  //kickoff
  updateConfig();

})();