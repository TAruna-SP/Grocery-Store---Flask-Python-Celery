export default {
    template: `
        <div class= 'd-flex justify-content-center' style="margin-top: 30vh">
            <div class="mb-3 p-5 bg-light">
        
            <div v-if="buyProductUIMsg" class="alert alert-danger show mt-5"> {{ buyProductUIMsg }}</div>
            <div v-if="buyProductSuccessMsg" class="alert alert-success show mt-5"> {{ buyProductSuccessMsg }}</div>
            <div v-if="buyProductAPIErrorMsg" class="alert alert-success show mt-5"> {{ buyProductAPIErrorMsg }}</div>
          
            <label for="Availability" class="form-label">Availability</label>
            <input type="text" class="form-control" id="Availability" v-model="productAvailability" readonly>
            
            <label for="Quantity" class="form-label">Quantity</label>
            <input type="text" class="form-control" id="Quantity" v-model="buyProductData.productQuantity" @input="getTotalPrice"/>

            <label for="Price" class="form-label">Price</label>
            <input type="text" class="form-control" id="Price" v-model="productPrice">

            <label for="Total" class="form-label">Total</label>
            <input type="text" class="form-control" id="Total" v-model="Total">
                      
            <button class="btn btn-primary mt-2" @click="buyProduct(buyProductId)">Add To Cart</button>
        </div>
    </div>`,

    data() {
        return {
            productAvailability: null,
            Total: null,
            productPrice: null,
            buyProductData: {
                productQuantity: null,
            },
            AuthenticationToken: localStorage.getItem("AuthenticationToken"),
            buyProductSuccessMsg: null,
            buyProductUIMsg: null,
            buyProductAPIErrorMsg: null,
            buyProductId: null,
        }
    },

    computed: {
        isValidQuantity() {
            let validQuantity = true;

            if (!this.buyProductData.productQuantity) {
                this.buyProductUIMsg = 'Please Enter Quantity'
                validQuantity = false
            } else if (this.buyProductData.productQuantity < 1) {
                this.buyProductUIMsg = 'Please Enter Valid Quantity'
                validQuantity = false
            }
            return validQuantity;
        },

        getTotalPrice() {
            this.Total = this.productPrice * this.buyProductData.productQuantity;
        },
    },

    methods: {


        async buyProduct(productId) {
            if (this.isValidQuantity) {
                const buyProdAPIRes = await fetch(`/addProductToCart/${productId}`, {
                    method: "POST",
                    headers: {
                        "Authentication-Token": this.AuthenticationToken,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(this.buyProductData),
                })

                const prodAdded = await buyProdAPIRes.json()
                if (buyProdAPIRes.ok) {
                    this.buyProductSuccessMsg = prodAdded.message
                    this.buyProductAPIErrorMsg = ''
                    this.buyProductUIMsg = ''
                    setTimeout(() => {
                        this.$router.push('/')
                    }, 2000);
                } else {
                    this.buyProductAPIErrorMsg = prodAdded.message
                }
            }
        }
    },

    async created() {
        this.buyProductId = this.$route.query.buyProductId.productId
        this.productPrice = this.$route.query.buyProductId.productRate
        if (this.$route.query.buyProductId.productQuantity > 0) {
            this.productAvailability = "In Stock"
        } else {
            this.productAvailability = "Out Of Stock"
        }
    }
}
