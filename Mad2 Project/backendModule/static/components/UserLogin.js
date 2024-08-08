export default {
    template: ` 
    <div class= 'd-flex justify-content-center' style="margin-top: 30vh">
    <div class="mb-3 p-5 bg-light">
    <div v-if="loginUIMsg" class="alert alert-danger show mt-5"> {{ loginUIMsg }}</div>
    <div v-if="loginAPIErrorMsg" class="alert alert-danger show mt-5"> {{ loginAPIErrorMsg }}</div>
        <div>
        <label for="userEmail" class="form-label">Email Address</label>
        <input type="email" class="form-control" id="userEmail" placeholder="username@email.com" v-model="inputLoginData.userEmail">
        </div>
        <div>
        <label for="userPassword" class="form-label">Password</label>
        <input type="password" class="form-control" id="userPassword" v-model="inputLoginData.userPassword">
        </div>
        <button type="submit" class="btn btn-primary mt-3" @click='authenticateUser'>Login</button>
    </div>
    </div>
   ` ,
    data() {
        return {
            inputLoginData: {
                userEmail: null,
                userPassword: null
            },
            loginAPIErrorMsg: null,
            loginUIMsg: null
        }
    },

    computed: {
        isValidUser() {
            let validUser = true;

            if (!this.inputLoginData.userEmail) {
                this.loginUIMsg = 'Please Enter Email'
                validUser = false
            } else if (!this.inputLoginData.userPassword) {
                this.loginUIMsg = 'Please Enter Password'
                validUser = false
            }
            return validUser;
        },
    },

    methods: {
        async authenticateUser() {
            if (this.isValidUser) {
                const loginAPIResponse = await fetch('/userLogin', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(this.inputLoginData),
                })
                const authDetails = await loginAPIResponse.json()
                if (loginAPIResponse.ok) {
                    localStorage.setItem('AuthenticationToken', authDetails[0].AuthenticationToken)
                    localStorage.setItem('userRole', authDetails[1].userRole)
                    this.$router.push({ path: '/' })
                } else {
                    this.loginUIMsg = null;
                    this.loginAPIErrorMsg = authDetails.message
                }
            }
        }
    }
}