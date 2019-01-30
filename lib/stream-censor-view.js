'use babel';

export default class StreamCensorView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('stream-censor');
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    atom.config.set('stream-censor.isEnabled', false)
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
