export default {
    template: `
    <div class="container">
    <div v-if="userCartMsg" class="alert alert-success show mt-5"> {{ userCartMsg }}</div>
        <div v-for="product in userCart">
            <div class="card mt-2 bg-light text-dark">
                <div class="card-body">
                    <div class="row" >
                        <div class="col-3">
                            <h5 class="card-title" > {{ product.purchaseCategory}} - {{product.purchaseProduct}}</h5>
                        </div>
                        <div class="col-3">
                            <h5 class="card-title" > {{ product.purchaseQuantity}}{{ product.productUnit}}</h5>
                        </div>
                        <div class="col-3">
                            <h5 class="card-title"> {{ product.productUnitPrice}}/{{product.productUnit}}</h5>
                        </div>
                        <div class="col-3">
                            <button class="btn btn-sm btn-primary" @click=editCart(product)>Review</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <p> Grand Total: {{ getTotalPrice }} </p>
        <button class="btn btn-sm btn-primary float-end" @click=createOrder(userCart)>Buy All</button>
    </div> `,

    data() {
        return {
            userRole: localStorage.getItem('userRole'),
            AuthenticationToken: localStorage.getItem("AuthenticationToken"),
            userCart: [],
            userCartMsg: null,
        }
    },

    computed: {
        getTotalPrice() {
            var totalPrice = 0
            this.userCart.forEach((cartObj) => {
                totalPrice += cartObj.productTotalPrice
            });
            return totalPrice + ' Rs'
        }
    },

    methods: {
        editCart(product) {
            const cartProdData = { toEditCartObj: product }
            this.$router.push({
                path: '/EditUserCart',
                query: cartProdData
            });
        },

        createOrder(userCart) {
            const userCartData = { userCartObj: userCart }
            this.$router.push({
                path: '/UserOrders',
                query: userCartData
            });
        },
    },

    async mounted() {
        const getUserCartAPIResponse = await fetch('/viewProductCart', {
            headers: {
                "Authentication-Token": this.AuthenticationToken,
            },
        })

        const userCartObj = await getUserCartAPIResponse.json()
        if (getUserCartAPIResponse.ok) {
            this.userCart = userCartObj
        } else {
            this.userCartMsg = userCartObj.message
        }
    },
}






