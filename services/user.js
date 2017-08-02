'use strict'

const co = require('co')
const github = require('../lib/github')
const Api = require('../lib/api')

// 获取所有用户
function * getMembers (data, page) {
  const per_page = 100
  console.log(2.1)
  let members = yield github.orgs.getMembers({
    org: 'eleme',
    page: page,
    per_page
  })
  console.log(2.2)
  members = members.data
  data = data.concat(members)
  if (members.length === per_page) {
    console.log(2.3)
    data = yield getMembers(data, ++page)
  }
  console.log(2.4)
  return data
}

// 更新用户列表
exports.handler = function(event, context, callback) {
  co(function * () {
    console.log(1)
    const users = yield Api.queryRecords('user')
    console.log(2)
    const members = yield getMembers([], 1)
    let username = members.map(member => {
      return { name: member.login }
    })
    console.log(3)
    // 取差异
    username = username.filter(u => {
      for (const user of users) {
        if (u.name === user.name) {
          return false
        }
      }
      return true
    })
    console.log(4)
    if (username.length) {
      yield Api.createRecords('user', username)
      console.log('更新用户', username)
    }

    callback(null, '更新成功')
  })
}
