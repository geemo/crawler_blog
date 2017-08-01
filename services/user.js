const co = require('co')
const github = require('../lib/github')
const Api = require('../lib/api')

// 获取所有用户
function * getMembers (data, page) {
  const per_page = 100
  const { data: members } = yield github.orgs.getMembers({
    org: 'eleme',
    page: page,
    per_page
  })
  data = data.concat(members)
  if (members.length === per_page) {
    data = yield getMembers(data, ++page)
  }
  return data
}

// 更新用户列表
exports.handler = function() {
  co(function * () {
    const users = yield Api.queryRecords('user')

    const members = yield getMembers([], 1)
    let username = members.map(member => {
      return { name: member.login }
    })

    // 取差异
    username = username.filter(u => {
      for (const user of users) {
        if (u.name === user.name) {
          return false
        }
      }
      return true
    })
    
    if (username.length) {
      yield Api.createRecords('user', username)
      console.log('更新用户', username)
    }
  })
}