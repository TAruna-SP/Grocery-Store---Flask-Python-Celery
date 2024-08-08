export default {
    template: ` <div class="container">
    <div v-if="editApprovalErrorMsg" class="alert alert-danger show mt-5"> {{ editApprovalErrorMsg }}</div>
    <div v-if="editApprovalMsg" class="alert alert-success" role="alert">{{editApprovalMsg}}</div>
    <div class="row" v-if="toModifyCatList.length>0">
        <div class="col-2" v-for="(category, index) in toModifyCatList">
            <div class="card mt-2 bg-light text-dark" style="border-radius: 20px">
                <div class="card-body text-center ">
                    <h5 class="card-title mb-3">{{category.categoryName }} </h5>
                    <button class="btn btn-primary" @click="approveToModify(category.categoryId)">Approve</button>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        <p :style="zeroCountStyle"> No Category Modification Requests by Storage Manager </p>
    </div>
</div>`,

    data() {
        return {
            toModifyCatList: [],
            AuthenticationToken: localStorage.getItem("AuthenticationToken"),
            editApprovalMsg: null,
            editApprovalErrorMsg: null,
            zeroCountStyle: {
                color: 'blue',
                fontSize: '20px'
            },
        }
    },
    methods: {
        async approveToModify(categoryId) {
            const approveToModifyCatAPIRes = await fetch(`/approve/category/${categoryId}`, {
                headers: {
                    "Authentication-Token": this.AuthenticationToken,
                },
            })
            const modifyApprovalObj = await approveToModifyCatAPIRes.json()
            if (approveToModifyCatAPIRes.ok) {
                this.editApprovalMsg = modifyApprovalObj.message
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                this.editApprovalErrorMsg = "Please check with Admin"
            }
        }
    },
    async mounted() {
        const toModifyCategoryListAPIResponse = await fetch('/toModifyCatList', {
            headers: {
                "Authentication-Token": this.AuthenticationToken
            },
        })
        const toModifyCatList = await toModifyCategoryListAPIResponse.json()
        if (toModifyCategoryListAPIResponse.ok) {
            this.toModifyCatList = toModifyCatList
        } else {
            this.editApprovalErrorMsg = "Please check with Admin"
        }
    },
}