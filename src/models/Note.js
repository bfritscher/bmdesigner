const { v4: uuidv4 } = require("uuid");

export default class Note {
  constructor(args) {
    args = args || {};
    this.id = args.id || uuidv4();
    this.left = args.left || 0;
    this.top = args.top || 0;
    this.listLeft = args.listLeft || 0;
    this.listTop = args.listTop || 0;
    this.angle = args.angle || 0;
    this.height = args.height || 5;
    this.type = args.type || "";
    this.text = args.text || "";
    this.description = args.description || "";
    this.colors = args.colors && args.colors.length > 0 ? args.colors : [0];
    this.image = args.image || "";
    this.parent = args.parent || "";
    this.calcId = args.calcId || "";
    this.values = args.values || {};
    this.calcDisplayR = args.calcDisplayR || null;
    this.calcDisplayG = args.calcDisplayG || null;
    this.calcDisplayB = args.calcDisplayB || null;
    this.showLabel = "showLabel" in args ? args.showLabel : true;
    this.showAsSticky = "showAsSticky" in args ? args.showAsSticky : true;
    this.hidden = "hidden" in args ? args.hidden : false;
    this.children = args.children || [];
  }

  static changeColor(colorsSource, index, color) {
    const colors = colorsSource.slice(0);
    const oldIndex = colors.indexOf(color);
    if (index >= colors.length) {
      colors.push(color);
      // remove old color's position
      if (oldIndex > -1) {
        colors.splice(oldIndex, 1);
      }
      return colors;
    }
    if (oldIndex > -1) {
      const oldColor = colors[index];
      if (oldIndex === index && color === oldColor) {
        // remove only
        colors.splice(oldIndex, 1);
        return colors;
      }
      // replace
      colors.splice(oldIndex, 1, oldColor);
      colors.splice(index, 1, color);
      return colors;
    }
    colors.splice(index, 1, color);
    return colors;
  }
}
