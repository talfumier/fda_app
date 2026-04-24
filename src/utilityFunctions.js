import { getEntityFields } from './services/httpEntities.js'
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
  if (!filename.includes('.')) return ''
  return '.' + filename.split('.').pop().toLowerCase()
}
export async function bodyCleanUp(model, body, token, signal) {
  //remove fields not belonging to the model and idModel
  const { data: res } = await getEntityFields(model, token, signal)
  if (res.statusCode !== 200) return body
  const obj = {}
  res.data.map((field) => {
    if (body[field] !== undefined) obj[field] = body[field]
  })
  return obj
}
export function getCloudinaryResizedUrl(url, width, height, crop = 'fill') {
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    // Add transformations: convert to JPG, resize, and crop
    return url.replace('/upload/', `/upload/f_jpg,c_${crop},w_${width},h_${height},g_auto,q_auto/`)
  }
  return url
}
const TTL = 1000 * 60 * 60 * 24 // 24h
const genderCache = new Map(JSON.parse(localStorage.getItem('genderCache') || '[]'))
export async function getGender(name) {
  const cached = genderCache.get(name)
  if (cached && Date.now() - cached.timestamp < TTL) {
    return cached.data
  }
  const res = await fetch(`https://api.genderize.io?name=${encodeURIComponent(name)}`)
  if (!res.ok) return { gender: null }
  const data = await res.json()
  genderCache.set(name, {
    data,
    timestamp: Date.now(),
  })
  localStorage.setItem('genderCache', JSON.stringify([...genderCache]))
  return data
}
