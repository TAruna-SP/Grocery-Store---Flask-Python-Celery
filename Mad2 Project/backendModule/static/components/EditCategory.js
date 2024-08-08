export default {
    template: `<div>
        <div class= 'd-flex justify-content-center' style="margin-top: 20vh">
        <div class="p-5 mb-4 bg-light text-dark">
        <div v-if="editCategoryUIMsg" class="alert alert-danger show mt-5"> {{ editCategoryUIMsg }}</div>
        <div v-if="editCategorySuccessMsg" class="alert alert-success show mt-5"> {{ editCategorySuccessMsg }}</div>
        <div class="form-group row">
        <label for="editCategoryName" class="form-label">Edit Category Name</label>
        <div class="col-sm-12">
        <input type ="text" class="form-control" id="editCategoryName" v-model="editCategoryName" />
        </div>
        </div>
        <button class="btn btn-primary mt-2 float-end" @click="editCategory(categoryId)">Save</button>
        </div></div></div>`,

    data() {
        return {
            editCategoryName: null,
            categoryId: null,
            editCategoryUIMsg: null,
            editCategorySuccessMsg: null,
            AuthenticationToken: localStorage.getItem("AuthenticationToken"),
        }
    },

    computed: {
        isValidEditCategory() {
            let validEditCategory = true;

            if (!this.editCategoryName) {
                this.editCategoryUIMsg = 'Please Enter Category Name'
                validEditCategory = false
            }
            return validEditCategory;
        },
    },

    methods: {
        async editCategory(categoryId) {
            if (this.isValidEditCategory) {
                const editCategoryAPIResponse = await fetch(`/category/${categoryId}`, {
                    method: 'PUT',
                    headers: {
                        "Authentication-Token": this.AuthenticationToken,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "categoryName":
                            this.editCategoryName
                    })
                })

                const editCategoryJsonObj = await editCategoryAPIResponse.json()
                if (editCategoryAPIResponse.ok) {
                    this.editCategorySuccessMsg = editCategoryJsonObj.message
                    this.editCategoryUIMsg = ''
                    setTimeout(() => {
                        this.$router.push('/')
                    }, 2000);
                }
            }
        }
    },

    async mounted() {
        this.categoryId = this.$route.query.categoryObj.categoryId
        this.editCategoryName = this.$route.query.categoryObj.categoryName
    },

}