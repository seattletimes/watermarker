module.exports = function(grunt) {

  var less = require("less");
  var fs = require("fs");

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-connect");

  grunt.initConfig({
    watch: {
      main: {
        files: ["src/*.*"],
        tasks: ["build"],
        options: {
          spawn: false,
          livereload: true
        }
      }
    },
    connect: {
      main: {
        options: {
          livereload: true,
          base: "."
        }
      }
    }
  });

  grunt.registerTask("build", function() {
    var c = this.async();

    var index = fs.readFileSync("src/index.html", { encoding: "utf8" });
    var style = fs.readFileSync("src/styles.less", { encoding: "utf8" });

    less.render(style, function(err, css) {
      var output = grunt.template.process(index, {
        data: {
          style: css,
          script: fs.readFileSync("src/script.js", { encoding: "utf8" }),
          light: fs.readFileSync("src/logo-light.png").toString("base64"),
          dark: fs.readFileSync("src/logo-dark.png").toString("base64")
        }
      });

      fs.writeFileSync("index.html", output);
      c();
    });
    
  });

  grunt.registerTask("default", ["build", "connect", "watch"]);

};