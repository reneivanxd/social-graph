// import userData from "../data/UserData.json";
import { Graph } from "../model/Graph";
import { UserData } from "../model/User";
import {
  GraphData,
  GraphNode,
  GraphLink,
  GraphConfiguration,
} from "react-d3-graph";
import * as d3 from "d3";
import { randomChoose, unorderedPairs } from "../util";
import data from "../data/UserData.json";

export interface UserGraphNode extends GraphNode {
  name: string;
}

/**
 * A Service to handle user data manipulation
 */
class UserDataService {
  private graph: Graph<number, UserData>;
  private suggestionsResult: { key: string; edges: Set<string> };
  private findNodeResult: { key: string };
  private findEdgeResult: { source: string; target: string };
  private findPathResult: { source: string; target: string; path: Set<string> };

  public constructor() {
    this.graph = new Graph();

    data.users.forEach((user) => {
      this.graph.addNode(user.id, new UserData(user.id, user.name));
    });

    data.relations.forEach(([from, to]) => this.graph.addEdge(from, to));
  }

  /**
   * D3 graph configuration
   */
  public get d3Config(): Partial<GraphConfiguration<UserGraphNode, GraphLink>> {
    return {
      nodeHighlightBehavior: true,
      maxZoom: 8,
      minZoom: 0.1,
      height: 700,
      width: 1100,
      node: {
        color: "lightgreen",
        size: 500,
        fontSize: 12,
        fontWeight: "bold",
        highlightStrokeColor: "blue",
        labelProperty: (node) => node.name,
      },
      link: {
        highlightColor: "lightblue",
        strokeWidth: 4,
      },
      d3: {
        alphaTarget: 0.05,
        gravity: -400,
        linkLength: 100,
        disableLinkForce: false,
      },
    };
  }

  public loadSuggestions = (key: number): void => {
    this.reset();
    const suggest = this.graph
      .edgeSuggestions(key)
      .map((data) => String(data.id));
    if (suggest.length > 0) {
      this.suggestionsResult = { key: String(key), edges: new Set(suggest) };
    } else {
      alert(`No suggestions for ${key} found`);
    }
  };

  public loadPath = (source: number, target: number): void => {
    this.reset();
    const path = this.graph
      .getPath(source, target)
      .map((data) => String(data.id));
    if (path.length > 0) {
      this.findPathResult = {
        source: String(source),
        target: String(target),
        path: new Set(path),
      };
    } else {
      alert(`No path between ${source} and ${target} found`);
    }
  };

  public deleteNode = (key: number): void => {
    this.reset();
    this.graph.removeNode(key);
  };

  public deleteEdge = (source: number, target: number): void => {
    this.reset();
    this.graph.removeEdge(source, target);
  };

  public findNode = (key: number): void => {
    this.reset();
    const node = this.graph.findNode(key);

    if (node) {
      this.findNodeResult = { key: String(key) };
    } else {
      alert(`The user ${key} doesn't exist`);
    }
  };

  public findEdge = (source: number, target: number): void => {
    this.reset();
    if (this.graph.containsEdge(source, target)) {
      this.findEdgeResult = { source: String(source), target: String(target) };
    } else {
      alert(`Relation for ${source} and ${target} doesn't exist`);
    }
  };

  public getD3GraphData = (): GraphData<UserGraphNode, GraphLink> => {
    const nodes: UserGraphNode[] = [];
    const links: GraphLink[] = [];
    const addedLinks = new Set<string>();
    this.graph.forEach((node, edges) => {
      nodes.push(this.addNodeColor({ id: String(node.id), name: node.title }));
      edges.forEach((edge) => {
        const source = String(node.id);
        const target = String(edge.id);
        if (
          addedLinks.has(`${source}-${target}`) ||
          addedLinks.has(`${target}-${source}`)
        ) {
          return;
        }
        links.push(
          this.addLinkColor({
            source: String(node.id),
            target: String(edge.id),
          })
        );
        addedLinks.add(`${source}-${target}`);
      });
    });

    return {
      nodes,
      links,
    };
  };

  public printJSON = (): void => {
    const users: { id: number; name: string }[] = [];
    const relations: [number, number][] = [];
    const addedLinks = new Set<string>();
    this.graph.forEach((node, edges) => {
      users.push({ id: node.id, name: node.title });
      edges.forEach((edge) => {
        const source = node.id;
        const target = edge.id;
        if (
          addedLinks.has(`${source}-${target}`) ||
          addedLinks.has(`${target}-${source}`)
        ) {
          return;
        }
        relations.push([source, target]);
        addedLinks.add(`${source}-${target}`);
      });
    });

    const data = JSON.stringify({ users, relations });
    console.log(data);
  };

  private addNodeColor = (node: UserGraphNode): UserGraphNode => {
    let newNode = Object.assign({}, node);

    if (this.suggestionsResult) {
      if (this.suggestionsResult.key === node.id) {
        newNode = Object.assign(newNode, { color: "red" });
      } else if (this.suggestionsResult.edges.has(node.id)) {
        newNode = Object.assign(newNode, { color: "orange" });
      }
    }

    if (this.findNodeResult) {
      if (this.findNodeResult.key === node.id) {
        newNode = Object.assign(newNode, { color: "red" });
      }
    }

    if (this.findEdgeResult) {
      if (
        this.findEdgeResult.source === node.id ||
        this.findEdgeResult.target === node.id
      ) {
        newNode = Object.assign(newNode, { color: "red" });
      }
    }

    if (this.findPathResult) {
      const { source, target, path } = this.findPathResult;
      if (source === node.id || target === node.id) {
        newNode = Object.assign(newNode, { color: "red" });
      } else if (path.has(node.id)) {
        newNode = Object.assign(newNode, { color: "orange" });
      }
    }

    return newNode;
  };

  private addLinkColor = (link: GraphLink): GraphLink => {
    let newLink = Object.assign({}, link);

    if (this.findEdgeResult) {
      const { source, target } = this.findEdgeResult;
      if (
        (source === link.source && target === link.target) ||
        (source === link.target && target === link.source)
      ) {
        newLink = Object.assign(newLink, { color: "orange" });
      }
    }

    if (this.findPathResult) {
      const { path } = this.findPathResult;
      if (path.has(link.source) && path.has(link.target)) {
        newLink = Object.assign(newLink, { color: "orange" });
      }
    }

    return newLink;
  };

  public generateRamdonGraph = (nodes: number, edges: number): void => {
    this.reset();

    this.graph = new Graph();

    d3.range(nodes).forEach((id) => {
      this.graph.addNode(id, new UserData(id, `User ${id}`));
    });

    randomChoose(unorderedPairs(d3.range(nodes)), edges).forEach(([from, to]) =>
      this.graph.addEdge(from, to)
    );
  };

  public reset = () => {
    this.suggestionsResult = null;
    this.findEdgeResult = null;
    this.findNodeResult = null;
    this.findPathResult = null;
  };
}

const inst = new UserDataService();
export default inst;
