import chai, {expect} from 'chai'
import spies from 'chai-spies'

import firebase from 'exothermic'

import {graphql, driver, firebaseAdapter} from '../source'
chai.use(spies)

let lastCall = spy => {
  let calls = spy.__spy.calls
  if (calls.length === 0) {
    throw new Error('Expected spy to be called at least once')
  }
  return calls[calls.length - 1][0]
}

describe('Endothermic', () => {
  let createRootRef = () => {
    return firebase({
      users: {
        a: {
          name: 'Michiel Dral',
          friends: {
            b: 'okay',
            c: 'good',
          },
        },
        b: {
          name: 'Jake',
          friends: {
            a: 'okay',
          },
        },
        c: {
          name: 'Joy',
          friends: {
            a: 'good',
          },
        },
      },
    }, {delay: -1})
  }

  let spyOnQuery = (query, params) => {
    let rootref = createRootRef()

    let spy = chai.spy()
    let db = driver(adapter(rootref))
    db(query(params)).subscribe(spy)

    return {spy, rootref}
  }


  let adapter = (rootref) => {
    let {byKey, sameKey} = firebaseAdapter(rootref)
    return {
      emptyList: byKey('empty').list(),
      users: byKey('users').listOf('user'),
      user: byKey('users').object({
        friends: byKey('friends').listOf('user'),
        friendships: byKey('friends').list({
          friend: sameKey.as('user'),
        }),
      }),
    }
  }

  it('should find a simple object', () => {
    let {spy} = spyOnQuery(graphql`{ user(id: "a") { id, name } }`)

    expect(spy).to.have.been.called.with({
      user: {
        id: 'a',
        name: 'Michiel Dral',
      },
    })
  })


  it('should find a part of simple object', () => {
    let {spy} = spyOnQuery(graphql`{ user(id: "a") { name } }`)

    expect(spy).to.have.been.called.with({
      user: { name: 'Michiel Dral' },
    })
  })


  it('should find list of simple objects', () => {
    let {spy} = spyOnQuery(graphql`{ users() { id } }`)

    expect(spy).to.have.been.called.with({
      users: [
        {id: 'a'},
        {id: 'b'},
        {id: 'c'},
      ],
    })
  })


  it('should return an null-list as empty array', () => {
    let {spy} = spyOnQuery(graphql`{ emptyList() { id } }`)

    expect(spy).to.have.been.called.with({
      emptyList: [],
    })
  })


  it('should find a simple with variable', () => {
    let {spy} = spyOnQuery(graphql`{ user(id: $id) { id, name } }`, {id: 'a'})

    expect(spy).to.have.been.called.with({
      user: {
        id: 'a',
        name: 'Michiel Dral',
      },
    })
  })

  it('should find a object with a list relation', () => {
    let {spy} = spyOnQuery(graphql`
      {
        user(id: $id) {
          id,
          name,
          friends() {
            id,
            name,
          },
        }
      }
    `, {id: 'a'})

    expect(spy).to.have.been.called.with({
      user: {
        friends: [{
            id: 'b',
            name: 'Jake',
          }, {
            id: 'c',
            name: 'Joy',
          },
        ],
        id: 'a',
        name: 'Michiel Dral',
      },
    })
  })

  it('should support relations in lists', () => {
    let {spy} = spyOnQuery(graphql`
      {
        users() {
          id,
          name,
          friends() {
            id,
            name,
          },
        }
      }
    `)

    expect(spy).to.have.been.called.with({
      users: [{
        id: 'a',
        name: 'Michiel Dral',
        friends: [
          { id: 'b', name: 'Jake' },
          { id: 'c', name: 'Joy' },
        ],
      }, {
        id: 'b',
        name: 'Jake',
        friends: [{ id: 'a', name: 'Michiel Dral' }],
      }, {
        id: 'c',
        name: 'Joy',
        friends: [{ id: 'a', name: 'Michiel Dral' }],
      }],
    })
  })


  it('should stay in sync with a simple object', () => {
    let {spy, rootref} = spyOnQuery(graphql`{ user(id: "a") { id, name } }`)

    expect(spy).to.have.been.called.with({
      user: {
        id: 'a',
        name: 'Michiel Dral',
      },
    })
    rootref.child('users/a/name').set('Mark Zuckerberg')
    expect(spy).to.have.been.called.with({
      user: {
        id: 'a',
        name: 'Mark Zuckerberg',
      },
    })
  })


  it('should get a list inside an object', () => {
    let {spy} = spyOnQuery(graphql`{
      user(id: "a") { friendships() { value } }
    }`)

    expect(lastCall(spy)).to.eql({
      user: {
        friendships: [{
          value: 'okay',
        }, {
          value: 'good',
        }],
      },
    })
  })


  it('should get a relation inside a list inside an object', () => {
    let {spy} = spyOnQuery(graphql`{
      user(id: "a") {
        friendships() {
          friend() { id }
        }
      }
    }`)

    expect(lastCall(spy)).to.eql({
      user: {
        friendships: [{
          friend: { id: 'b' },
        }, {
          friend: { id: 'c' },
        }],
      },
    })
  })


})
