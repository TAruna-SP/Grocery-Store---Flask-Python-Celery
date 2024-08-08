export default {
    template: `
        <div class= 'd-flex justify-content-center' style="margin-top: 30vh">
            <div class="mb-4 p-5 bg-light">
            <div v-if="newProductAddUIMsg" class="alert alert-danger mt-5"> {{ newProductAddUIMsg }}</div>
            <div v-if="newProductAddAPIMsg" class="alert alert-danger show mt-5"> {{ newProductAddAPIMsg }}</div>
            <div v-if= "newProductAddSuccessMsg" class="alert alert-success" role="alert">
            {{newProductAddSuccessMsg}}
            </div>
            
            <form>
            <div class="mt-3">
            <label for="productName" class="form-label">Product Name</label>
            <input type="text" class="form-control" id="productName" v-model="newProductData.productName">
            </div>
            
            <div class="mt-3">
            <label for="productExpiryDate" class="form-label">Expiry Date</label>
            <input type="date" class="form-control" id="productExpiryDate" v-model="newProductData.productExpiryDate">
            </div>

            <div class="mt-3">
            <label for="productRate" class="form-label">Rate</label>
            <input type="text" class="form-control" id="productRate" v-model="newProductData.productRate">
            </div>

            <div class="mt-3">
            <label for="productUnit" class="form-label">Unit</label>
            <select id="productUnit"  v-model="newProductData.productUnit">
               <option v-for="unit in productUnits" v-bind:value="unit.unitName">{{unit.unitName}}</option>
            </select>
            </div>

            <div class="mt-3">
            <label for="productQuantity" class="form-label">Quantity</label>
            <input type="text" class="form-control" id="productQuantity" v-model="newProductData.productQuantity">
            </div>
                      
            <div class="mt-3">
            <button class="btn btn-primary mt-2" @click="addNewProduct(prodCategoryId)">Save</button>
            </div>
            </form>
        </div></div>
    `,

    data() {
        return {
            newProductData: {
                productName: null,
                productExpiryDate: null,
                productRate: null,
                productUnit: null,
                productQuantity: null
            },
            AuthenticationToken: localStorage.getItem("AuthenticationToken"),
            newProductAddUIMsg: null,
            newProductAddAPIMsg: null,
            newProductAddSuccessMsg: null,
            prodCategoryId: null,

            productUnits: [
                { unitId: 1, unitName: 'kg' },
                { unitId: 1, unitName: 'litre' },
                { unitId: 1, unitName: 'dozen' },
                { unitId: 1, unitName: 'gram' },
            ]
        }
    },

    computed: {
        isValidProdAddData() {
            let validProdAddData = true;

            if (!this.newProductData.productName) {
                this.newProductAddUIMsg = 'Please Enter Product Name'
                validProdAddData = false
            } else if (!this.newProductData.productExpiryDate) {
                this.newProductAddUIMsg = 'Please Select Product ExpiryDate'
                validProdAddData = false
            } else if (!this.newProductData.productRate) {
                this.newProductAddUIMsg = 'Please Enter Product Rate'
                validProdAddData = false
            } else if (!this.newProductData.productUnit) {
                this.newProductAddUIMsg = 'Please Select Product Unit'
                validProdAddData = false
            } else if (!this.newProductData.productQuantity) {
                this.newProductAddUIMsg = 'Please Enter Product Quantity'
                validProdAddData = false
            }

            return validProdAddData;
        },
    },

    methods: {
        async addNewProduct(categoryId) {
            if (this.isValidProdAddData) {
                const newprodAPI = await fetch(`/product/${categoryId}`, {
                    method: "POST",
                    headers: {
                        "Authentication-Token": this.AuthenticationToken,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(this.newProductData),
                })

                const newProduct = await newprodAPI.json()
                if (newprodAPI.ok) {
                    this.newProductAddSuccessMsg = newProduct.message
                    this.newProductAddUIMsg = ''
                    setTimeout(() => {
                        this.$router.push('/')
                    }, 2000);
                } else {
                    this.newProductAddAPIMsg = newProduct.message
                }
            }
        }
    },

    async created() {
        this.prodCategoryId = this.$route.query.prodCategoryId

    },

}