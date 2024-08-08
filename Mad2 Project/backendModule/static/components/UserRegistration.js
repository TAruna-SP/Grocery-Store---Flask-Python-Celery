export default {
    template: `
            <div class= 'd-flex justify-content-center' style="margin-top: 20vh">
            <div class="mb-3 p-5 bg-light">
            <div v-if="registrationUIMsg" class="alert alert-info danger mt-5"> {{ registrationUIMsg }}</div>
            <div v-if="registrationAPIErrorMsg" class="alert alert-danger show mt-5"> {{ registrationAPIErrorMsg }}</div>
            <div v-if= "registrationSuccess" class="alert alert-success" role="alert">
            {{registrationSuccess}}
            </div>
            <div>
            <label for="userEmail" class="form-label">Email Address</label>
            <input type="email" class="form-control" id="userEmail" placeholder="username@email.com" v-model="inputRegistrationData.userEmail">
            </div>

            <div>
            <label for="userPassword" class="form-label">Password</label>
            <input type="password" class="form-control" id="userPassword" v-model="inputRegistrationData.userPassword">
            </div>

            <div>
            <label for="userName" class="form-label">Username</label>
            <input type="text" class="form-control" id="userName" v-model="inputRegistrationData.userName">
            </div>

            <div>
            <label>Select your role:</label>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="userSelectedRole" id="userSelectedRole" value="user" v-model="inputRegistrationData.userSelectedRole">
              <label class="form-check-label" for="userSelectedRole">User</label>
            </div>

            <div class="form-check">
              <input class="form-check-input" type="radio" name="userSelectedRole" id="userSelectedRole" value="storageManager" v-model="inputRegistrationData.userSelectedRole">
              <label class="form-check-label" for="userSelectedRole">StorageManager</label>
            </div>
            </div>
                      
            <button class="btn btn-primary mt-3" @click='registerNewUser'>Register</button>
        </div>
    </div>`,

    data() {
        return {
            inputRegistrationData: {
                userEmail: null,
                userPassword: null,
                userName: null,
                userSelectedRole: null
            },
            registrationAPIErrorMsg: null,
            registrationSuccess: null,
            registrationUIMsg: null

        }
    },

    computed: {
        isValidRegistrationData() {
            let validRegistrationData = true;

            if (!this.inputRegistrationData.userEmail) {
                this.registrationUIMsg = 'Please Enter Email'
                validRegistrationData = false
            } else if (!this.inputRegistrationData.userPassword) {
                this.registrationUIMsg = 'Please Enter Password'
                validRegistrationData = false
            } else if (!this.inputRegistrationData.userName) {
                this.registrationUIMsg = 'Please Enter UserName'
                validRegistrationData = false
            } else if (!this.inputRegistrationData.userSelectedRole) {
                this.registrationUIMsg = 'Please Select Role'
                validRegistrationData = false
            }
            return validRegistrationData;
        },
    },

    methods: {
        async registerNewUser() {
            if (this.isValidRegistrationData) {
                const newRegistrationAPIResponse = await fetch('/register', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(this.inputRegistrationData),
                })

                const newRegDetails = await newRegistrationAPIResponse.json()
                if (newRegistrationAPIResponse.ok) {
                    this.registrationSuccess = newRegDetails.message
                    setTimeout(() => {
                        this.$router.push('/')
                    }, 2000);

                } else {
                    this.registrationAPIErrorMsg = newRegDetails.message
                }
            }
        }
    }

}