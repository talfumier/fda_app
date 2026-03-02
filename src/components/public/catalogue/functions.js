export function getText(cs = 1, bo, item, locale) {
  switch (cs) {
    case 1:
      if (bo[`${item}_${locale}`]) return bo[`${item}_${locale}`]
      else if (bo[`${item}_fr`]) return bo[`${item}_fr`]
      return ''
    case 2:
      if (bo[`${locale}`]) return bo[`${locale}`][0]
      else if (bo.fr) return bo.fr[0]
      return ''
  }
}
export function getDim(bo, locale) {
  let dim = ''
  if (bo.width) dim = (locale === 'en' ? 'L: ' : 'W: ') + bo.width.toString() + ' cm'
  if (bo.height) dim = dim + ' | H: ' + bo.height.toString() + ' cm'
  if (bo.depth) dim = dim + (locale === 'en' ? ' | P: ' : ' | D: ') + bo.depth.toString() + ' cm'
  if (bo.weight)
    dim = dim + ', ' + (locale === 'en' ? ' Wt: ' : ' Pds: ') + bo.weight.toString() + ' Kg'
  return dim
}
export function getPrice(bo, t) {
  if (bo.reserved) return t('comps.public_site.catalogue.reserved')
  if (bo.price) return t('comps.public_site.catalogue.price') + ': ' + bo.price + ' €'
  return ''
}
export function toSentenceCase(cs, str) {
  //preserves existing capitals
  if (!str) return ''
  if (!isUpperCase(str)) return str
  switch (cs) {
    case 1: //existing capitals not preserved
      return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase())
    case 2: //existing capitals preserved
      return str.replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase())
  }
}
export function isUpperCase(str) {
  return str === str.toUpperCase() && /[A-Z]/.test(str)
}
export function adjustImage(w, h, url) {
  const params = `upload/w_${w},h_${h},q_auto,c_fit` //,f_auto
  return url.replace('upload', params)
}
export function getSocialBrand(url) {
  const result = []
  if (url.includes('insta')) result.push('insta')
  if (url.includes('facebook')) result.push('fb')
  if (url.includes('x.com') || url.includes('twitter')) result.push('x')
  return result
}
export function getCoverPage(data, idType) {
  return data.filter((item) => {
    return item.idType === idType
  })[0].url
}
export function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
