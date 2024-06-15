import * as assert from 'assert';
import { solid, split, toJson, fromJson, findRoot, Dir, replaceSquare } from './square';
import { cons, nil } from './list';


describe('square', function() {

  it('toJson', function() {
    assert.deepEqual(toJson(solid("white")), "white");
    assert.deepEqual(toJson(solid("green")), "green");

    const s1 = split(solid("blue"), solid("orange"), solid("purple"), solid("white"));
    assert.deepEqual(toJson(s1),
      ["blue", "orange", "purple", "white"]);

    const s2 = split(s1, solid("green"), s1, solid("red"));
    assert.deepEqual(toJson(s2),
      [["blue", "orange", "purple", "white"], "green",
       ["blue", "orange", "purple", "white"], "red"]);

    const s3 = split(solid("green"), s1, solid("yellow"), s1);
    assert.deepEqual(toJson(s3),
      ["green", ["blue", "orange", "purple", "white"],
       "yellow", ["blue", "orange", "purple", "white"]]);
  });

  it('fromJson', function() {
    assert.deepEqual(fromJson("white"), solid("white"));
    assert.deepEqual(fromJson("green"), solid("green"));

    const s1 = split(solid("blue"), solid("orange"), solid("purple"), solid("white"));
    assert.deepEqual(fromJson(["blue", "orange", "purple", "white"]), s1);

    assert.deepEqual(
        fromJson([["blue", "orange", "purple", "white"], "green",
                 ["blue", "orange", "purple", "white"], "red"]),
        split(s1, solid("green"), s1, solid("red")));

    assert.deepEqual(
        fromJson(["green", ["blue", "orange", "purple", "white"],
                  "yellow", ["blue", "orange", "purple", "white"]]),
        split(solid("green"), s1, solid("yellow"), s1));
  });

  it('findRoot', function() {
    const NW : Dir = "NW";
    const NE : Dir = "NE";
    const SW : Dir = "SW";
    const SE : Dir = "SE";
    
    const s1 = solid("white");
    const s2 = split(solid("blue"), solid("orange"), solid("purple"), solid("white"));    
    const s3 = solid("blue");
    const s4 = split(solid("red"), solid("red"), solid("blue"), solid("blue"));   
    const s5 = split(s2, s4, s2, s4);
    const s6 = split(s4, s4, s2, s4);

    const s7 = split(s5, s6, s5, s5);

    const nilPath = nil;
    const pth1 = cons(NW, nil);
    const pth2 = cons(NE, nil);
    const pth3 = cons(SW, cons(SE, nil));
    const pth4 = cons(NE, cons(SW, nil));
    const pth5 = cons(SE, cons(SE, cons(NW, nil)));
    const pth6 = cons(NE, cons(SW, cons(SE, nil)));

    //ZERO SUBDOMAIN (4 TESTS)(2 TESTS PER BASE CASE)
    assert.deepEqual(findRoot(s1, nilPath), s1);
    assert.deepEqual(findRoot(s2, nilPath), s2);

    assert.throws(() => findRoot(s1, pth1), Error);
    assert.throws(() => findRoot(s3, pth1), Error);

    //ONE SUBDOMAIN 

    //1 recursive call 
    assert.deepEqual(findRoot(s2, pth1), solid("blue"));
    assert.deepEqual(findRoot(s2, pth2), solid("orange"));
    assert.deepEqual(findRoot(s4, pth1), solid("red"));
    assert.deepEqual(findRoot(s4, pth2), solid("red"));

    //Deeper square with onlyuy 1 recursive call
    assert.deepEqual(findRoot(s5, pth1), s2);
    assert.deepEqual(findRoot(s5, pth2), s4);

    //Error base case on 1 call
    assert.throws(() => findRoot(s2, pth3), Error);
    assert.throws(() => findRoot(s4, pth3), Error);
    assert.throws(() => findRoot(s2, pth4), Error);
    assert.throws(() => findRoot(s4, pth4), Error);

    //MANY SUBDOMAIN

    //2 recursive calls (boundary case)
    assert.deepEqual(findRoot(s5, pth3), solid("white"));
    assert.deepEqual(findRoot(s5, pth4), solid("blue"));
    assert.deepEqual(findRoot(s6, pth3), solid("white"));
    assert.deepEqual(findRoot(s6, pth4), solid("blue"));

    //Error base case on 2 calls
    assert.throws(() => findRoot(s5, pth5), Error);
    assert.throws(() => findRoot(s6, pth5), Error);
    assert.throws(() => findRoot(s5, pth6), Error);
    assert.throws(() => findRoot(s6, pth6), Error);

    assert.deepEqual(findRoot(s7, pth6), solid("white")); // 3 recursive calls 

    //WHY THESE TESTS 
    /**
     * While the heuristics would demand testing all possible connections from 4 different directions to 2 different base cases, 
     * I thought it prudent to not test all recursive cases systemtically, but just mix up different directions on different squares.
     * I tested the base cases in the 0 subdomain thoroughly, and utilized 2 different suqares with 2 different paths for the 1 recursive 
     * call subdomain. I also added 2 additional tests that work with a deeper square (+1 height) but same path length to return a 
     * split rather than a solid. For the many subdomain, I worked wtih different squares and utilized different paths to test a variety of
     * recursive cases. I also tested the Error base case with different paths. There was 1 last test for 3 recursive calls to test beyond the boundary case. 
     */
  });

  it('replaceSquare', function() {

    const NW : Dir = "NW";
    const NE : Dir = "NE";
    const SW : Dir = "SW";
    const SE : Dir = "SE";
    
    const replacementSquare = solid("green")

    const s1 = solid("white");
    const s2 = split(solid("blue"), solid("orange"), solid("purple"), solid("white"));    
    const s3 = solid("blue");
    const s4 = split(solid("red"), solid("red"), solid("blue"), solid("blue"));   
    const s5 = split(s2, s4, s2, s4);
    const s6 = split(s4, s4, s2, s4);

    const s7 = split(s5, s6, s5, s5);

    const nilPath = nil;
    const pth1 = cons(NW, nil);
    const pth2 = cons(NE, nil);
    const pth3 = cons(SW, cons(SE, nil));
    const pth4 = cons(NE, cons(SW, nil));
    const pth5 = cons(SE, cons(SE, cons(NW, nil)));
    const pth6 = cons(NE, cons(SW, cons(SE, nil)));

    //ZERO SUBDOMAIN (2 tests per base case subdomain)
    assert.deepEqual(replaceSquare(s1, nilPath, s3), s3);
    assert.deepEqual(replaceSquare(s3, nilPath, s1), s1);

    assert.throws(() => replaceSquare(s1, pth1, replacementSquare), Error);
    assert.throws(() => replaceSquare(s3, pth1, replacementSquare), Error);
    assert.throws(() => replaceSquare(s1, pth2, replacementSquare), Error);
    assert.throws(() => replaceSquare(s3, pth2, replacementSquare), Error);

    //ONE SUBDOMAIN (1 recursive call)
    assert.deepEqual(replaceSquare(s2, pth1, s1), split(solid("white"), solid("orange"), solid("purple"), solid("white"))); 
    assert.deepEqual(replaceSquare(s2, pth2, s1), split(solid("blue"), solid("white"), solid("purple"), solid("white")));
    assert.deepEqual(replaceSquare(s2, pth1, s3), s2);
    assert.deepEqual(replaceSquare(s2, pth2, s3), split(solid("blue"), solid("blue"), solid("purple"), solid("white")));

    assert.deepEqual(replaceSquare(s4, pth1, s1), split(solid("white"), solid("red"), solid("blue"), solid("blue")));
    assert.deepEqual(replaceSquare(s4, pth2, s1), split(solid("red"), solid("white"), solid("blue"), solid("blue")));
    assert.deepEqual(replaceSquare(s4, pth1, s3), split(solid("blue"), solid("red"), solid("blue"), solid("blue")));
    assert.deepEqual(replaceSquare(s4, pth2, s3), split(solid("red"), solid("blue"), solid("blue"), solid("blue")));

    assert.deepEqual(replaceSquare(s5, pth1, replacementSquare), split(replacementSquare, s4, s2, s4)); //Deeper square with path length 1
    assert.deepEqual(replaceSquare(s5, pth2, replacementSquare), split(s2, replacementSquare, s2, s4)); //Deeper square with path length 1

    assert.throws(() => replaceSquare(s2, pth3, replacementSquare), Error); //Error Case
    assert.throws(() => replaceSquare(s2, pth4, replacementSquare), Error); //Error Case
    assert.throws(() => replaceSquare(s4, pth3, replacementSquare), Error); //Error Case
    assert.throws(() => replaceSquare(s4, pth4, replacementSquare), Error); //Error Case

    //MANY SUBDOMAIN

    assert.deepEqual(replaceSquare(s5, pth3, s1), split(s2, s4, split(solid("blue"), solid("orange"), solid("purple"), solid("white")), s4)); 
    assert.deepEqual(replaceSquare(s5, pth3, s3), split(s2, s4, split(solid("blue"), solid("orange"), solid("purple"), solid("blue")), s4)); 
    assert.deepEqual(replaceSquare(s5, pth4, s1), split(s2, split(solid("red"), solid("red"), solid("white"), solid("blue")), s2, s4));
    assert.deepEqual(replaceSquare(s5, pth4, s3), split(s2, split(solid("red"), solid("red"), solid("blue"), solid("blue")), s2, s4));

    assert.deepEqual(replaceSquare(s6, pth3, s1), split(s4, s4, split(solid("blue"), solid("orange"), solid("purple"), solid("white")), s4));
    assert.deepEqual(replaceSquare(s6, pth3, s3), split(s4, s4, split(solid("blue"), solid("orange"), solid("purple"), solid("blue")), s4));
    assert.deepEqual(replaceSquare(s6, pth4, s1), split(s4, split(solid("red"), solid("red"), solid("white"), solid("blue")), s2, s4));
    assert.deepEqual(replaceSquare(s6, pth4, s3), split(s4, split(solid("red"), solid("red"), solid("blue"), solid("blue")), s2, s4));

    assert.deepEqual(replaceSquare(s7, pth5, s1), split(s5, s6, s5, split(s2, s4, s2, split(solid("white"), solid("red"), solid("blue"), solid("blue"))))); //3 recursive calls
    assert.deepEqual(replaceSquare(s7, pth6, s3), split(s5, split(s4, s4, split(solid("blue"), solid("orange"), solid("purple"), solid("blue")), s4), s5, s5)); //3 recursive calls

    assert.throws(() => replaceSquare(s5, pth5, replacementSquare), Error); //Error Case
    assert.throws(() => replaceSquare(s5, pth6, replacementSquare), Error); //Error Case
    assert.throws(() => replaceSquare(s6, pth5, replacementSquare), Error); //Error Case
    assert.throws(() => replaceSquare(s6, pth6, replacementSquare), Error); //Error Case

    //WHY THESE TESTS 
    /**
     * While the heuristics would demand testing all possible connections from 4 different directions to 2 different base cases, 
     * I thought it prudent to not test all recursive cases systemtically, but just mix up different directions on different squares.
     * I tested the base cases in the 0 subdomain thoroughly, and utilized 2 different suqares with 2 different paths for the 1 recursive 
     * call subdomain. I also added 2 additional tests that work with a deeper square (+1 height) but same path length to replace a 
     * split with a solid. For the many subdomain, I worked wtih different squares and utilized different paths to test a variety of
     * recursive cases. I also tested the Error base case with different paths. There was 1 last test for 3 recursive calls to test beyond the boundary case. 
     */

  });

});
