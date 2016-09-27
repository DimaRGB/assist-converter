document.addEventListener('DOMContentLoaded', function (event) {
  var form = document.getElementById('form');
  var srcTextArea = document.getElementById('src');
  var qstTextArea = document.getElementById('qst');
  var fileElement = document.getElementById('file');
  var downloadButton = document.getElementById('download');
  var qstFileName = 'Новий тест';

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
      fileElement.value = null;
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

  function convertToQST(srcText) {
    var newLineSymbol = (window.navigator && /win/i.test(navigator.platform)) ? '\r\n' : '\n';
    var qstText;
    [].forEach.call(form.querySelectorAll('[name=alg]'), function (radio) {
      if( radio.checked ) {
        qstText = eval(radio.value + '(srcText)');
      }
    });

    // replace all \n to operation system new line symbol
    return qstText.replace(/\n/g, newLineSymbol);
  }

  function convertToQSTAlg1 (srcText) {
    // remove all empty lines and empty spaces
    var qstText = srcText.replace(/\s*\n+\s*/g, '\n');

    // primary regular expressions
    var dotC = '[.)]?';
    var plusC = '[*@+]';
    var minusC = '[-]';

    // answer and quetion regular expressions
    var notEmptyLineRegExp = /^.+$/im;
    var answerRegExps = {
      'digit':  new RegExp('(\\n^' + plusC + '?\s*\\d' + dotC + '.+$){2,}', 'im'),
      'letter': new RegExp('(\\n^' + plusC + '?\s*[A-ZА-Я]' + dotC + '.+$){2,}', 'im')
    };
    var questionRegExps = {
      'digit': new RegExp(notEmptyLineRegExp.source + answerRegExps.digit.source, 'img'),
      'letter': new RegExp(notEmptyLineRegExp.source + answerRegExps.letter.source, 'img')
    };

    // search all meta questions, priority start with letter, after start with digit
    var metaQuestions = [];
    var letterQuestions = qstText.match(questionRegExps.letter);
    var digitQuestions = qstText.replace(questionRegExps.letter, '\n').match(questionRegExps.digit);
    metaQuestions = letterQuestions ? metaQuestions.concat(letterQuestions) : metaQuestions;
    metaQuestions = digitQuestions ? metaQuestions.concat(digitQuestions) : metaQuestions;

    // detect only real quetions
    var questions = [];
    for( var i = 0; i < metaQuestions.length; i++ ) {
      var quetion = metaQuestions[i];
      var arr = quetion.split('\n');
      var quetionText = arr[0];
      var metaAnswers = arr.slice(1);
      var answers = [];
      var isRealQuestion = false;

      // TODO: check for difference between quetion and answers types

      // check for plus and minus chars and convert
      for( var j = 0; j < metaAnswers.length; j++ ) {
        var answer = metaAnswers[j];
        var prefixRegExp = new RegExp('\\S' + dotC + '\\s*', 'im');
        var startRegExp = new RegExp('^' + prefixRegExp.source, 'im');
        var plusRegExp1 = new RegExp('^' + plusC + '\\s*' + prefixRegExp.source, 'im');
        var plusRegExp2 = new RegExp(startRegExp.source + plusC + '\\s*', 'im');
        var plusRegExp3 = new RegExp(plusC + '$', 'im');
        var minusRegExp = new RegExp('^' + minusC + '?\\s*' + prefixRegExp.source, 'im');
        if( plusRegExp1.test(answer) ) {
          answer = '+' + answer.replace(plusRegExp1, '');
          isRealQuestion = true;
        } else if( plusRegExp2.test(answer) ) {
          answer = '+' + answer.replace(plusRegExp2, '');
          isRealQuestion = true;
        } else if( plusRegExp3.test(answer) ) {
          answer = '+' + answer.replace(plusRegExp3, '').replace(startRegExp, '');
          isRealQuestion = true;
        } else {
          answer = '-' + answer.replace(minusRegExp, '');
        }
        answers.push(answer);
      }

      // push to questions if real question
      if( isRealQuestion ) {
        questions.push(quetionText + '\n' + answers.join('\n'));
      }
    }

    // join quetions to qstText
    return '?\n' + questions.join('\n?\n');
  }

  function convertToQSTAlg2 (srcText) {
    return srcText
      .match(/\?.+(\n[^?].*)+/img)
      .map(function (item) {
        var q = item.match(/^\?.+$\n/img)[0];
        q = q.replace(/^\?(.+)$/img, '?\n$1');

        var ans = item.replace(/^\?.+$\n/img, '');

        var p = ans.split('!')[0];
        var m = ans.split('!')[1];

        p = p.replace(/^(.+)$/img, '+$1');
        m = m.replace(/^(.+)$/img, '-$1');

        return q + p + m;
      })
      .join('\n')
      .replace(/\n\n/g, '\n');
  }

  function setDownloadData (qstText) {
    downloadButton.onclick = function () {
      var downloadLink = document.createElement('a');
      downloadLink.download = qstFileName.replace(/[.]\S*$/im, '') + '.qst';
      downloadLink.href = 'data:application/octet-stream;charset=Windows-1252,' + encodeURIComponent(qstText);
      downloadLink.click();
    };
  }
});
