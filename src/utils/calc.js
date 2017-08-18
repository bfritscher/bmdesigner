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
  const graph = {
    nodes: new Set(notes.reduce((list, note) => list.concat(Object.keys(note.values || {}).map(k => `${note.calcId}.${k}`)), [])),
    edges: [],
  };
  notes.forEach((note) => {
    Object.keys(note.values || {}).forEach((key) => {
      // extract dependencies
      try {
        const vars = extractVar(math.parse(note.values[key]));
        graph.edges = graph.edges.concat(vars.map((dep) => {
          if (dep.indexOf('.') === -1) {
            // eslint-disable-next-line
            dep = `${note.calcId}.${dep}`;
          }
          const from = `${note.calcId}.${key}`;
          graph.nodes.add(from);
          graph.nodes.add(dep);
          return [from, dep];
        }));
      // eslint-disable-next-line
      } catch (e) {

      }
    });
  });
  return graph;
}

export default function solve(notes) {
  let sortedDeps;
  try {
    const graph = generateDeps(notes);
    sortedDeps = toposort.array([...graph.nodes], graph.edges);
  } catch (e) {
    const regex = /(.*): "(.*)"/;
    const m = regex.exec(e.message);
    return m ? {
      [`err_${m[2]}`]: m[1],
    } : { err: e.message };
  }
  sortedDeps.reverse();
  const parser = math.parser();
  const dict = notes.reduce((d, note) => {
    // eslint-disable-next-line
    d[note.calcId] = note;
    if (note.calcId) {
      try {
        parser.eval(`${note.calcId} = {}`);
      } catch (e) {
        return { err: 'Unsupported ID' };
      }
    }
    return d;
  }, {});
  sortedDeps.forEach((dep) => {
    const [calcId, key] = dep.split('.');
    try {
      parser.eval(`${dep} = ${dict[calcId].values[key]}`);
    } catch (e) {
      parser.set(`err_${dep}`, e.message);
    }
  });

  return parser.getAll();
}
