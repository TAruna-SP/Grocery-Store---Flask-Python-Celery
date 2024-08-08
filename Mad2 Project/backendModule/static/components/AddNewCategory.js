export default {
    template: `<div>
        <div class= 'd-flex justify-content-center' style="margin-top: 30vh">
        <div class="p-5 mb-4 bg-light text-dark">
        <div v-if="addCategoryUIMsg" class="alert alert-danger show mt-5"> {{ addCategoryUIMsg }}</div>
        <div v-if="addCategorySuccess" class="alert alert-success show mt-5"> {{ addCategorySuccess }}</div>
        <div class="form-group row">
        <label for="categoryName" class="col-sm-5 col-form-label">Category Name:</label>
		<div class="col-sm-12">
        <input type ="text" class="form-control" id="categoryName" placeholder="Enter category name" v-model="categoryName" />
        </div>
        </div>
		<button class="btn btn-primary mt-4 float-end" @click="addNewCategory">Save</button>
    </div></div>`,

    data() {
        return {
            categoryName: null,
            addCategoryUIMsg: null,
            addCategorySuccess: null,
            AuthenticationToken: localStorage.getItem("AuthenticationToken"),
        }
    },

    computed: {
        isValidCategory() {
            let validCategory = true;

            if (!this.categoryName) {
                this.addCategoryUIMsg = 'Please Enter Category Name'
                validCategory = false
            }
            return validCategory;
        },
    },

    methods: {
        async addNewCategory() {
            if (this.isValidCategory) {
                const addCategoryAPIResponse = await fetch('/category', {
                    method: 'POST',
                    headers: {
                        "Authentication-Token": this.AuthenticationToken,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "categoryName":
                            this.categoryName
                    })
                })

                const addCategoryJsonObj = await addCategoryAPIResponse.json()
                if (addCategoryAPIResponse.ok) {
                    this.addCategorySuccess = addCategoryJsonObj.message
                    this.addCategoryUIMsg = ''
                    setTimeout(() => {
                        this.$router.push('/')
                    }, 2000);
                }
            }
        }
    }
}