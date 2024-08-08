export default {
    template: ` <div class="container">
    <div v-if="deleteApprovalErrorMsg" class="alert alert-danger show mt-5"> {{ deleteApprovalErrorMsg }}</div>
    <div v-if="deleteApprovalMsg" class="alert alert-success" role="alert">{{deleteApprovalMsg}}</div>
    <div class="row" v-if="toDelCatList.length>0">
        <div class="col-2" v-for="(category, index) in toDelCatList">
            <div class="card mt-2 bg-light text-dark" style="border-radius: 20px">
                <div class="card-body text-center ">
                    <h5 class="card-title mb-3">{{category.categoryName }} </h5>
                    <button class="btn btn-primary" @click="approveToDelete(category.categoryId)">Approve</button>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        <p :style="zeroCountStyle"> No Category Deletion Requests by Storage Manager</p>
    </div>
</div>`,

    data() {
        return {
            toDelCatList: [],
            AuthenticationToken: localStorage.getItem("AuthenticationToken"),
            deleteApprovalMsg: null,
            deleteApprovalErrorMsg: null,
            zeroCountStyle: {
                color: 'blue',
                fontSize: '20px'
            },
        }
    },
    methods: {
        async approveToDelete(categoryId) {
            const approveToDelCatAPIRes = await fetch(`/approve/category/${categoryId}`, {
                headers: {
                    "Authentication-Token": this.AuthenticationToken,
                },
            })
            const delApprovalObj = await approveToDelCatAPIRes.json()
            if (approveToDelCatAPIRes.ok) {
                this.deleteApprovalMsg = delApprovalObj.message
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                this.deleteApprovalErrorMsg = "Please check with Admin"
            }
        }
    },
    async mounted() {
        const toDeleteCategoryListAPIResponse = await fetch('/toDelCatList', {
            headers: {
                "Authentication-Token": this.AuthenticationToken
            },
        })
        const toDelCatList = await toDeleteCategoryListAPIResponse.json()
        if (toDeleteCategoryListAPIResponse.ok) {
            this.toDelCatList = toDelCatList
        } else {
            this.deleteApprovalErrorMsg = "Please check with Admin"
        }
    },
}