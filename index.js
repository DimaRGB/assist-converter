document.addEventListener('DOMContentLoaded', function (event) {
  var fileElement = document.getElementById('file');

  

  fileElement.addEventListener('change', function (event) {
    readFile(fileElement.files[0], convertToQST);
  });

  function readFile(file, callback) {
    var reader = new FileReader();
    reader.onload = function(event) {
      src = event.target.result;
      callback(src);
    }
    reader.readAsText(file);
  }

  function convertToQST (text) {

  }

  function download (text) {

  }

}, false);
