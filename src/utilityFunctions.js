import axios from 'axios'
export function zipToObject(keys, values, dflt = null) {
  //construct an object based on keys and values
  return keys.reduce((obj, key, i) => {
    obj[key] = values[i] ? values[i] : dflt
    return obj
  }, {})
}
export function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min)
  const maxFloored = Math.floor(max)
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
}
export function range(start, end) {
  return Array(end - start + 1)
    .fill()
    .map((_, idx) => start + idx)
}
export function getEmptyFile() {
  return {
    fileName: '',
    fileSize: 0,
    fileLastModified: 0,
    url: null,
    // data: null,
  }
}
export function fileSize(size) {
  if (size < 1024) {
    return `${size} bytes`
  } else if (size >= 1024 && size < 1048576) {
    return `${(size / 1024).toFixed(1)} KB`
  } else if (size >= 1048576) {
    return `${(size / 1048576).toFixed(1)} MB`
  }
}
export function truncate(text, max) {
  return text?.length > max ? text.slice(0, max).trimEnd() + ' ...' : text
}
//ABORT CONTROLLERS
export function newController(inFlight) {
  const ctrl = new AbortController()
  inFlight.add(ctrl)
  return ctrl
}
export function doneController(ctrl, inFlight) {
  inFlight.delete(ctrl)
}
export function cancelAllInFlight(inFlight) {
  inFlight.forEach((ctrl) => {
    ctrl.abort()
  })
  inFlight.clear()
}
export function getFileExtension(filename) {
  return '.' + filename.split('.').pop().toLowerCase()
}
