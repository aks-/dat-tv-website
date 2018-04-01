var btn = document.querySelector('button')
var vid = document.querySelector('video')
var datlink = null

function isDatUrl (url) {
  var isdaturl = false
  try {
    isdaturl = (new URL(url).protocol) === 'dat:'
  } catch (_) {}

  return isdaturl
}

btn.addEventListener('click', function () {
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

  vid.src = datlink
})

