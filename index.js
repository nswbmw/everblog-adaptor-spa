const fs = require('fs')
const path = require('path')

const marked = require('marked')
const moment = require('moment')
const entities = require('entities')
const enml2html = require('enml2html')
const enml2text = require('enml2text')
const Handlebars = require('handlebars')
const debug = require('debug')('everblog-adaptor-spa')

module.exports = async function everblogAdaptorSpa (data, cleanMode = false) {
  data.notes.sort((prev, next) => {
    return next.created - prev.created
  })
  data.notes.forEach(note => {
    debug(`title: ${note.title}, content(enml): ${note.content}`)

    let contentHtml
    if (note.title.match(/\.md$/)) {
      note.title = note.title.slice(0, -3)
      const contentMarkdown = entities.decodeHTML(enml2text(note.content)).replace(/\n/g, '  \n')
      debug(`title: ${note.title}, content(markdown): ${JSON.stringify(contentMarkdown)}`)
      contentHtml = marked(contentMarkdown)
    } else {
      note.content = entities.decodeHTML(note.content)
      contentHtml = enml2html(note, cleanMode)
    }
    note.content = contentHtml
    debug(`title: ${note.title}, content(html): ${JSON.stringify(contentHtml)}`)
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
  return new Handlebars.SafeString(date)
})
