import router from "./router.js"
import Navigation from "./components/Navigation.js"

router.beforeEach((to, from, next) => {
    if (to.name !== 'UserLogin' && !localStorage.getItem('AuthenticationToken') && to.name !== 'UserRegistration') {
        next({ name: 'UserLogin' })
    } else {
        next()
    }
})

new Vue({
    el: '#app',
    template: `<div>
    <Navigation :key='navReload'/>
    <router-view class="m-3"/></div>`,
    router,
    components: {
        Navigation,
    },

    data: {
        navReload: false,
    },

    watch: {
        $route(to, from) {
            this.navReload = !this.navReload
        }
    },
})