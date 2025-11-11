import _ from 'lodash'
import { postEntity, deleteEntity, patchEntity } from '@/services/httpEntities.js'
import { newController, doneController, bodyCleanUp } from '@/utilityFunctions.js'
export function isEqual(arr1, arr2) {
  const arr = arr1.map((row) => {
    const { selected, ...obj } = row
    return obj
  })
  return _.isEqual(arr, arr2)
}
export async function handleSaveMaster(state, initialValues, entity, token, inFlight) {
  const ctrl = newController(inFlight)
  try {
    //processing record(s) deletion  >>> record(s) in initialValues with no match in state
    await Promise.all(
      _.cloneDeep(initialValues).map(async (row, i) => {
        const idx = state.findIndex((item) => {
          return item.ID === row.ID
        })
        if (idx === -1) {
          const { data: res } = await deleteEntity(entity, parseInt(row.ID), token, ctrl.signal)
          if (res.statusCode !== 200) return
          initialValues = _.filter(initialValues, (iv) => {
            return iv.ID !== row.ID
          })
        }
      }),
    )
    //processing record(s) addition
    await Promise.all(
      _.cloneDeep(state).map(async (row, idx) => {
        const { ID, ...body } = row
        const cleaned = await bodyCleanUp(entity, body, token, ctrl.signal)
        const { data: res } = !ID //state record(s) not saved in database when ID is null >>> null ID set in ExpoMaster.vue handleClick()
          ? await postEntity(entity, cleaned, token, ctrl.signal)
          : await patchEntity(entity, ID, cleaned, token, ctrl.signal) //patch only with ExpoDoc model
        if (res.statusCode !== 200) return
        if (!ID) {
          const newID = res.data[`id${entity}`]
          state[idx].ID = newID
          initialValues.push({ ...body, ID: parseInt(newID) })
        } else initialValues[idx].idType = body.idType //ExpoDoc patch case
      }),
    )
    return initialValues
  } catch (error) {
    console.log(error)
  } finally {
    doneController(ctrl, inFlight)
  }
}
export async function handleSaveAward(
  state,
  initialValues,
  idExpo,
  relatedFields,
  entity,
  token,
  inFlight,
) {
  const post = [],
    del = [],
    edit = []
  state.forEach((row, idx) => {
    if (isEqual([state[idx]], [initialValues[idx]])) return
    const obj = { idExpo }
    relatedFields.forEach((field) => {
      obj[field] = row[field]
    })
    if (!row.ID) {
      //record has no ID >>> does not exist in database
      if ((obj.idUser && obj.applicable === 1) || (!obj.idUser && obj.applicable === 1))
        post.push(obj)
    } else {
      //existing record in database
      if (!obj.idUser && obj.applicable === 0) del.push(row.ID) //delete if equal to initial state (database SQL query)
      if ((!obj.idUser && obj.applicable === 1) || (obj.idUser && obj.applicable === 1))
        edit.push([row.ID, { idUser: obj.idUser, applicable: obj.applicable }]) //update if not applicable or in case of idUser change
    }
  })
  const ctrl = newController(inFlight)
  try {
    await Promise.all(
      del.map(async (id) => {
        if (!id) return
        const { data: res } = await deleteEntity(entity, parseInt(id), token, ctrl.signal)
        if (res.statusCode !== 200) return
        const idx = state.findIndex((item) => {
          return item.ID === id
        })
        if (idx !== -1) {
          const obj = { ID: null, idUser: null, applicable: 0 }
          state[idx] = { ...state[idx], ...obj }
          initialValues[idx] = { ...initialValues[idx], ...obj }
        }
      }),
    )
    await Promise.all(
      post.map(async (body) => {
        const { data: res } = await postEntity(entity, body, token, ctrl.signal)
        if (res.statusCode !== 200) return
        const idx = state.findIndex((item) => {
          let cond = true
          relatedFields.forEach((field) => {
            cond = cond && item[field] === body[field]
          })
          return cond
        })
        if (idx !== -1) {
          const newID = res.data[`id${entity}`]
          const obj = { ID: newID, prize_fr: state[idx].prize_fr, prize_en: state[idx].prize_en }
          state[idx] = { ...body, ...obj, selected: state[idx].selected } //update state with newly created record
          initialValues[idx] = { ...body, ID: newID } //update initial values
        }
      }),
    )
    await Promise.all(
      edit.map(async (arr) => {
        if (!arr[0]) return
        const { data: res } = await patchEntity(
          entity,
          parseInt(arr[0]),
          arr[1],
          token,
          ctrl.signal,
        )
        if (res.statusCode !== 200) return
        const idx = state.findIndex((item) => {
          return item.ID === arr[0]
        })
        if (idx !== -1) {
          state[idx] = { ...state[idx], ...arr[1] }
          initialValues[idx] = { ...initialValues[idx], ...arr[1] }
        }
      }),
    )
  } catch (error) {
  } finally {
    doneController(ctrl, inFlight)
  }
}
