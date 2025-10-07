export function confirm($q, message, cancel = true, focus = 'cancel', title = '') {
  return new Promise((resolve) => {
    $q.dialog({
      title,
      message,
      cancel,
      persistent: true,
      // dark: true,
      focus, //[ok, cancel]
      html: true,
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false))
      .onDismiss(() => resolve(false))
  })
}
