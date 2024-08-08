export default {
    template: `<div>
    <div v-if="userOrdersAPIMsg" class="alert alert-success" role="alert">{{userOrdersAPIMsg}}</div >
        <table class="table" v-for="(invoiceId) in Object.keys(userOrdersResult)">
            <thead>
                <tr>
                <th scope="col">S.No</th>
                <th scope="col">Category</th>
                <th scope="col">Product</th>
                <th scope="col">Quantity</th>
                <th scope="col">Total Price</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(userOrder, index) in userOrdersResult[invoiceId]"> 
                <th scope="row">{{index+1}}</th>
                <td>{{userOrder.orderCategory}}</td>
                <td>{{userOrder.orderProduct}}</td>
                <td>{{userOrder.orderQuantity}}</td>
                <td>{{userOrder.orderTotalPrice}}</td>
                </tr>
            </tbody>
        </table>
    </div>`,

    data() {
        return {
            AuthenticationToken: localStorage.getItem("AuthenticationToken"),
            userOrdersAPIMsg: null,
            userOrders: null,
            userOrdersResult: null,
        }
    },

    async created() {

        const createOrderAPIRes = await fetch('/Orders', {
            method: "POST",
            headers: {
                "Authentication-Token": this.AuthenticationToken,
            },
        })

        const userOrderCreated = await createOrderAPIRes.json()
        if (createOrderAPIRes.ok) {

            this.userOrdersAPIMsg = userOrderCreated.message
            const viewOrderAPIRes = await fetch('/Orders', {
                headers: {
                    "Authentication-Token": this.AuthenticationToken,
                },
            })
            const userOrderList = await viewOrderAPIRes.json()
            if (viewOrderAPIRes.ok) {
                this.userOrders = userOrderList
                this.userOrdersResult = Object.groupBy(this.userOrders, ({ orderInvoiceId }) => orderInvoiceId)
            }
            setTimeout(() => {
                this.$router.push('/UserOrders')
            }, 2000);
        }
    }

}
