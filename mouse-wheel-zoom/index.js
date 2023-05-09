exports.Task = extend(TolokaHandlebarsTask, function (options) {
  TolokaHandlebarsTask.call(this, options);
}, {
  onRender: function() {

    const dom = this.getDOMElement();
    const textInput = dom.querySelector('textarea');
    const wrapper = dom.querySelector('.image-wrapper');
    const image = dom.querySelector('.image');
    const zoomInBtn = dom.querySelector('.zoomin');
    const zoomOutBtn = dom.querySelector('.zoomout');
    const resetBtn = dom.querySelector('.reset');

    const scaleFactor = 1.1;
    const maxScale = 3;
    const minScale = 1;
    let isDragging = false;
    let startX, startY, imageX = 0, imageY = 0, scale = 1;

    textInput.spellcheck = false;

    zoomInBtn.addEventListener('click', () => {
      zoom(-1);
      image.style.transform = `scale(${scale})`;
    });

    zoomOutBtn.addEventListener('click', () => {
      zoom(1);
      image.style.transform = `scale(${scale})`;
    });

    resetBtn.addEventListener('click', () => {
      startX = 0, startY = 0, imageX = 0, imageY = 0, scale = 1;
      image.style.left = `0px`;
      image.style.top = `0px`;
      image.style.transform = `scale(1)`;
      image.style.transformOrigin = `center`;
    });


    wrapper.addEventListener('wheel', e => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 : -1;
      let [originX, originY] = calcTransformOrigin(image, e);
      zoom(delta);


      if (delta === -1) image.style.transformOrigin = `${originX}% ${originY}%`;
      image.style.transform = `scale(${scale})`;
    });


    // Dragging

    wrapper.addEventListener('mousedown', e => {
        isDragging = true;
        wrapper.style.cursor = 'grabbing';
        startX = e.clientX - imageX;
        startY = e.clientY - imageY;
    });

    wrapper.addEventListener('mousemove', e => {
      if (isDragging) {
        imageX = e.clientX - startX;
        imageY = e.clientY - startY;
        image.style.left = `${imageX}px`;
        image.style.top = `${imageY}px`;
      }
    });

    wrapper.addEventListener('mouseup', () => {
      isDragging = false;
      wrapper.style.cursor = 'grab';
    });


    function zoom (delta) {  
      if (delta === 1) {
        scale /= scaleFactor;
      } else {
        scale *= scaleFactor;
      }
      if (scale > maxScale) scale = maxScale;
      if (scale < minScale) scale = minScale;
    }

    function getCurrentRect(image) {
      return image.getBoundingClientRect();
    }

    function calcTransformOrigin(image, event) {
      const rect = getCurrentRect(image);
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      let originX = x / rect.width * 100;
      let originY = y / rect.height * 100;
      return [originX, originY];
    }

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
