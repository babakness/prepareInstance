//@ts-check
import test from 'ava'
import { prepareInstance } from '../src/index.js'

const log = console.log

const identity = a => a
const parallel = ( ...funcs ) => (...args) => funcs.map( func => func.apply(func, args))
const assoc = prop => value => obj => Object.assign({},obj,{[prop]: value})
const flip = f => a => b => f(b)(a)
const assocValueObjectFlip = prop => flip(assoc(prop))

const IdentityIM = functor => ({
  // Functor
  map:       ( x, fn )   => functors[ functor ]( fn(x) ),
  // Applicative
  ap:        ( x, fn )   => fn.map( x ),
  // Monad
  join:      ( x )       => x,
  chain:     ( x, fn )   => functors[ functor ].map( x, fn ).join( x ),

  fold:      ( x, fn )   => fn( x ), // Identity fold is like chain

  // Extra
  inspect:   ( x )       => `${ functor }`,
  valueOf:   ( x )       => x
})

const IdentitySM = functor => ({ of: ( x ) => functors[ functor ]( x )})

const IdentityMethodsWithName = parallel( IdentityIM, IdentitySM, assocValueObjectFlip('name')({}) )
const IdentityMethodsWithoutName = parallel( IdentityIM, IdentitySM )

const functors = ({
  Identity: prepareInstance( ...IdentityMethodsWithName('Identity')),
  Right: prepareInstance( ...IdentityMethodsWithName('Right') ),
  Just: prepareInstance( ...IdentityMethodsWithName('Just') ),
  IdNoOptName: prepareInstance( ...IdentityMethodsWithoutName('IdNoOptName') )
})

const { Identity, Right, Just, IdNoOptName } = functors

test('Identity called directly', t => {
  Identity(10)
  t.deepEqual(Identity(10).join(), 10)
})

test('Identity called via static method `of` is same as Identity called directly', t => {
  Identity.of(10)
  t.deepEqual(Identity(10).join(), Identity.of(10).join())
});

test('Identity is instance of Identity', t => {
  t.deepEqual( Identity instanceof Identity, true )
});

test('Identity(1) is instance of Identity',  t => {
  t.deepEqual( Identity(1) instanceof Identity, true )
});

test('Identity is instance of Identity(1)',  t => {
  t.deepEqual( Identity(1) instanceof Identity, true )
});

test('Identity.of(1) is instance of Identity',  t => {
  t.deepEqual( Identity.of(1) instanceof Identity, true )
});

test('Identity is instance of Identity.of(1)',  t => {
  t.deepEqual( Identity instanceof Identity.of(1), true )
});

test('Functor without given name is still an instance of itself', t => {
  t.deepEqual( IdNoOptName instanceof IdNoOptName, true )
  t.deepEqual( IdNoOptName.of(1) instanceof IdNoOptName, true )
  t.deepEqual( IdNoOptName instanceof IdNoOptName.of(1), true )
  t.deepEqual( IdNoOptName(1) instanceof IdNoOptName, true )
  t.deepEqual( IdNoOptName instanceof IdNoOptName(1), true )
})

test('Identity is not instance of Just, Right, or Unnamed Functor',  t => {
  t.deepEqual( Identity instanceof Right, false )
  t.deepEqual( Identity instanceof Just, false )
  t.deepEqual( Identity instanceof IdNoOptName, false )
  t.deepEqual( Identity instanceof Right.of(1), false )
  t.deepEqual( Right instanceof Identity, false )
  t.deepEqual( IdNoOptName instanceof Identity, false )
  t.deepEqual( Identity instanceof Right.of(1), false )
  t.deepEqual( Identity.of(1) instanceof Right.of(1), false )
  t.deepEqual( Identity.of(1) instanceof Right, false )
  t.deepEqual( Identity.of(1) instanceof Right, false )
});


test('Identity, Right, Just function names are "Identity","Right", and "Just"', t => {
  t.deepEqual( Identity.name, 'Identity' )
  t.deepEqual( Just.name, 'Just' )
  t.deepEqual( Right.name, 'Right' )
})

test('Identity, Right, Just functors with values have function names are "Identity","Right", and "Just"', t => {
  t.deepEqual( Identity(1).name, 'Identity' )
  t.deepEqual( Just.of(1).name, 'Just' )
  t.deepEqual( Right.of(1).map(identity).name, 'Right' )
})

test('BONUS: constructor of uninitialized Identity equals initialized Identity(1)', t => {
  t.deepEqual( Identity.constructor, Identity(1).constructor )
  t.deepEqual( Identity.constructor, Identity.of(1).constructor )
  t.deepEqual( Identity.constructor, Identity.of(1).map(identity).constructor )
})

