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
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'stream-censor:toggle': this.toggle,
        'stream-censor:increaseBlur': this.increaseBlur,
        'stream-censor:decreaseBlur': this.decreaseBlur,
      })
    );

    atom.config.onDidChange('stream-censor.isEnabled', ({newValue, oldValue}) => {
      if (newValue) {
        atom.notifications.addInfo("StreamCensor is now enabled.")
      } else {
        atom.notifications.addInfo("StreamCensor is now disabled.")
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
  increaseBlur(parent) {
    var currentSetting = atom.config.get('stream-censor.blurClass')
    var availableSettings = atom.config.get('stream-censor.blurClassList')
    var index = availableSettings.indexOf(currentSetting)

    if( index < availableSettings.length-1 ) {
      atom.config.set('stream-censor.blurClass', availableSettings[index+1])
      atom.notifications.addInfo("StreamCensor is blur increased. Reopen the File to see the change.")
    } else {
      atom.notifications.addInfo("StreamCensor is at maximum blur!")
    }
  },
  decreaseBlur(parent) {
    var currentSetting = atom.config.get('stream-censor.blurClass')
    var availableSettings = atom.config.get('stream-censor.blurClassList')
    var index = availableSettings.indexOf(currentSetting)

    if( index > 0 && index <= availableSettings.length-1 ) {
      atom.config.set('stream-censor.blurClass', availableSettings[index-1])
      atom.notifications.addInfo("StreamCensor is blur decreased. Reopen the File to see the change.")
    } else {
      atom.notifications.addInfo("StreamCensor is at minimum blur!")
    }
  },
  packageStatus() {
    return atom.config.get('stream-censor.isEnabled')
  },
  evaluateOpenTabs() {
    atom.workspace.observeTextEditors((editor) => {
      const fileItem = editor.getTitle()
      const sensitiveFileNames = atom.config.get('stream-censor.sensitiveFiles')
      const blurLevel = atom.config.get('stream-censor.blurClass')

      if( this.packageStatus() ){
        // if package is active and filename is in secrect list, apply blur
        if (sensitiveFileNames.includes(fileItem)) {
          var classList = editor.element.classList.value
          editor.element.classList.value = classList+' '+blurLevel
        }
      } else {
        var classList = editor.element.classList.value.split(' ')
        var blurClasses = atom.config.get('stream-censor.blurClassList')
        var updatedList = classList.filter((element) => !blurClasses.includes(element)).join(' ')
        editor.element.classList.value = updatedList
      }
    })
  }

};
