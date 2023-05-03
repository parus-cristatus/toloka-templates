exports.Task = extend(TolokaHandlebarsTask, function (options) {
  TolokaHandlebarsTask.call(this, options);
}, {
  onRender: function() {
    const task = this;
    task.modalOpened = false;
    const dom = this.getDOMElement();
    const items = [...dom.querySelectorAll('.carousel-item')];
    const next = dom.querySelector('.next');
    const prev = dom.querySelector('.prev');
    const dots = dom.querySelectorAll('.dot');
    const images = [...dom.querySelectorAll('.carousel-item img')];
    const modalWindow = dom.querySelector('.modal-dialog');
    const modalImage = dom.querySelector('.modal-img');
    let current = 0;

    dots[current].classList.add('active');

    const switchDots = (current) => {
       dots.forEach(dot => dot.classList.remove('active'));
       dots[current].classList.add('active');
    }

    const moveItems = (delta) => {
      current = (current + delta + items.length) % items.length;
      items.forEach(item => {
        item.style.transform = `translateX(-${100 * current}%)`;
      });
      switchDots(current);
    }

    next.addEventListener('click', () => moveItems(1));
    prev.addEventListener('click', () => moveItems(-1));

    images.forEach(image => {
      image.addEventListener('error', () => {
        image.src = 'https://pics.st/94e/4e0/aef8e255.png';
        image.alt = 'Image not found';
      });
    });

    images.forEach(image => {
      image.addEventListener('click', () => {
        task.modalOpened = true;
        modalImage.src = image.src;
        dom.querySelector('.modal-dialog').showModal();
      });
    });

    modalWindow.addEventListener('click', () => {
      modalWindow.close();
      task.modalOpened = false;
      });

  },
  onDestroy: function() {
    // _TANKER_TRANSLATE_prj:default:ondestroy 
  },

  onKey: function(key) {
    if (key === 'S') this.getDOMElement().querySelector('.next').click();
    if (key === 'A') this.getDOMElement().querySelector('.prev').click();
    TolokaHandlebarsTask.prototype.onKey.call(this, key);
  },
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
