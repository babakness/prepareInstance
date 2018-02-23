// const curry = (fn, ...args) => (
//   args.length === fn.length 
//     ? fn(...args) 
//     : curry.bind(null, fn, ...args)
// )
const prop = ( key, obj ) => obj ? obj[ key ] : undefined
// const propIs = curry((key, checkValue, obj) => prop(key,obj) === checkValue)
const propIs = ( key, checkValue ) => obj => prop( key, obj ) === checkValue

export const prepareInstance = (instanceMethods = {}, staticMethods = {}, options = {} ) => {
  const functionName = prop( 'name', options ) || `anonymous${ Math.random() }`
  const functionNamePredicate = propIs( 'name' , functionName ) 

  const classes = {
    [functionName]: class  {
      constructor ( ...constructorArgs )
      {
        this.__values = constructorArgs
      }
    }
  };
  
  for (const [ name, f ] of Object.entries( instanceMethods ) ) {
    classes[functionName].prototype[ name ] = function( ...methodArgs ) {
      return f( ...this.__values, ...methodArgs )
    }
  }

  const instanceIterator = ( ...constructorArgs ) => {
    const newInstance = new classes[functionName] ( ...constructorArgs )
    Object.defineProperty(
      newInstance, 
      'name', 
      { value: functionName }
    );
    if( Symbol && Symbol.hasInstance && functionName ) {
      Object.defineProperty(
        newInstance, 
        Symbol.hasInstance, 
        { value: functionNamePredicate }
      );
    }
    return newInstance
  }
    
  for (const [ name, f ] of Object.entries( staticMethods ) ) {
    instanceIterator[ name ] = f
  }

  Object.defineProperty(
    instanceIterator, 
    'name', 
    { value: functionName }
  );


  Object.defineProperty(
    instanceIterator, 
    'constructor', 
    { value: classes[functionName].prototype.constructor }
  );

  if( Symbol && Symbol.hasInstance && functionName ) {
    Object.defineProperty(
      instanceIterator, 
      Symbol.hasInstance, 
      { value: functionNamePredicate }
    );
  }

  return instanceIterator
}