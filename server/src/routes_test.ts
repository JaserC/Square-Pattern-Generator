import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { load, save, list, resetFilesForTesting } from './routes';

describe('routes', function() {

  it('save', function() {

    //CORRECTLY SAVED (2 TESTS)
    const req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "square1", value: "something random"}});
    const res1 = httpMocks.createResponse();
    save(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(res1._getData(),
        'square1 was saved');

    const req2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "square2", value: "nothing new"}});
    const res2 = httpMocks.createResponse();
    save(req2, res2);
    assert.strictEqual(res2._getStatusCode(), 200);
    assert.deepStrictEqual(res2._getData(),
        'square2 was saved');

    //N0 NAME PROVIDED OR NAME IS NOT STRING (2 TESTS PER)

    const req3 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {value: "something random"}});
    const res3 = httpMocks.createResponse();
    save(req3, res3);
    assert.strictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(res3._getData(),
        'Faulty request: argument "name" was missing or incorrectly formatted');
    const req4 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {}});
    const res4 = httpMocks.createResponse();
    save(req4, res4);
    assert.strictEqual(res4._getStatusCode(), 400);
    assert.deepStrictEqual(res4._getData(),
        'Faulty request: argument "name" was missing or incorrectly formatted');

    const req5 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: 42, value: "nothing new"}});
    const res5 = httpMocks.createResponse();
    save(req5, res5);
    assert.strictEqual(res5._getStatusCode(), 400);
    assert.deepStrictEqual(res5._getData(),
        'Faulty request: argument "name" was missing or incorrectly formatted');
    const req6 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: true, value: "nothing new"}});
    const res6 = httpMocks.createResponse();
    save(req6, res6);
    assert.strictEqual(res5._getStatusCode(), 400);
    assert.deepStrictEqual(res5._getData(),
        'Faulty request: argument "name" was missing or incorrectly formatted');

    //NO VALUE PROVIDED (2 TESTS)

    const req7 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "something"}});
    const res7 = httpMocks.createResponse();
    save(req7, res7);
    assert.strictEqual(res7._getStatusCode(), 400);
    assert.deepStrictEqual(res7._getData(),
        'Faulty Request: request body is missing argument "value"');

    const req8 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "something", values: "values not value"}});
    const res8 = httpMocks.createResponse();
    save(req8, res8);
    assert.strictEqual(res8._getStatusCode(), 400);
    assert.deepStrictEqual(res8._getData(),
        'Faulty Request: request body is missing argument "value"');

    resetFilesForTesting();
  });

  it('load', function() {

    const saveReq2 = httpMocks.createRequest(
        {method: 'POST', url: '/save', body: {name: "File 1", value: "Fuck it, we ball"}});
    const saveRes2 = httpMocks.createResponse();
    save(saveReq2, saveRes2);

    const saveReq3 = httpMocks.createRequest(
        {method: 'POST', url: '/save', body: {name: "File 2", value: "Fuck, we can't ball"}});
    const saveRes3 = httpMocks.createResponse();
    save(saveReq3, saveRes3);

    //ERROR BLOCK (no name passed)
    //2 tests
    const loadReq2 = httpMocks.createRequest(
        {method: 'GET', url: '/api/load', query: {}});
    const loadRes2 = httpMocks.createResponse();
    load(loadReq2, loadRes2);
    assert.strictEqual(loadRes2._getStatusCode(), 400);
    assert.deepStrictEqual(loadRes2._getData(),
        'required argument "name" was missing');

    const loadReq3 = httpMocks.createRequest(
        {method: 'GET', url: '/api/load', query: {randoParam: "Random"}});
    const loadRes3 = httpMocks.createResponse();
    load(loadReq3, loadRes3);
    assert.strictEqual(loadRes3._getStatusCode(), 400);
    assert.deepStrictEqual(loadRes3._getData(),
        'required argument "name" was missing');

    //Error Block (no file found)
    //2 tests
    const loadReq4 = httpMocks.createRequest(
        {method: 'GET', url: '/api/load', query: {name: "Ballers"}});
    const loadRes4 = httpMocks.createResponse();
    load(loadReq4, loadRes4);
    assert.strictEqual(loadRes4._getStatusCode(), 404);
    assert.deepStrictEqual(loadRes4._getData(),
        'no file found with that name');

    const loadReq5 = httpMocks.createRequest(
        {method: 'GET', url: '/api/load', query: {name: "File"}});
    const loadRes5 = httpMocks.createResponse();
    load(loadReq5, loadRes5);
    assert.strictEqual(loadRes5._getStatusCode(), 404);
    assert.deepStrictEqual(loadRes5._getData(),
        'no file found with that name');

    //FOUND BLOCK (name passed and file found)
    //2 tests
    const loadReq6 = httpMocks.createRequest(
        {method: 'GET', url: '/api/load', query: {name: "File 1"}});
    const loadRes6 = httpMocks.createResponse();
    load(loadReq6, loadRes6);
    assert.strictEqual(loadRes6._getStatusCode(), 200);
    assert.deepStrictEqual(loadRes6._getData(), {name: "File 1", value: "Fuck it, we ball"});

    const loadReq7 = httpMocks.createRequest(
        {method: 'GET', url: '/api/load', query: {name: "File 2"}});
    const loadRes7 = httpMocks.createResponse();
    load(loadReq7, loadRes7);
    assert.strictEqual(loadRes7._getStatusCode(), 200);
    assert.deepStrictEqual(loadRes7._getData(), {name: "File 2", value: "Fuck, we can't ball"});

    // Called to clear all saved files created in this test
    //    to not effect future tests
    resetFilesForTesting();
  });

  it('list', function() {

  //EMPTY FILES MAP (single test)

  const listReq = httpMocks.createRequest(
      {method: 'GET', url: '/api/list'});
  const listRes = httpMocks.createResponse();
  list(listReq, listRes);
  assert.strictEqual(listRes._getStatusCode(), 200);
  assert.deepStrictEqual(listRes._getData(), {names: []});
  
  //1 FILE IN MAP (2 tests)

  const saveReq2 = httpMocks.createRequest(
    {method: 'POST', url: '/save', body: {name: "File 1", value: "Fuck it, we ball"}});
  const saveRes2 = httpMocks.createResponse();
  save(saveReq2, saveRes2);

  const listReq2 = httpMocks.createRequest(
    {method: 'GET', url: '/api/list'});
  const listRes2 = httpMocks.createResponse();
  list(listReq2, listRes2);
  assert.strictEqual(listRes2._getStatusCode(), 200);
  assert.deepStrictEqual(listRes2._getData(), {names: ["File 1"]});

  resetFilesForTesting();

  const saveReq3 = httpMocks.createRequest(
      {method: 'POST', url: '/save', body: {name: "File 1", value: "Fuck it, we ball"}});
  const saveRes3 = httpMocks.createResponse();
  save(saveReq3, saveRes3);
  
  const listReq3 = httpMocks.createRequest(
    {method: 'GET', url: '/api/list'});
  const listRes3 = httpMocks.createResponse();
  list(listReq3, listRes3);
  assert.strictEqual(listRes3._getStatusCode(), 200);
  assert.deepStrictEqual(listRes3._getData(), {names: ["File 1"]});

  //MULTIPLE FILES IN MAP 

  const saveReq4 = httpMocks.createRequest(
    {method: 'POST', url: '/save', body: {name: "File 2", value: "Fuck, we can't ball"}});
  const saveRes4 = httpMocks.createResponse();
  save(saveReq4, saveRes4);

  const listReq4 = httpMocks.createRequest(
    {method: 'GET', url: '/api/list'});
  const listRes4 = httpMocks.createResponse();
  list(listReq4, listRes4);
  assert.strictEqual(listRes4._getStatusCode(), 200);
  assert.deepStrictEqual(listRes4._getData(), {names: ["File 1", "File 2"]});

  const saveReq6 = httpMocks.createRequest(
    {method: 'POST', url: '/save', body: {name: "File 0", value: "W"}});
  const saveRes6 = httpMocks.createResponse();
  save(saveReq6, saveRes6);
  
  const listReq5 = httpMocks.createRequest(
    {method: 'GET', url: '/api/list'});
  const listRes5 = httpMocks.createResponse();
  list(listReq5, listRes5);
  assert.strictEqual(listRes5._getStatusCode(), 200);
  assert.deepStrictEqual(listRes5._getData(), {names: ["File 1", "File 2", "File 0"]});

  resetFilesForTesting();
  });

  // TODO: add tests for your routes
});
