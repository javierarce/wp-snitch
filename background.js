const WORDPRESS_REGEXP = /https?:\/\/((.*?)\.wordpress\.(com|org)|wordpress\.(com|org))/

const REJECT_LIST = [
  'amazon.com',
  'apple.com',
  'facebook.com',
  'figma.com',
  'google.com',
  'icloud.com',
  'instagram.com',
  'reddit.com',
  'slack.com',
  'tiktok.com',
  'twitter.com',
  'wikipedia.com',
  'yandex.ru',
  'youtube.com'
]

const ICON = {
  checking: 'icons/checking.png',
  haswp: 'icons/haswp.png',
  default: 'icons/icon.png'
}

const setIcon = (path) => {
  chrome.action.setIcon({ path })
}

const onGetHTML = (html) => {
  let path = ICON['default']

  if (html.includes('wp-content') || html.includes('wp-json')) {
    path = ICON['haswp']
  }

  setIcon(path)
}

const isValidURL = (URL) => {
  return URL && URL.startsWith('http')
}

const isAllowed = (URL) => {
  return URL.match(WORDPRESS_REGEXP)
}

const isRejected = (URL) => {
  return REJECT_LIST.some((u) => {
    return URL.match(new RegExp(`^https?:\/\/.*?${u}`))
  })
}

const listener = (data) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

    setIcon(ICON['checking'])

    if (tabs && tabs[0] && isValidURL(tabs[0].url)) {
      let URL = tabs[0].url

      if (isAllowed(URL)) {
        setIcon(ICON['haswp'])
      } else if (isRejected(URL)) {
        setIcon(ICON['default'])
      } else {
        setIcon(ICON['checking'])

        fetch(URL)
          .then((response) => response.text())
          .then(onGetHTML)
      }
    }
  })
}

chrome.webNavigation.onCompleted.addListener(listener)
chrome.tabs.onActivated.addListener(listener)
