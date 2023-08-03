
export interface Node {
    name: string;
    color: string;
    centreX: number;
    centreY: number;
    radius: number;
    links?: Map<number,number>
  }
  export interface Edge {
    from_node: number;
    to_node: number;
  }
  export interface Size {
      width: number;
      height: number;
  }