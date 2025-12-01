import { parseISO, format, isDate } from 'date-fns'
import _, { isBoolean } from 'lodash'
import Joi from 'joi'
import { joiPasswordExtendCore } from 'joi-password'

export function validate(value, format, equal) {
  if ((!value || value.length === 0) && !isBoolean(value))
    //boolean value from checkbox input
    return {
      valid: false,
      msg: 'comps.validation.fields.not_null',
    }
  let result = { valid: true, msg: null }
  switch (format) {
    case 'text':
    case 'password-not-null':
      break
    case 'email':
      if (!isValidEmail(value))
        result = {
          valid: false,
          msg: 'comps.validation.fields.email',
        }
      break
    case 'pwd':
      if (!isValidPwd(value))
        result = {
          valid: false,
          msg: 'comps.validation.fields.pwd',
        }
      break
    case 'pwd_check':
      if (equal && value !== equal)
        result = {
          valid: false,
          msg: 'comps.validation.fields.pwd_match',
        }
      break
    case 'checked':
      if (!value || value == 0)
        result = {
          valid: false,
          msg: null, //'comps.validation.fields.checked',
        }
      break
    case 'unchecked':
      if (value && value === 1)
        result = {
          valid: false,
          msg: 'comps.validation.fields.checked',
        }
      break
    case 'integer':
      if (!isValidInteger(value))
        result = {
          valid: false,
          msg: 'comps.validation.fields.int',
        }
      break
    case 'date':
      if (!value)
        result = {
          valid: false,
          msg: 'comps.validation.fields.date',
        }
      break
    case 'date-time':
      if (!value)
        result = {
          valid: false,
          msg: 'comps.validation.fields.date-time',
        }
      break
  }
  return result
}
export function isValidEmail(email) {
  const schema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }),
  })
  return !schema.validate({ email }).error
}
export function isValidPwd(pwd) {
  const joiPassword = Joi.extend(joiPasswordExtendCore)
  const schema = Joi.object({
    pwd: joiPassword
      .string()
      .min(8)
      .max(60)
      .minOfSpecialCharacters(1)
      .minOfUppercase(1)
      .minOfNumeric(1)
      .noWhiteSpaces(),
  })
  return !schema.validate({ pwd }).error
}
export function isValidInteger(str) {
  if (str.toString().includes('.') || str.toString().includes(',')) return false
  return !isNaN(str)
}
export function strToDate(str) {
  let arr = str.split(' ')
  arr = [...arr[0].split('.'), ...(arr[1] ? arr[1].split(':') : [])]
  let result = `${arr[2]}/${arr[1]}/${arr[0]}`
  if (arr[3]) result = result + ` ${arr[3]}:${arr[4]}`
  return new Date(result)
}
export function isValidDate(str) {
  const arr = str.split('-')
  if (arr.length !== 3) return false
  if (arr[0].length !== 4 || arr[1].length !== 2 || arr[2].length !== 2) return false
  return !isNaN(new Date(`${arr[0]}/${arr[1]}/${arr[2]}`))
}
function isValidTime(str) {
  const arr = str.split(/[:.]/)
  if (arr.length !== 4) return false
  if (arr[0].length !== 2 || arr[1].length !== 2) return false
  return true
}
export function isValidDateTime(str) {
  let arr = str.split(/[T/]/)
  if (arr.length !== 2) return false
  if (!isValidDate(arr[0])) return false
  if (!isValidTime(arr[1])) return false
  arr = [...arr[0].split('-'), ...arr[1].split(':')]
  return !isNaN(new Date(`${arr[0]}/${arr[1]}/${arr[2]} ${arr[3]}:${arr[4]}`))
}
