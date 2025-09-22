import { createApp, watch } from 'vue'
import { Quasar, Notify, Dialog, ClosePopup, date as qdate } from 'quasar'
import './assets/css/global.css'
import 'quasar/src/css/index.sass'
import '@quasar/extras/material-icons/material-icons.css'
import quasarLangEn from 'quasar/lang/en-GB.js'
import quasarLangFr from 'quasar/lang/fr.js'
import { createI18n } from 'vue-i18n'
import en from './assets/i18n/en.json'
import fr from './assets/i18n/fr.json'
import App from './App.vue'
import router from './components/router/routes.js'

const messages = { en, fr }

const browserLang = (navigator.language || navigator.userLanguage).split('-')[0] // e.g., "fr-FR" → "fr"
const supportedLocales = ['en', 'fr']
const locale = // locale stored in local storage, browser lang or en
  localStorage.getItem('locale') || (supportedLocales.includes(browserLang) ? browserLang : 'en')

export const i18n = createI18n({
  legacy: false, // use Composition API mode
  locale,
  fallbackLocale: 'en', // fallback if translation is missing
  messages,
})
const app = createApp(App)

app.use(router)

app.use(i18n) //special method **$t** defined by i18n and injected in the app to be used within templates

const quasarLangs = {
  en: quasarLangEn,
  fr: quasarLangFr,
}
app.use(Quasar, {
  config: {
    //placeholder for further Quasar config (default colors, default component settings, brand palette, dark mode, global input defaults, etc.)
    brand: {
      primary: '#3c66af',
      secondary: '#26a69a',
      accent: '#9c27b0',
    },
  },
  lang: quasarLangs[locale], //translate Quasar UI elements (dialogs, calendars, etc.) to match the current locale
  plugins: { Notify, Dialog },
  directives: { ClosePopup },
})
// 💡 Watch and update Quasar lang on language change
watch(
  () => i18n.global.locale.value,
  (newLocale) => {
    localStorage.setItem('locale', newLocale)
    app.config.globalProperties.$q.lang.set(quasarLangs[newLocale])
  },
)

// --- global date formatting helpers ---
app.config.globalProperties.$formatDate = (d, mask = 'DD/MM/YYYY') => {
  return qdate.formatDate(d, mask)
}
app.config.globalProperties.$formatDateTime = (d, mask = 'DD/MM/YYYY HH:mm') => {
  return qdate.formatDate(d, mask)
}

app.mount('#app')
