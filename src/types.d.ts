
export interface Node {
  index: index;
  name: string;
  color: string;
  centreX: number;
  centreY: number;
  radius: number;
  links?: Map<number,number>
  boundingBox : BoundingBox;
}

  export interface Edge {
    from_node: number;
    to_node: number;
    angle?:number;
    endX?:number;
    endY?:number;
  }

  export interface Size {
      width: number;
      height: number;
  }

  export interface Vector {
    x: number;
    y: number;
  }

  export interface BoundingBox {
    left: number;
    top: number;
    right: number;
    bottom: number;
  }

  export interface NodePair {
    staticNode: Node;
    movingNode: Node;
    vector: Vector;
  }
  
  export interface NodeVector {
      node: Node;
      vector: Vector
  }
  export interface NodeVectorAmplitude {
    node: Node;
    vector: Vector;
    amplitude: number
  }
