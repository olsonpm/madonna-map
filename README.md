# Madonna Map
Creates a function that validates its arguments via
[madonna-fp](https://github.com/olsonpm/madonna-fp) before mapping them to
something else.  I created this to validate raw json then map it through a
class or constructor.  Note `madonna-map` only allows you to map top-level
properties.  Allowing otherwise would create for unnecessarily complex code.

## Example
```js
const validatedName = argsObj => console.dir(argsObj)

// creates a function taking the argument 'name' and maps its value to uppercase
let mapperFn = madonnaMap.createMapper({
  marg: { name: ['require', 'isLadenString'] }
  , argMap: { name: fp.toUpper }
});

mapperFn({ name: 'phil' })
// returns
// { name: 'PHIL' }


mapperFn({ name: {} });
// throws an error
// Invalid Input: The following arguments didn't pass their criterion
// invalid arguments and values: {
//   "name": {}
// }
// failed criterion per argument: {
//   "name": {
//     "flags": [
//       "isLadenString"
//     ]
//   }
// }


// don't mismatch the argMap property names with those declared in marg
mapperFn = madonnaMap.createMapper({
  marg: { name: ['require', 'isLadenString'] }
  , argMap: { notName: fp.toUpper }
});
// throws an error
// Invalid Input: argMap can only contain keys present in schema.
// invalid keys: notName
// keys allowed: name


// a slightly larger example
mapperFn = madonnaMap.createMapper({
  marg: {
    name: ['require', 'isLadenString']
    , age: { betweenI: [0, 120] }
  }
  , argMap: { name: fp.toUpper }
});

mapperFn({
  name: 'phil'
  , age: 28
});
// returns
// { name: 'PHIL', age: 28 }
```

## API
`require('madonna-map').createMapper`
 - Takes the following arguments
   - **marg**: `require` `isLadenPlainObject`
     - marg stands for 'madonna-fp argument'.  It is passed to madonna-fp which
       is used to validate the arguments in calls to the returned function.
   - **argMap**: `require` `isLadenPlainObject`
     - This object can only contain keys found in **marg** and their values
       must be functions.  Valid input will pass through these functions
       and returned.  Not all properties in **marg** have to be mapped.
 - Returns a function that validates its input against **marg**.  Any properties
   in **argMap** will pass through their mappers.  All validated arguments will
   be returned.
