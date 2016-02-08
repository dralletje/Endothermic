import graphql from 'graphql-parser'

let newgraphql = (parts, ...args) => {
  /*
    Some patches to the parser, to allow trailing comma's
    and make variables use $xxx instead of <xxx>
    TODO: Fix this in the actual parser
  */
  let newparts = parts.map(part =>
    part
      .replace(/\$([_A-Za-z][_0-9A-Za-z]+)/g, '<$1>')
      .replace(/(,\s*)+,/g, ',')
      .replace(/,(\s*)}/g, '$1}')
      .replace(/{(\s*),/g, '{$1')
  )

  // Disallow empty blocks (as per spec)
  let hasEmptyBlock = newparts.some(part => /{\s*}/.test(part))
  if (hasEmptyBlock) {
    throw new Error('Empty blocks not allowed in graphQL')
  }

  // Pass it to the actual parser
  return graphql(newparts, ...args)
}

export default newgraphql
