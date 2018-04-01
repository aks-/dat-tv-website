var btn = document.querySelector('button')
var vid = document.querySelector('video')
var datlink = null
var offset = null

function isDatUrl (url) {
  var isdaturl = false
  try {
    isdaturl = (new URL(url).protocol) === 'dat:'
  } catch (_) {}

  return isdaturl
}

async function getVideoSrc (url) {
  window._url = url
  if (url[url.length - 1] === '/') {
    url = url.slice(0, -1)
  }
  var archive = new DatArchive(url)
  var files = await archive.readdir('/')

  if (!files.includes('playlist.json')) {
    throw new Error('This dat does not include playlist.json to play anything.')
  }

  var playlist = await archive.readFile('/playlist.json', 'utf-8')
  var list = JSON.parse(playlist)

  var total = list.map(function (item) {
    return item.duration
  }).reduce(function (a, b) {
    return a + b
  })

  offset = Math.round(Date.now() / 1000) % Math.round(total)

  while (offset > list[0].duration) {
    var first = list.shift()
    offset -= first.duration
    list.push(first)
  }

  if (list.length > 0) { 
    return new URL(`${url}${list[0].name}`).href
  }
}

btn.addEventListener('click', async function () {
  var datLinkInputBox = document.querySelector('.dat-link-input')
  var datLinkInputValue = datLinkInputBox.value

  if (!isDatUrl(datLinkInputValue)) {
    alert('Please try again with correct dat url.')
    return
  }

  if (datlink == datLinkInputValue) {
    return
  }

  datlink = datLinkInputValue

  try {
    var videosrc = await getVideoSrc(datlink)
    vid.src = videosrc
    vid.currentTime = offset
    vid.play()
  } catch (e) {
    alert(e.message)
  }
})
