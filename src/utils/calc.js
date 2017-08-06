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
            dep = `${note.id}.${dep}`;
          }
          return [`${note.id}.${key}`, dep];
        }));
      } catch (e) {
        console.log(e.message);
      }
    });
  });
  return graph;
}

export default function solve(notes) {
  const sortedDeps = toposort(generateDeps(notes));
  sortedDeps.reverse();
  const parser = math.parser();
  const dict = notes.reduce((d, note) => {
    // eslint-disable-next-line
    d[note.id] = note;
    parser.eval(`${note.id} = {}`);
    return d;
  }, {});
  sortedDeps.forEach((dep) => {
    const [id, key] = dep.split('.');
    console.log(`${dep} = ${dict[id].values[key]}`);
    parser.eval(`${dep} = ${dict[id].values[key]}`);
  });

  return parser.getAll();
}
