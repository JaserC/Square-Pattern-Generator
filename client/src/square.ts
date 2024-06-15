import { List } from './list';


export type Color = "white" | "red" | "orange" | "yellow" | "green" | "blue" | "purple";

/** Converts a string to a color (or throws an exception if not a color). */
export const toColor = (s: string): Color => {
  switch (s) {
    case "white": case "red": case "orange": case "yellow":
    case "green": case "blue": case "purple":
      return s;

    default:
      throw new Error(`unknown color "${s}"`);
  }
};

export type Square =
    | {readonly kind: "solid", readonly color: Color}
    | {readonly kind: "split", readonly nw: Square, readonly ne: Square,
       readonly sw: Square, readonly se: Square};

/** Returns a solid square of the given color. */
export const solid = (color: Color): Square => {
  return {kind: "solid", color: color};
};

/** Returns a square that splits into the four given parts. */
export const split =
    (nw: Square, ne: Square, sw: Square, se: Square): Square => {
  return {kind: "split", nw: nw, ne: ne, sw: sw, se: se};
};


export type Dir = "NW" | "NE" | "SE" | "SW";

/** Describes how to get to a square from the root of the tree. */
export type Path = List<Dir>;


/** Returns JSON describing the given Square. */
export const toJson = (sq: Square): unknown => {
  if (sq.kind === "solid") {
    return sq.color;
  } else {
    return [toJson(sq.nw), toJson(sq.ne), toJson(sq.sw), toJson(sq.se)];
  }
};

/** Converts a JSON description to the Square it describes. */
export const fromJson = (data: unknown): Square => {
  if (typeof data === 'string') {
    return solid(toColor(data))
  } else if (Array.isArray(data)) {
    if (data.length === 4) {
      return split(fromJson(data[0]), fromJson(data[1]),
                   fromJson(data[2]), fromJson(data[3]));
    } else {
      throw new Error('split must have 4 parts');
    }
  } else {
    throw new Error(`type ${typeof data} is not a valid square`);
  }
}

/**
 * Returns the square at the end of a path 
 * @param sq refers to the root square
 * @param pth is the path to the square to retrieve 
 * @throws Error if path is not valid on the root square (sq param)
 * @returns a square found by traversing the root square with the given path
 */
export const findRoot = (sq: Square, pth: Path): Square => {
  if (pth.kind === "nil"){
    return sq;
  }
  else if(sq.kind !== "split"){
    throw new Error("Invalid path on root square");
  }
  else{
    const dir = pth.hd;
    if (dir === "NW" && sq.nw !== undefined){
      return findRoot(sq.nw, pth.tl);
    } 
    else if(dir === "NE" && sq.nw !== undefined){
      return findRoot(sq.ne, pth.tl);
    } 
    else if(dir === "SW" && sq.nw !== undefined){
      return findRoot(sq.sw, pth.tl);
    }
    else{
      return findRoot(sq.se, pth.tl);
    }
  }
}

/**
 * Returns a square identitical to the last except for the replacement of a subsection (could be a single square or an entire branch) given by a path
 * @param sq refers to the initial representation of the square
 * @param pth refers to the path to the part of the square that will be replaced
 * @param sq2 refers to the new square that will replace the old one
 * @throws Error if path is not valid on the root square (sq param)
 * @returns a square updated to represent the new square within itself
 */
export const replaceSquare = (sq: Square, pth: Path, sq2: Square): Square => {
  //if sq === solid and pth.kind !== nil, then we have an invalid path
  if(pth.kind !== "nil" && sq.kind === "solid"){
    throw new Error("Invalid path on root square");
  }
  else if(pth.kind === "nil" || sq.kind === "solid"){ //sq.kind being solid is just to satisify type checker
    return sq2;
  }
  else{
    const dir = pth.hd;
    if (dir === "NW"){
      return split(replaceSquare(sq.nw, pth.tl, sq2), sq.ne, sq.sw, sq.se);
    } 
    else if(dir === "NE"){
      return split(sq.nw, replaceSquare(sq.ne, pth.tl, sq2), sq.sw, sq.se);
    } 
    else if(dir === "SW"){
      return split(sq.nw, sq.ne, replaceSquare(sq.sw, pth.tl, sq2), sq.se);
    }
    else{
      return split(sq.nw, sq.ne, sq.sw, replaceSquare(sq.se, pth.tl, sq2));
    }
  }
}

