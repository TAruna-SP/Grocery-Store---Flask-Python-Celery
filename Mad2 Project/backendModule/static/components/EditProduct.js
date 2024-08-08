export default {
    template: `
    <div class='d-flex justify-content-center' style="margin-top: 20vh">

    <div class="mb-3 p-5 bg-light">

        <div v-if="editProductUIMsg" class="alert alert-danger mt-5"> {{ editProductUIMsg }}</div>
        <div v-if="editProductAPIMsg" class="alert alert-danger show mt-5"> {{ editProductAPIMsg }}</div>
        <div v-if="editProductSuccessMsg" class="alert alert-success" role="alert">
            {{editProductSuccessMsg}}
        </div>

        <label for="productName" class="form-label">Product Name</label>
        <input type="text" class="form-control" id="productName" v-model="editProductData.productName">

        <label for="productExpiryDate" class="form-label">Expiry Date</label>
        <input type="date" class="form-control" id="productExpiryDate" v-model="editProductData.productExpiryDate">

        <label for="productRate" class="form-label">Rate</label>
        <input type="text" class="form-control" id="productRate" v-model="editProductData.productRate">

        <div class="mt-3">
            <label for="productUnit" class="form-label">Unit</label>
            <select id="productUnit" v-model="editProductData.productUnit">
                <option v-for="unit in productUnits" v-bind:value="unit.unitName">{{unit.unitName}}</option>
            </select>
        </div>

        <label for="productQuantity" class="form-label">Quantity</label>
        <input type="text" class="form-control" id="productQuantity" v-model="editProductData.productQuantity">

        <button class="btn btn-primary mt-2" @click="editProduct(editProductId)">Save</button>
    </div>
    </div>
   `,

    data() {
        return {
            editProductData: {
                productName: null,
                productExpiryDate: null,
                productRate: null,
                productUnit: null,
                productQuantity: null
            },
            editProductId: null,
            AuthenticationToken: localStorage.getItem("AuthenticationToken"),
            editProductUIMsg: null,
            editProductAPIMsg: null,
            editProductSuccessMsg: null,
            productUnits: [
                { unitId: 1, unitName: 'kg' },
                { unitId: 1, unitName: 'litre' },
                { unitId: 1, unitName: 'dozen' },
                { unitId: 1, unitName: 'gram' },
            ]
        }
    },

    computed: {
        isValidEditProdData() {
            let validEditProdData = true;

            if (!this.editProductData.productName) {
                this.editProductUIMsg = 'Please Enter Product Name'
                validEditProdData = false
            } else if (!this.editProductData.productExpiryDate) {
                this.editProductUIMsg = 'Please Select Product ExpiryDate'
                validEditProdData = false
            } else if (!this.editProductData.productRate) {
                this.editProductUIMsg = 'Please Enter Product Rate'
                validEditProdData = false
            } else if (!this.editProductData.productUnit) {
                this.editProductUIMsg = 'Please Select Product Unit'
                validEditProdData = false
            } else if (!this.editProductData.productQuantity) {
                this.editProductUIMsg = 'Please Enter Product Quantity'
                validEditProdData = false
            }

            return validEditProdData;
        },
    },


    methods: {
        async editProduct(productId) {
            if (this.isValidEditProdData) {
                console.log(productId)
                const editProdAPI = await fetch(`/product/${productId}`, {
                    method: "PUT",
                    headers: {
                        "Authentication-Token": this.AuthenticationToken,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(this.editProductData),
                })

                const editProduct = await editProdAPI.json()
                if (editProdAPI.ok) {
                    this.editProductSuccessMsg = editProduct.message
                    this.editProductUIMsg = ''
                    setTimeout(() => {
                        this.$router.push('/')
                    }, 2000);
                } else {
                    this.editProductAPIMsg = editProduct.message
                }
            }
        },

        processExpiryDateFormat(productExpiryDate) {
            productExpiryDate = new Date(productExpiryDate);
            const prodExpiryYear = productExpiryDate.getFullYear();
            const prodExpiryMonth = String(productExpiryDate.getMonth() + 1).padStart(2, '0');
            const prodExpiryDay = String(productExpiryDate.getDate()).padStart(2, '0');
            const prodExpiryDateFormatted = `${prodExpiryYear}-${prodExpiryMonth}-${prodExpiryDay}`;
            return prodExpiryDateFormatted;
        }
    },

    async created() {
        this.editProductId = this.$route.query.editProductId.productId
        this.editProductData.productName = this.$route.query.editProductId.productName
        this.editProductData.productExpiryDate = this.processExpiryDateFormat(this.$route.query.editProductId.productExpiryDate)
        this.editProductData.productRate = this.$route.query.editProductId.productRate
        this.editProductData.productUnit = this.$route.query.editProductId.productUnit
        this.editProductData.productQuantity = this.$route.query.editProductId.productQuantity
    },

}