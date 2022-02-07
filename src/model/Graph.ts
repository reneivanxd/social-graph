export interface IGraph<TKey, TValue> {
  size: number;
  addNode(key: TKey, value: TValue): void;
  findNode(key: TKey): TValue | undefined;
  removeNode(key: TKey): void;
  addEdge(fromKey: TKey, toKey: TKey): void;
  removeEdge(fromKey: TKey, toKey: TKey): void;
  containsEdge(fromKey: TKey, toKey: TKey): boolean;
  edgeSuggestions(key: TKey): TValue[];
  getPath(fromKey: TKey, toKey: TKey): TValue[];
  forEach(callbackfn: (node: TValue, edges: TValue[]) => void): void;
}

/**
 * Internal structure to store the graph node data
 */
class GraphNode<TKey, TValue> {
  private key: TKey;
  private data: TValue;
  private edgesSet: Set<TKey> = new Set();

  public constructor(key: TKey, data: TValue) {
    this.key = key;
    this.data = data;
  }

  public get id(): TKey {
    return this.key;
  }

  public get value(): TValue {
    return this.data;
  }

  public get edges(): Set<TKey> {
    return this.edgesSet;
  }

  public addEdge(edgeKey: TKey): void {
    if (!this.edgesSet.has(edgeKey)) {
      this.edgesSet.add(edgeKey);
    }
  }

  public removeEdge(edgeKey: TKey): boolean {
    return this.edgesSet.delete(edgeKey);
  }

  public containsEdge(edgeKey: TKey): boolean {
    return this.edgesSet.has(edgeKey);
  }
}

/**
 * A Graph Data Structure Implementation
 */
export class Graph<TKey, TValue> implements IGraph<TKey, TValue> {
  private graph: Map<TKey, GraphNode<TKey, TValue>> = new Map();

  /**
   * The size of the graph (number of nodes)
   */
  public get size(): number {
    return this.graph.size;
  }

  /**
   * Adds a node to the graph
   *
   * @param key node's identifier
   * @param value node's data
   */
  public addNode(key: TKey, value: TValue): void {
    if (!this.graph.has(key)) {
      this.graph.set(key, new GraphNode(key, value));
    }
  }

  /**
   * Gets the node's data by its indetifier
   *
   * @param key node's identifier
   * @returns node's data or undefined
   */
  public findNode(key: TKey): TValue | undefined {
    return this.graph.get(key)?.value;
  }

  /**
   * Removes a node from the graph
   *
   * @param key node's identifier
   */
  public removeNode(key: TKey): void {
    if (!this.graph.has(key)) {
      // the node doesn't exist
      return;
    }

    this.graph.delete(key);
    this.graph.forEach((node) => node.removeEdge(key));
  }

  /**
   * Adds an edge to the graph
   *
   * @param fromKey from node's identifier
   * @param toKey to node's identifier
   */
  public addEdge(fromKey: TKey, toKey: TKey): void {
    const fromNode = this.graph.get(fromKey);
    const toNode = this.graph.get(toKey);

    if (!fromNode || !toNode) {
      return;
    }

    fromNode.addEdge(toKey);
    toNode.addEdge(fromKey);
  }

  /**
   * Removes an edge from the graph
   *
   * @param fromKey from node's identifier
   * @param toKey to node's identifier
   */
  public removeEdge(fromKey: TKey, toKey: TKey): void {
    const fromNode = this.graph.get(fromKey);
    const toNode = this.graph.get(toKey);

    if (!fromNode || !toNode) {
      return;
    }

    fromNode.removeEdge(toKey);
    toNode.removeEdge(fromKey);
  }

  /**
   * Checks if an edge exists
   *
   * @param fromKey from node's identifier
   * @param toKey to node's identifier
   * @returns true if exists; false otherwise;
   */
  public containsEdge(fromKey: TKey, toKey: TKey): boolean {
    const fromNode = this.graph.get(fromKey);
    const toNode = this.graph.get(toKey);

    if (!fromNode || !toNode) {
      return false;
    }

    return fromNode.containsEdge(toKey) && toNode.containsEdge(fromKey);
  }

  /**
   * Generates an array of connection suggestions for a given node
   * NOTE: a suggestion is defined as nodes that are connected
   * to two or more of my neighbors but not with me
   *
   * @param key node's identifier
   * @returns array of nodes
   */
  public edgeSuggestions(key: TKey): TValue[] {
    const edges: TValue[] = [];
    const node = this.graph.get(key);
    if (!node) {
      return [];
    }

    const countMap = new Map<TKey, number>();
    const nodeEdges = node.edges;

    nodeEdges.forEach((edgeKey) => {
      const edgeNode = this.graph.get(edgeKey);
      if (!edgeNode) return;

      edgeNode.edges.forEach((edgeEdgeKey) => {
        if (edgeEdgeKey === key || nodeEdges.has(edgeEdgeKey)) return;

        const count = countMap.get(edgeEdgeKey) || 0;
        countMap.set(edgeEdgeKey, count + 1);
      });
    });

    countMap.forEach((count, edgeKey) => {
      if (count < 2) return;

      const edgeNode = this.graph.get(edgeKey);
      if (!edgeNode) return;

      edges.push(edgeNode.value);
    });

    return edges;
  }

  /**
   * Generates the path between two nodes
   *
   * @param fromKey from node's identifier
   * @param toKey to node's identifier
   * @returns array of nodes
   */
  public getPath(fromKey: TKey, toKey: TKey): TValue[] {
    const fromNode = this.graph.get(fromKey);
    const toNode = this.graph.get(toKey);
    if (!fromNode || !toNode) {
      return [];
    }

    const queue = [fromNode];
    const pathMap = new Map<TKey, TKey>();
    const visited = new Set<TKey>([fromKey]);

    while (queue.length > 0) {
      const node = queue.shift();
      if (node === toNode) {
        return this.buildPath(fromKey, toKey, pathMap);
      }

      node.edges.forEach((edge) => {
        if (visited.has(edge)) return;

        const edgeNode = this.graph.get(edge);
        queue.push(edgeNode);
        visited.add(edge);
        pathMap.set(edge, node.id);
      });
    }

    return [];
  }

  /** helper private method to getPath */
  private buildPath(
    fromKey: TKey,
    toKey: TKey,
    pathMap: Map<TKey, TKey>
  ): TValue[] {
    let currentKey = toKey;
    const path: TValue[] = [];

    while (currentKey !== fromKey) {
      const node = this.graph.get(currentKey);
      path.push(node.value);
      currentKey = pathMap.get(currentKey);
    }

    path.push(this.graph.get(fromKey).value);

    return path.reverse();
  }

  /**
   * Helper method to iterate through the graph nodes
   *
   * @param callbackfn callback function
   */
  public forEach(callbackfn: (node: TValue, edges: TValue[]) => void): void {
    this.graph.forEach((node) => {
      const edges: TValue[] = [];
      node.edges.forEach((key) => {
        const edgeNode = this.graph.get(key);
        if (edgeNode) {
          edges.push(edgeNode.value);
        }
      });

      callbackfn(node.value, edges);
    });
  }
}
