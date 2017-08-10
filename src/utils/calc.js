import math from 'mathjs';
import toposort from 'toposort';


function extractVar(node) {
  let list = [];
  if (node.args) {
    list = list.concat(...node.args.map(extractVar));
  }
  if (node.content) {
    list = list.concat(extractVar(node.content));
  }
  if (node.name) {
    let name = node.name;
    if (node.object && node.object.name) {
      name = `${node.object.name}.${name}`;
    }
    list.push(name);
  }

  return list;
}

function generateDeps(notes) {
  let graph = [];
  notes.forEach((note) => {
    Object.keys(note.values).forEach((key) => {
      // extract dependencies
      try {
        graph = graph.concat(extractVar(math.parse(note.values[key])).map((dep) => {
          if (dep.indexOf('.') === -1) {
            // eslint-disable-next-line
            dep = `${note.calcId}.${dep}`;
          }
          return [`${note.calcId}.${key}`, dep];
        }));
      } catch (e) {
        console.log(e.message, graph);
      }
    });
  });
  return graph;
}

export default function solve(notes) {
  let sortedDeps;
  try {
    const nodes = notes.reduce((list, note) => list.concat(Object.keys(note.values).map(k => `${note.calcId}.${k}`)), []);
    sortedDeps = toposort.array(nodes, generateDeps(notes));
    console.log('deps', sortedDeps);
  } catch (e) {
    const regex = /(.*): "(.*)"/;
    const m = regex.exec(e.message);
    return {
      [`err_${m[2]}`]: m[1],
    };
  }
  sortedDeps.reverse();
  const parser = math.parser();
  const dict = notes.reduce((d, note) => {
    // eslint-disable-next-line
    d[note.calcId] = note;
    parser.eval(`${note.calcId} = {}`);
    return d;
  }, {});
  sortedDeps.forEach((dep) => {
    const [calcId, key] = dep.split('.');
    console.log(`${dep} = ${dict[calcId].values[key]}`);
    try {
      parser.eval(`${dep} = ${dict[calcId].values[key]}`);
    } catch (e) {
      parser.set(`err_${dep}`, e.message);
    }
  });

  return parser.getAll();
}
