import React, { Component, ChangeEvent, MouseEvent } from "react";
import { Square, Path, findRoot, replaceSquare, split, solid, toColor  } from './square';
import { SquareElem } from "./square_draw";
import { len, prefix } from "./list";


type EditorProps = {
  /** Initial state of the file. */
  initialState: Square;

  /** Name of the file being edited */
  saveName: string;

  /** Save callback passed from App to save square */
  /** Takes the name of the file and the square as params */
  onSave: (saveName: string, data: Square) => void;

  /** Back callback passed from App to return to home page */
  onBack: () => void;
};


type EditorState = {
  /** The root square of all squares in the design */
  root: Square;

  /** Path to the square that is currently clicked on, if any */
  selected?: Path;
};


/** UI for editing the image. */
export class Editor extends Component<EditorProps, EditorState> {

  constructor(props: EditorProps) {
    super(props);

    this.state = { root: props.initialState };
  }

  render = (): JSX.Element => {

    //If there is a square selected, find path to square and provide editing tools 
    if(this.state.selected !== undefined){    
      const selectedSq = findRoot(this.state.root, this.state.selected);

      if (selectedSq.kind === "solid"){
        const selectedColor = selectedSq.color;
        return (<>
            <SquareElem width={600n} height={600n}
                          square={this.state.root} selected={this.state.selected}
                          onClick={this.doSquareClick}/>
            <button onClick={ this.doSplitClick }>Split</button>
            <button onClick={ this.doMergeClick }>Merge</button>
            <select value={selectedColor} onChange={ evt => this.doColorChange(evt) }>
              <option value="white">white</option>
              <option value="red">red</option>
              <option value="orange">orange</option>
              <option value="yellow">yellow</option>
              <option value="green">green</option>
              <option value="blue">blue</option>
              <option value="purple">purple</option>
            </select>
            <button onClick={ () => this.props.onSave(this.props.saveName, this.state.root) }>Save</button>
            <button onClick={ this.props.onBack }>Back</button>
        </>);
      }
      return <></>; //Only needed to satisfy linter (you can only select solid squares)
    }
    //If there is no square selected, then only display square along with save and back buttons
    else{
      return (
      <>
      <SquareElem width={600n} height={600n}
        square={this.state.root} selected={this.state.selected}
        onClick={this.doSquareClick}/>
      <button onClick={ () => this.props.onSave(this.props.saveName, this.state.root) }>Save</button>
      <button onClick={ this.props.onBack }>Back</button>
      </>
      );
    }
  };

  //On a square click, the state will reflect the path to the selected square
  doSquareClick = (path: Path): void => {
    this.setState({selected: path});
  }

  //If the split button is clicked, then the square will be updated and the state reflects the new, modified square
  doSplitClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
    
    if(this.state.selected !== undefined){
      const newSquare: Square = findRoot(this.state.root, this.state.selected);
      const newRoot: Square = replaceSquare(this.state.root, this.state.selected, split(newSquare, newSquare, newSquare, newSquare))
      
      this.setState({root: newRoot, selected: undefined});
      return;
    }
    //If there's no square selected, do nothing
    return;
  };

  //If the merge button is clicked, then the square will be updated and the state reflects the new, modified square
  doMergeClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
    if(this.state.selected !== undefined && this.state.selected.kind !== "nil"){
      const newSquare: Square = findRoot(this.state.root, this.state.selected);
      const pathOneNodeBack = prefix(len(this.state.selected) - 1n, this.state.selected)
      if (newSquare.kind === "solid"){
        const newRoot: Square = replaceSquare(this.state.root, pathOneNodeBack, solid(newSquare.color));
        this.setState({root: newRoot, selected: undefined});
      }
      return;
    }
    //If there's no square selected, do nothing
    return;
  };

  //If the split button is clicked, then the square will be updated and the state reflects the new, modified square
  doColorChange = (_evt: ChangeEvent<HTMLSelectElement>): void => {
    if(this.state.selected !== undefined){
      const newRoot: Square = replaceSquare(this.state.root, this.state.selected, solid(toColor(_evt.target.value)));
      
      this.setState({root: newRoot, selected: undefined});
      return;
    }
    //If there's no square selected, do nothing
    return;
  };
}
