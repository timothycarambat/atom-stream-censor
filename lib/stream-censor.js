'use babel';

import StreamCensorView from './stream-censor-view';
import { CompositeDisposable } from 'atom';

export default {

  streamCensorView: null,
  modalPanel: null,
  subscriptions: null,
  config: {
    isEnabled: {
      type: 'boolean',
      default: false,
      enum: [true, false]
    },
    blurClass: {
      type: 'string',
      default: 'stream-censor-low',
      enum:['stream-censor-low','stream-censor-med','stream-censor-high']
    },
    blurClassList: {
      type: 'array',
      description: 'Sets the Blur Intensity of the applied censor.',
      default: ['stream-censor-low','stream-censor-med','stream-censor-high']
    },
    sensitiveFiles: {
      type: 'array',
      description: 'List of types of files to filter for and blur.',
      default: [
        '.secrets',
        '.secret',
        '.env',
        'secrets.yml',
        'secret_token.rb',
        '.ftpconfig',
        'wp-config.php',
        'wp-cache-config.php'
      ],
      items: {
        type: 'string'
      }
    }
  },

  activate(state) {
    this.streamCensorView = new StreamCensorView(state.streamCensorViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.streamCensorView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'stream-censor:toggle': () => this.toggle(),
      'stream-censor:increaseBlur': () => this.changeBlur('increase', this.evaluateOpenTabs),
      'stream-censor:decreaseBlur': () => this.changeBlur('decrease', this.evaluateOpenTabs)
    }));

    atom.config.onDidChange('stream-censor.isEnabled', ({newValue, oldValue}) => {
      if (newValue) {
        atom.notifications.addInfo("Stream Censor is now enabled!", {icon:'key'})
      } else {
        atom.notifications.addInfo("Stream Censor is now disabled!", {icon:'eye'})
      }
      this.evaluateOpenTabs()
    });

    atom.workspace.onDidOpen((event) => {
        if(!this.packageStatus()){return true}
        this.evaluateOpenTabs()
      });
  },

  deactivate() {
    this.subscriptions.dispose();
    this.streamCensorView.destroy();
  },

  serialize() {
    return {
      streamCensorViewState: this.streamCensorView.serialize()
    };
  },

  toggle() {
    var currentSetting = atom.config.get('stream-censor.isEnabled')
    atom.config.set('stream-censor.isEnabled', !currentSetting)
  },
  packageStatus() {
    return atom.config.get('stream-censor.isEnabled')
  },
  evaluateOpenTabs() {
    atom.workspace.observeTextEditors((editor) => {
      const fileName = editor.getTitle()
      const sensitiveFileNames = atom.config.get('stream-censor.sensitiveFiles')
      const blurLevel = atom.config.get('stream-censor.blurClass')
      const blurClasses = atom.config.get('stream-censor.blurClassList')
      const packageStatus =  atom.config.get('stream-censor.isEnabled')

      if(packageStatus) {
        //apply blur class if out file name is in fileList
        if (sensitiveFileNames.includes(fileName)) {
          var classList = editor.element.classList.value.split(' ')
          var modifiedClassList = classList.filter((element) => !blurClasses.includes(element) ).join(' ')
          editor.element.classList.value = `${modifiedClassList} ${blurLevel}`
        }
      } else {
        //remove any blur classes from text editor
        var classList = editor.element.classList.value.split(' ') //eg: editor stream-censor-low
        var updatedClassList = classList.filter((element) => !blurClasses.includes(element) ).join(' ')
        editor.element.classList.value = updatedClassList
      }
    })
  },
  changeBlur(value, evaluateOpenTabs) {
    var currentBlur = atom.config.get('stream-censor.blurClass')
    var availableBlurs = atom.config.get('stream-censor.blurClassList')
    var index = availableBlurs.indexOf(currentBlur)

    if(value === 'increase') {
      if (index < availableBlurs.length-1) {
        atom.config.set('stream-censor.blurClass', availableBlurs[index+1])
        atom.notifications.addInfo("Stream Censor blur increased!", {icon:'arrow-up'})
      } else {
        atom.notifications.addInfo("Stream Censor is at maximum blur", {icon:'alert'})
      }
    } else if (value === 'decrease') {
      if (index > 0 && index <= availableBlurs.length-1) {
        atom.config.set('stream-censor.blurClass', availableBlurs[index-1])
        atom.notifications.addInfo("Stream Censor blur decreased!", {icon:'arrow-down'})
      } else {
        atom.notifications.addInfo("Stream Censor is at minimum blur", {icon:'alert'})
      }
    }
    evaluateOpenTabs()
}

};
