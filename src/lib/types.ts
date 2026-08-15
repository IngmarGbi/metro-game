export interface Station {
  id: string;
  name: string;
  lat: number;
  lon: number;
  lines: string[];
  x: number;
  y: number;
}

export interface LineEdge {
  line: string;
  a: string;
  b: string;
}
