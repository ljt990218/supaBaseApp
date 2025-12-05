import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Clean up any stale service workers from previous projects on this localhost port
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister()
    }
  })
}

createApp(App).mount('#app')
