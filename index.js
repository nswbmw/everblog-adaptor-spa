'use strict';

const fs = require('fs')
const path = require('path')
const moment = require('moment')
const entities = require('entities')
const enml2html = require('enml2html')
const Handlebars = require('handlebars')
const debug = require('debug')('everblog-adaptor-spa')

module.exports = function* (data) {
  data.posts.forEach(post => {
    const content = post.content
    debug('content -> %j', content)

    const contentHtml = enml2html(entities.decodeHTML(content), post.resources, data.$webApiUrlPrefix, post.noteKey)
    debug('content html -> %j', contentHtml)

    post.content = contentHtml
  })
  data.posts.sort((prev, next) => {
    return next.created - prev.created
  })

  const srcDir = path.dirname(module.parent.filename)
  const srcPath = path.join(srcDir, '/public/index.hbs')
  const distPath = path.join(srcDir, '/index.html')
  const template = Handlebars.compile(fs.readFileSync(srcPath, { encoding: 'utf8' }))

  debug('src -> %s', srcPath)
  fs.writeFileSync(distPath, template(data))
  debug('dist -> %s', distPath)
  debug('build success!')

  return distPath
}

Handlebars.registerHelper('date', timestamp => {
  const date = moment(+timestamp).format('YYYY-MM-DD HH:mm')
  return new Handlebars.SafeString(date);
});