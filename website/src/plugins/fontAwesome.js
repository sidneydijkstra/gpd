
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* import specific icons */
import { faUserSecret, faFile, faFolder, faShieldHalved } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faUserSecret, faFile, faFolder, faShieldHalved)

export default {
    install: (app) => {
        app.component('fa-icon', FontAwesomeIcon)
    }
}