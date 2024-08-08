export default {
    template: `
        <div class= 'd-flex justify-content-center' style="margin-top: 30vh">
            <div class="mb-3 p-5 bg-light">
            <div v-if="editCartUIMsg" class="alert alert-danger show mt-5"> {{ editCartUIMsg }}</div>
            <div v-if="editCartSuccessMsg" class="alert alert-success show mt-5"> {{ editCartSuccessMsg }}</div>
            <div v-if="editCartAPIErrorMsg" class="alert alert-success show mt-5"> {{ editCartAPIErrorMsg }}</div>
          
            <label for="Availability" class="form-label">Availability</label>
            <input type="text" class="form-control" id="Availability" v-model="cartProductAvailability" readonly>
            
            <label for="Quantity" class="form-label">Quantity</label>
            <input type="text" class="form-control" id="Quantity" v-model="editCartProductData.cartProductQuantity" @input="getNewTotalPrice"/>

            <label for="Price" class="form-label">Price</label>
            <input type="text" class="form-control" id="Price" v-model="cartProductPrice" readonly>

            <label for="Total" class="form-label">Total</label>
            <input type="text" class="form-control" id="Total" v-model="newTotal">
                      
            <button class="btn btn-primary mt-2" @click="saveProductCart(toEditCartData.purchaseId)">Save</button>
            <button class="btn btn-secondary mt-2" @click="deleteProductCart(toEditCartData.purchaseId)">Remove</button>
        </div>
    </div>`,

    data() {
        return {
            cartProductAvailability: null,
            newTotal: null,
            cartProductPrice: null,
            editCartProductData: {
                cartProductQuantity: null,
            },
            AuthenticationToken: localStorage.getItem("AuthenticationToken"),
            toEditCartData: null,
            editCartUIMsg: null,
            editCartSuccessMsg: null,
            editCartAPIErrorMsg: null,
        }
    },

    computed: {
        isValidCartProdQuantity() {
            let validcartProdQuantity = true;

            if (!this.editCartProductData.cartProductQuantity) {
                this.editCartUIMsg = 'Please Enter Quantity'
                validcartProdQuantity = false
            } else if (this.editCartProductData.cartProductQuantity < 1) {
                this.editCartUIMsg = 'Please Enter Valid Quantity'
                validcartProdQuantity = false
            }
            return validcartProdQuantity;
        },

        getNewTotalPrice() {
            this.newTotal = this.cartProductPrice * this.editCartProductData.cartProductQuantity;
        },
    },

    methods: {

        async saveProductCart(purchaseId) {
            if (this.isValidCartProdQuantity) {
                const editCartProdAPIRes = await fetch(`/reviewProductCart/${this.toEditCartData.purchaseId}`, {
                    method: "PUT",
                    headers: {
                        "Authentication-Token": this.AuthenticationToken,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "productQuantity":
                            this.editCartProductData.cartProductQuantity
                    })

                })
                const editCartProd = await editCartProdAPIRes.json()
                if (editCartProdAPIRes.ok) {
                    this.editCartSuccessMsg = editCartProd.message
                    this.editCartUIMsg = ''
                    this.editCartAPIErrorMsg = ''
                    setTimeout(() => {
                        this.$router.push('/UserCart')
                    }, 2000);
                } else {
                    this.editCartAPIErrorMsg = editCartProd.message
                }
            }
        },

        async deleteProductCart(purchaseId) {
            const delCartProdAPIRes = await fetch(`/reviewProductCart/${this.toEditCartData.purchaseId}`, {
                method: "DELETE",
                headers: {
                    "Authentication-Token": this.AuthenticationToken,
                    "Content-Type": "application/json",
                },
            })

            const delCartProd = await delCartProdAPIRes.json()
            if (delCartProdAPIRes.ok) {
                this.editCartSuccessMsg = delCartProd.message
                this.editCartAPIErrorMsg = ''
                setTimeout(() => {
                    this.$router.push('/UserCart')
                }, 2000);
            } else {
                this.editCartAPIErrorMsg = delCartProd.message
            }
        },
    },

    async created() {
        this.toEditCartData = this.$route.query.toEditCartObj
        this.editCartProductData.cartProductQuantity = this.toEditCartData.purchaseQuantity
        this.cartProductPrice = this.toEditCartData.productUnitPrice
        this.newTotal = this.toEditCartData.productTotalPrice
        this.cartProductAvailability = "In Stock"
    },
}
