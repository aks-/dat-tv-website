var btn = document.querySelector('button')
var vid = document.querySelector('video')
var datlink = null
var offset = null
var list = []

function isDatUrl (url) {
  var isdaturl = false
  try {
    isdaturl = (new URL(url).protocol) === 'dat:'
  } catch (_) {}

  return isdaturl
}

function getLinkToVideo () {
  if (list.length > 0) {
    return new URL(`${datlink}${list[0].name}`).href
  }
}

async function playTv (url) {
  try {
    datlink = url
    var videosrc = await getVideoSrc(url)
    await setVideoParamsAndPlay(videosrc)
  } catch (e) {
    alert(e.message)
  }
}

async function getVideoSrc (url) {
  if (url[url.length - 1] === '/') {
    url = url.slice(0, -1)
  }
  var archive = new DatArchive(url)
  var files = await archive.readdir('/')

  if (!files.includes('playlist.json')) {
    throw new Error('This dat does not include playlist.json to play anything.')
  }

  var playlist = await archive.readFile('/playlist.json', 'utf-8')
  list = JSON.parse(playlist)

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

  return getLinkToVideo()
}

async function setVideoParamsAndPlay (videosrc) {
  vid.src = videosrc
  vid.currentTime = offset
  try {
    var playPromise = await vid.play()
  } catch (_) {
    setTimeout(function () {
      vid.play() 
    }, 100)
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

  playTv(datlink)
})

vid.addEventListener('ended', async function () {
  offset = 0
  list.shift()
  var videosrc = getLinkToVideo()
  await setVideoParamsAndPlay(videosrc)
})

var hash = new URL(window.location.href).hash

async function init (hash) {
  await playTv(hash)
}

if (isDatUrl(hash.slice(1))) {
  init(hash.slice(1))
}
