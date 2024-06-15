import React, { ChangeEvent, Component } from "react";
import { Square, fromJson, solid, split, toJson, /*Path*/ } from './square';
import { Editor } from "./Editor";
import { isRecord } from "./record";

//Page type to store possible page options
type Page = {kind: "home"} | {kind: "editing", file: Square}


type AppState = {
  /** Current list of all saved file names */
  files: string[] | undefined,

  /** Reflects current interface (either home or editor) */
  page: Page,

  /** Reflects user's input as to what file name to create or load */
  newFile: string;
};


export class App extends Component<{}, AppState> {

  constructor(props: {}) {
    super(props);

    this.state = {files: undefined, page: {kind: "home"}, newFile: ""};
  }
  
  /** When the page first loads, fetch the most recent list of saved file */
  componentDidMount = (): void => {
    this.doRefreshClick();
  }

  render = (): JSX.Element => {
    //If the page state is set to home, list all saved files and provide the option of creating a new square
    if (this.state.page.kind === "home"){

      return (
      <>
        <h1>Saved Workflows</h1>
        <ul>{this.renderFiles()}</ul>
        <input type="text" value={this.state.newFile} onChange={ this.doNewNameChange } />
        <button type="button" onClick={ this.doCreateClick }>Create</button>
      </>
      );      
    }
    //If the page state is set to editing, call Editor component with name of the file and content (as well as callbacks)
    else{
      return <Editor initialState={this.state.page.file} saveName={this.state.newFile} onSave={this.doSaveClick} onBack={this.doBackClick}/>
    }
  };

  /** Will iterate through savedFiles state and display all saved files as a list item */
  renderFiles = (): JSX.Element[] => {
    const savedFiles: JSX.Element[] = [];
    // Informal Invariant: savedFiles = this.state.files[0...j] to <li>
    // For-of loops are different, but the principle is that at the top and bottom of the loop, savedFiles stores all indices processed so far from this.state.files as list items
    if(this.state.files !== undefined){ 
      for (const file of this.state.files) {
        savedFiles.push(
          <li key={ file }>
            <a href="#" onClick={() => this.doLoadClick(file)}>{ file }</a>
          </li>);
      }
    }
    return savedFiles;
  };

  /** If invoked will change the state to render the editor with a generic square */
  doCreateClick = (): void => {
    if (this.state.newFile.length > 0){ //Cannot create a square with no name
      const sq = split(solid("blue"), solid("orange"), solid("purple"), solid("red"));
      this.setState({page: {kind: "editing", file: sq}});
    }
    return;
  }

  /** LOAD API PROCESSING */
  /** Will take a "name" param and pass it to the load api where it will be processed and return a response*/
  doLoadClick = (file: string): void => {
    const url = "/api/load?" + "name=" + encodeURIComponent(file);
    fetch(url)
      .then(this.doLoadResp)
      .catch(() => this.doLoadError("failed to connect to server"));
  }
  /** If a successful response, pass the JSON to next function to be parsed, otherwise returns error */
  doLoadResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doLoadJson)
        .catch(() => this.doLoadError("not JSON"));
    } else if (res.status === 404) {
      res.text().then(this.doLoadError)
        .catch(() => this.doLoadError("not text"));
    } else {
      this.doLoadError(`bad status: ${res.status}`);   
    }
  };
  /** Parses the response data into acceptable format and updates state to reflect data user wants to interact with */
  doLoadJson = (data: unknown): void => {
    if (!isRecord(data)) {
      console.error("bad data from /save: not a record", data);
      return;
    }
    if (typeof data.name !== 'string') {
      console.error("bad data from /save: name is not a string", data);
      return;
    }
    const loadedSquareName: string = data.name;
    const loadedSquare = fromJson(data.value);
    this.setState({newFile: loadedSquareName, page: {kind: "editing", file: loadedSquare}});
  }
  doLoadError = (msg: string): void => {
    console.error(`Error fetching /api/load: ${ msg }`);
  }

  /** SAVE API PROCESSING */
  /** Will take in arguments for name & square, call the save API with this data in the request, and return a response */
  doSaveClick = (saveName: string, data: Square): void => {
    const requestBody = {name: saveName, value: toJson(data)};
    fetch("/api/save", {
      method: "POST", body: JSON.stringify(requestBody),
      headers: {"Content-Type": "application/json"} })
      .then(this.doSaveResp)
      .catch(() => this.doSaveError("failed to connect to server"));
  }
  /** The response will either be an error, or will be a success that redirects the user to the homepage */
  doSaveResp = (res: Response) : void => {
    if (res.status === 200) {
      this.doRefreshClick();
      this.setState({newFile: "", page: {kind: "home"}});
    } else if (res.status === 400) {
      res.text().then(this.doSaveError)
          .catch(() => this.doSaveError("400 response is not text"));
    } else {
      this.doSaveError(`bad status code ${res.status}`);
    };
    return;
  }
  doSaveError = (msg: string): void => {
    console.error(`Error fetching /api/save: ${ msg }`);
  }

  /** LIST API PROCESSING */
  /** Will process response from list api request, perform any potential error handling, format response data, and then update client state to reflect server state*/
  doListResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doListJson)
        .catch(() => this.doListError("not JSON"));
    } else {
      this.doListError(`bad status: ${res.status}`);   
    }
  };
  doListJson = (data: unknown): void => {
    if (!isRecord(data)) {
      console.error("bad data from /list: not a record", data);
      return;
    }
    if (!Array.isArray(data.names)) {
      console.error("bad data from /api/list: names is not an array", data);
      return;
    }

    const listedFiles: string[] = [];
    for (const val of data.names) {
      if (val === undefined)
        return;
      listedFiles.push(val);
    }
    this.setState({files: listedFiles});

  }
  doListError = (msg: string): void => {
    console.error(`Error fetching /api/list: ${ msg }`);
  }

  /** If invoked, redirect user to home page and update list of files */
  doBackClick = (): void => {
    this.doRefreshClick();
    this.setState({newFile: "", page: {kind: "home"}});
  }

  /** Every invocation will update the state to reflect the user's new input */
  doNewNameChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ newFile: evt.target.value });
  };

  /** Call list api and pass the response to doListResp */
  doRefreshClick = (): void => {
    fetch("/api/list").then(this.doListResp)
        .catch(() => this.doListError("failed to connect to server"));
  };

}
