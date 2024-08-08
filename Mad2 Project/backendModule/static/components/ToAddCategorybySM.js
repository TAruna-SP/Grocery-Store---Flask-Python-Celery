export default {
    template: ` <div class="container">
    <div v-if="addApprovalErrorMsg" class="alert alert-danger show mt-5"> {{ addApprovalErrorMsg }}</div>
    <div v-if= "addApprovalMsg" class="alert alert-success" role="alert">
    {{addApprovalMsg}}
    </div>
    <div class="row" v-if="toAddCatList.length>0">
        <div class="col-2" v-for="(category, index) in toAddCatList">
            <div class="card mt-2 bg-light text-dark" style="border-radius: 20px">
                <div class="card-body text-center ">
                    <h5 class="card-title mb-3">{{category.categoryName }} </h5>
                    <button class="btn btn-primary" @click="approveToAdd(category.categoryId)">Approve</button>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        <p :style="zeroCountStyle"> No Category Addition Requests by Storage Manager </p>
    </div>
</div>`,

    data() {
        return {
            toAddCatList: [],
            AuthenticationToken: localStorage.getItem("AuthenticationToken"),
            addApprovalMsg: null,
            addApprovalErrorMsg: null,
            zeroCountStyle: {
                color: 'blue',
                fontSize: '20px'
            },
        }
    },
    methods: {
        async approveToAdd(categoryId) {
            const approveToAddCatAPIRes = await fetch(`/approve/category/${categoryId}`, {
                headers: {
                    "Authentication-Token": this.AuthenticationToken,
                },
            })
            const approvalObj = await approveToAddCatAPIRes.json()
            if (approveToAddCatAPIRes.ok) {
                this.addApprovalMsg = approvalObj.message
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                this.addApprovalErrorMsg = "Please check with Admin"
            }
        }
    },
    async mounted() {
        const toAddCategoryListAPIResponse = await fetch('/toAddCatList', {
            headers: {
                "Authentication-Token": this.AuthenticationToken
            },
        })
        const toAddCatList = await toAddCategoryListAPIResponse.json()
        if (toAddCategoryListAPIResponse.ok) {
            this.toAddCatList = toAddCatList
        } else {
            this.addApprovalErrorMsg = "Please check with Admin"
        }
    },
}