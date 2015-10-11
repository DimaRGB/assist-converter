document.addEventListener('DOMContentLoaded', function (event) {
  var form = document.getElementById('form');
  var srcTextArea = document.getElementById('src');
  var qstTextArea = document.getElementById('qst');
  var fileElement = document.getElementById('file');
  var downloadLink = document.getElementById('download');
  var newLineSymbol = (window.navigator && /win/i.test(navigator.platform)) ? '\r\n' : '\n';
  var qstFileName = 'converted_test';

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var convertedText = convertToQST(srcTextArea.value);
    qstTextArea.value = convertedText;
    setDownloadData(convertedText);
  });

  fileElement.addEventListener('change', function (event) {
    file = fileElement.files[0];
    qstFileName = file.name;
    readFile(fileElement.files[0], function (srcText) {
      srcTextArea.value = srcText;
      var convertedText = convertToQST(srcText);
      qstTextArea.value = convertedText;
      setDownloadData(convertedText);
    });
  });

  function readFile(file, callback) {
    var reader = new FileReader();
    reader.onload = function(event) {
      var srcText = event.target.result;
      callback(srcText);
    }
    reader.readAsText(file);
  }

  function convertToQST (srcText) {
    // replace true answers to +
    var qstText = srcText.replace(/^[ \t]*.[.][ \t]*[*@][ \t]*/img, '+');
    // replace false answers to -
    var qstText = qstText.replace(/^[ \t]*.[.][ \t]*/img, '-');
    // get only qustions and answers
    var qstText = '?\n' + qstText.match(/.*[:?.][ \t]*$(\n[+-]\S.*)*/img).join('\n?\n');
    // replace all \n to operation system new line symbol
    return qstText.replace(/\n/g, newLineSymbol);
  }

  function setDownloadData (qstText) {
    downloadLink.download = qstFileName.replace(/[.]\S*$/im, '') + '.qst';
    downloadLink.href = 'data:application/octet-stream,' + encodeURIComponent(qstText);
  }

});
