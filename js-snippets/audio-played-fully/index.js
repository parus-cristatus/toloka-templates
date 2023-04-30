exports.Task = extend(TolokaHandlebarsTask, function (options) {
  TolokaHandlebarsTask.call(this, options);
  this.taskId = this.getOptions().task.id;
  this.assignment = this.getAssignment().getId();
  this.playState = this.storage.getItem(`playState_${this.taskId}_${this.assignment}`) || {
      loadError: false,
      audioEnded: false
  };
}, {

  onRender: function() {
    const dom = this.getDOMElement();
    const audioEl = dom.querySelector('.audio');
    const audioError = dom.querySelector('.audio-error');

    audioEl.addEventListener('error', () => {
      this.playState.loadError = true;
      audioError.textContent = 'Failed to load audio';
    });
    
    audioEl.addEventListener('ended', () => {
      this.playState.audioEnded = true; 
      this.hideTaskError();
      this.storage.setItem(`playState_${this.taskId}_${this.assignment}`, JSON.stringify(this.playState));
    }, {once: true});

    audioEl.addEventListener('play', () => {

      // To blur textareas on mobile devices. Not very optimal to recalculate and assign a value every event trigger. There may be a sense to interact with TaskSuite class.
      //  const textEls = [...this.getAssignment().getTaskSuite().getDOMElement().querySelectorAll('textarea')];
      //  textEls.forEach(textEl => textEl.blur());

       if (!this.playState.audioEnded) {
        audioEl.currentTime = 0;
        }
    });

  },
  validate: function() {
      let errors = null;

      // Check if audio played fully and show error message if not
      if (!this.playState?.audioEnded && !this.playState?.loadError) {
        errors = this.addError('Please listen to the sample without fast-forwarding till the end', '__TASK__', errors);
      }

      return errors || TolokaHandlebarsTask.prototype.validate.apply(this, arguments);
  },
  onDestroy: function() {
    console.log('destoyed ', this.storage);
    this.storage.clear();
  },
  addError: function (message, field, errors) {        
    errors || (errors = {
        task_id: this.getOptions().task.id,
        errors: {}
    });
    errors.errors[field] = {
        message: message
    };      
    return errors;
  }
});

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
