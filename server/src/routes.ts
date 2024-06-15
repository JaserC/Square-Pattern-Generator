import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";


// Require type checking of request body.
type SafeRequest = Request<ParamsDictionary, {}, Record<string, unknown>>;
type SafeResponse = Response;  // only writing, so no need to check

//Global storage for all files and their contents
const files: Map<string, unknown> = new Map<string, unknown>();

/** Returns a list of all the named save files */
/** Takes parameters "name" and "value" in request body */
/** Responds with 400 if either "name" or "value" is missing in request body, or with success information  */
export const save = (req: SafeRequest, res: SafeResponse): void => {
  
  const name = req.body.name;
  if (name === undefined || typeof name !== 'string') {
    res.status(400).send('Faulty request: argument "name" was missing or incorrectly formatted');
    return;
  }

  const value = req.body.value;
  if (value === undefined) {
    res.status(400).send('Faulty Request: request body is missing argument "value"');
    return;
  }

  files.set(name, value);
  res.status(200).send(`${ name } was saved`);
  return;
}

/** Returns a list of saved files in the form of an array stored in JSON */
/** Does not need a request body, just the request */
/** Responds with all file names currently stored */
export const list = (_req: SafeRequest, res: SafeResponse): void => {
  const nameArr: string[]= [];
  for (let key of files.keys()){
    nameArr.push(key);
  } 
  res.status(200).send({names: nameArr});
}

/** Returns a given name, file combination in the global map as a JSON object*/
/** Needs a "name" field in the query parameters in request */
/** Responds with 400 error if "name" is missing in query params, 404 error if a file with that name is not found, or with success information  */
export const load = (req: SafeRequest, res: SafeResponse): void => {
  const name = first(req.query.name);
  if (name === undefined) {
    res.status(400).send('required argument "name" was missing');
    return;
  }
  else if(files.get(name) === undefined){
    res.status(404).send('no file found with that name');
    return;
  }
  else{
    res.status(200).send({name: name, value: files.get(name)}); 
    return;
  }
}

/** Used in tests to set the transcripts map back to empty. */
export const resetFilesForTesting = (): void => {
  // Do not use this function except in tests!
  files.clear();
};


// Helper to return the (first) value of the parameter if any was given.
// (This is mildly annoying because the client can also give mutiple values,
// in which case, express puts them into an array.)
const first = (param: unknown): string|undefined => {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === 'string') {
    return param;
  } else {
    return undefined;
  }
};
