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
  var config = window.config = {
    markLocation: { x: 10, y: 10 },
    textLocation: ["top", "left"],
    fontSize: 16
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
    config.type = query("[name=type]:checked").value;
    config.text = query(".manual").value;
    config.fontSize = query(".font-size").value * 1;
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
    if (config.type == "logo") {
      //add ST logo
      var watermark = config.contrast == "light" ? light : dark;
      context.drawImage(watermark, config.markLocation.x, config.markLocation.y);
    } else {
      var metrics = context.measureText(config.text);
      var x = config.textLocation[1] == "left" ? 10 : canvas.width - 10;
      var y = config.textLocation[0] == "top" ? 10 : canvas.height - 10;
      context.fillStyle = config.contrast == "light" ? "#DDD" : "#222";
      context.textBaseline = config.textLocation[0];
      context.textAlign = config.textLocation[1];
      context.font = config.fontSize + "px ff-meta-serif-web-pro";
      context.fillText(config.text, x, y);
    }
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

  document.querySelector("input[type=file]").addEventListener("change", function(e) {
    var input = e.target;
    var file = input.files[0];
    var reader = new FileReader();
    reader.onload = function() {
      sourceImage = new Image();
      sourceImage.onload = render;
      sourceImage.src = reader.result;
    }
    reader.readAsDataURL(file);
  });

  document.body.addEventListener("dragover", cancel);
  document.body.addEventListener("drop", onDrop);

  var onClickCanvas = function(e) {
    if (e.target !== canvas) return;
    var canvasCoords = canvas.getBoundingClientRect();
    var adjusted = {
      x: e.pageX - canvasCoords.left,
      y: e.pageY - canvasCoords.top
    };
    config.textLocation = [];
    if (adjusted.x > canvasCoords.width / 2) {
      config.markLocation.x = canvas.width - 10 - light.width;
      config.textLocation[1] = "right";
    } else {
      config.markLocation.x = 10;
      config.textLocation[1] = "left";
    }
    if (adjusted.y > canvasCoords.height / 2) {
      config.markLocation.y = canvas.height - 10 - light.height;
      config.textLocation[0] = "bottom";
    } else {
      config.markLocation.y = 10;
      config.textLocation[0] = "top";
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

  //load and launch typekit
  var typeConfig = {
    kitId: 'rvq5yyp',
    scriptTimeout: 3000,
    active: () => window.render ? render() : null
  },
  d = document,
  h = d.documentElement, t = setTimeout(function() {
    h.className = h.className.replace(/\bwf-loading\b/g, "") + " wf-inactive";
  }, typeConfig.scriptTimeout), tk = d.createElement("script"), f = false, s = d.getElementsByTagName("script")[0], a;
  h.className += " wf-loading";
  tk.src = '//use.typekit.net/' + typeConfig.kitId + '.js';
  tk.async = true;
  tk.onload = tk.onreadystatechange = function() {
    a = this.readyState;
    if (f || a && a != "complete" && a != "loaded") return;
    f = true;
    clearTimeout(t);
    try {
      Typekit.load(typeConfig)
    } catch (e) {}
  };
  s.parentNode.insertBefore(tk, s);

})();