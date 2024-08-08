export default {
    template: `<div class="container">
    <div v-if="signUpErrorMsg" class="alert alert-danger show mt-5"> {{ signUpErrorMsg }}</div>
    <div v-if="signUpApprovalMsg" class="alert alert-success" role="alert">{{signUpApprovalMsg}}</div>
    <div v-if="inActiveUserList && inActiveUserList.length > 0" class="row">
        <div class="col-2" v-for="(inActiveUser, index) in inActiveUserList">
            <div class="card mt-2 bg-light text-dark" style="border-radius: 20px">
                <div class="card-body text-center ">
                    <h5 class="card-title mb-3">{{inActiveUser.userName }} </h5>
                    <button class="btn btn-primary" @click="approveSignUp(inActiveUser.userId)">Approve</button>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        <p :style="zeroCountStyle"> No New SignUp Requests</p>
    </div>
</div>`,

    data() {
        return {
            inActiveUserList: [],
            AuthenticationToken: localStorage.getItem("AuthenticationToken"),
            signUpApprovalMsg: null,
            signUpErrorMsg: null,
            zeroCountStyle: {
                color: 'blue',
                fontSize: '20px'
            },
        }
    },
    methods: {
        async approveSignUp(storageManagerId) {
            const inActiveToActiveAPIResponse = await fetch(`/approveSignUp/storageManager/${storageManagerId}`, {
                headers: {
                    "Authentication-Token": this.AuthenticationToken,
                },
            })
            const activeUsers = await inActiveToActiveAPIResponse.json()
            if (inActiveToActiveAPIResponse.ok) {
                this.signUpApprovalMsg = activeUsers.message
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                this.signUpErrorMsg = "Please contact Admin"
            }
        }
    },
    async mounted() {
        const inActiveUserListAPIResponse = await fetch('/inActiveUserList', {
            headers: {
                "Authentication-Token": this.AuthenticationToken
            },
        })
        const inActiveUserList = await inActiveUserListAPIResponse.json()
        if (inActiveUserListAPIResponse.ok) {
            this.inActiveUserList = inActiveUserList
        } else {
            this.signUpErrorMsg = "Please contact Admin"
        }
    },
}