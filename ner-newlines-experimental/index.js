exports.Task = extend(TolokaHandlebarsTask, function (options) {
  TolokaHandlebarsTask.call(this, options);
}, {
  onRender: function() {

    // for review mode
    const labelsToColors  = {
      'image': 'pink',
      'video': '#afd2b0',
      'music': '#d0c3dc'
    };

    const task = this;
    const dom = this.getDOMElement();
    const textCont = dom.querySelector('.text');
    const text = textCont.innerHTML;
    const labelBtns = dom.querySelectorAll('.label');
    const errorCont = dom.querySelector('.error');
    let readonlyMode = this.getWorkspaceOptions().isReviewMode || this.getWorkspaceOptions().isReadOnly;
    let splits;
    let readyForSelection = false;
    const output = [];

//Split string into spans. Add event listeners after task is done.
const myPromise = new Promise(resolve => {
  resolve(textCont.innerHTML = surroundCharsWithSpan(text.trim()));
})
.then(() => {
  readyForSelection = true;
  splits = [...dom.querySelectorAll('span')];
  splits.forEach((split, i) => {
    split.addEventListener('click', () => {
      split.classList.contains('active') ? removeSelection(output, i, task, splits) : null;
    })
  });

  if (readonlyMode) {
    updateReviewView(splits, task);
  }
});

function updateReviewView(collection, context) {
  labelBtns.forEach(btn => btn.setAttribute('disabled', ''));
  splits.forEach(split => split.classList.add('active'));
  let output = context.getOptions().solution.output_values.selection;
      for (let selection of output) {
          for (let i = selection.offset; i < selection.offset + selection.length; i++) {
          collection[i].style.backgroundColor = `${labelsToColors[selection.label]}`;
        }
      }
}

labelBtns.forEach(btn => btn.addEventListener('click', e => {
  
  if (readyForSelection) {
    if(window.getSelection().toString()) {
      errorCont.textContent = '';
      let selectionColor = e.target.dataset.color;
      let currentSelection = {
        'label': '',
        'segment': '',
        'length': 0,
        'offset': 0
      };
      currentSelection.label = e.target.textContent.toLowerCase();
      currentSelection.segment = window.getSelection().toString();
      currentSelection.length = window.getSelection().toString().length;
      currentSelection.offset = getSelectionOffset(textCont);
      addSelection(output, currentSelection, task, selectionColor, splits);
      window.getSelection().removeAllRanges();
      
    } else {
      errorCont.textContent = 'Select a fragment';
    }
  } else {
    console.error('Something went wrong with splitting.')
  }

}));

  },
  validate: function(solution) {
        if (!solution.output_values.selection || solution.output_values.selection.length === 0) {
            return {
                task_id: this.getTask().id,
                errors: {
                    '__TASK__': {
                        message: 'Please do the task'
                    }
                }
            };
        } else {
            return TolokaHandlebarsTask.prototype.validate.apply(this, arguments);
        }
  }
});


/* ----
Formatting input string
---- */

function replaceBrWithNewline(str) {
  const regex = /<br\s*[\/]?>/gi;
  return str.replace(regex, '\n');
}


function splitStringIntoChars(str) {
  const result = [];
  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i);
    if (char.match(/[\w']+/)) {
      result.push(char);
    } else {
      result.push(...char.split(''));
    }
  }
  return result;
}

function surroundCharsWithSpan(str) {
  const chars = splitStringIntoChars(replaceBrWithNewline(str));
  let result = [];
  chars.forEach(char => {
    if (char === '\n') {
      result.push('<br>');
    } else if (char.match(/[\w']+/)) {
      result.push(`<span class='letter'>${char}</span>`)
    } 
    else {
      result.push(`<span class='sign'>${char}</span>`);
    }
  });
  return result.join('');
}

/* ----
Manipulating output and current selection
---- */

function addSelection(output, selection, context, color, collection) {
  output.push(selection);
  context.setSolutionOutputValue('selection', output);
  updateView(collection, selection, color, true);
}

function removeSelection(output, splitIndex, context, collection) {
  let checkIndex = findIndexInRange(output,splitIndex, context);
  if (checkIndex !== -1) {
    let removed = output.splice(checkIndex, 1)[0];
    context.setSolutionOutputValue('selection', output);
    updateView(collection, removed, null, false);
  }
}

function findIndexInRange(arr, x) {
  return arr.findIndex(obj => x >= obj.offset && x < obj.offset + obj.length);
}

function getSelectionOffset(container) {
  let selection = window.getSelection();
  let range = selection.getRangeAt(0);
  let preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(container);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  let startOffset = preSelectionRange.toString().length;
  return startOffset;
}

/* ----
View update initialized by output data change
---- */

function updateView(collection, selection, color, isAdd) {
  for (let i = selection.offset; i < selection.offset + selection.length; i++) {
    if (isAdd) {
      collection[i].classList.add('active');
      collection[i].style.backgroundColor = `${color}`;
    } else {
      collection[i].classList.remove('active');
      collection[i].style.backgroundColor = 'transparent';
    }
  }
}




function extend(ParentClass, constructorFunction, prototypeHash) {
  constructorFunction = constructorFunction || function () {};
  prototypeHash = prototypeHash || {};
  if (ParentClass) {
    constructorFunction.prototype = Object.create(ParentClass.prototype);
  }
  for (var i in prototypeHash) {
    constructorFunction.prototype[i] = prototypeHash[i];
  }
  return constructorFunction;
}
