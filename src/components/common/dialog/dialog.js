export function confirm($q, message, focus = 'cancel', title = '') {
  return new Promise((resolve) => {
    $q.dialog({
      title,
      message,
      cancel: true,
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
