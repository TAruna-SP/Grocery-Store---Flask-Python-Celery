import SearchCatalog from "./SearchCatalog.js"

export default ({
  template: `<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
    <a class="navbar-brand" href="#">E-GroceryStore</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse  justify-content-end" id="navbarNav">
      <div class="navbar-nav">
      <div class= 'd-flex justify-content-center' v-if='isUserActive'>
      <input type="search" class="form-control" placeholder="Search" v-model="searchKey"/>
      <button class="btn btn-outline-success" @click="getSearchKey(searchKey)">Search</button>
       </div>
        <router-link class="nav-item nav-link active" v-if='isUserActive' to="/">Home </router-link>
        <router-link class="nav-item nav-link active"  v-if="userRole!=='admin' &&  !isUserActive" to="/UserLogin">Login </router-link>
        <router-link class="nav-item nav-link active"  v-if="userRole!=='admin' && !isUserActive" to="/UserRegistration">SignUp </router-link>
        <router-link class="nav-item nav-link active"  v-if="userRole==='user'" to="/UserCart">MyCart</router-link>
        <router-link  class="nav-item nav-link" v-if="userRole==='admin'" to="/InActiveUsers" >SignUp Requests</router-link>
        <router-link  class="nav-item nav-link" v-if="userRole==='storageManager'" to="/Reports" >Download Reports</router-link>
        <router-link  class="nav-item nav-link" v-if="userRole==='admin'" to="/CategoryAlterations">Manager Requests</router-link>
     
      <button v-if="isUserActive" class="nav-item nav-link" > {{userName}} </div>

 
        <button  v-if='isUserActive'  class="nav-item nav-link " @click='logoutUser'>logout</button>
      </div>
    </div>
    </div>
    </div>
  </nav>`,

  data() {
    return {
      userRole: localStorage.getItem('userRole'),
      isUserActive: localStorage.getItem('AuthenticationToken'),
      searchKey: null,
      userName: "",
    }
  },
  methods: {
    logoutUser() {
      localStorage.clear()
      this.$router.push({ path: '/UserLogin' })
    },

    getSearchKey(searchKey) {
      const searchKeyData = { searchKeyText: searchKey }

      this.$router.push({
        path: '/SearchCatalog',
        query: searchKeyData
      });
    },
  },

  components: {
    SearchCatalog,
  },

  async created() {
    const userNameObj = await fetch('/getCurrentUser', {
      method: "GET",
    })

    const userNameJsonObj = await userNameObj.json()

    if (userNameJsonObj.ok) {
      this.userName = userNameJsonObj
    }



  }
})