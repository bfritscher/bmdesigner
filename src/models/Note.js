const uuidv4 = require('uuid/v4');

export default class Note {
  constructor(args) {
    this.id = args.id || uuidv4();
    this.left = args.left || 0;
    this.top = args.top || 0;
    this.type = args.type || '';
    this.text = args.text || '';
    this.colors = args.colors || [];
  }
}
