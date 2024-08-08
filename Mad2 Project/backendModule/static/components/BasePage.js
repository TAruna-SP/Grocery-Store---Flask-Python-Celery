import AddNewCategory from "./AddNewCategory.js"
import AddNewProduct from "./AddNewProduct.js"
import EditCategory from "./EditCategory.js"
import EditProduct from "./EditProduct.js"

export default {
    template: ` 
    <div>
    <div v-if="delCategorySuccess" class="alert alert-success show mt-5"> {{ delCategorySuccess }}</div>
    <div v-if="delProductSuccess" class="alert alert-success show mt-5"> {{ delProductSuccess }}</div>
    <div class= 'd-flex justify-content-center' style="margin-top: 2vh">
    <button v-if="userRole==='admin' || userRole==='storageManager'" type="button" class="btn btn-lg btn-primary position-absolute bottom-0 end-0 m-5" @click="showAddCategory">+</button>
    
    <div class="container row" v-if="categoryList.length >0">
            <div class="col-12"  v-for="category in categoryList">
                <div class="card mt-2 bg-light " style="border-radius: 20px">
                    <div class="card-body text-center ">   
                        <h5 class="card-title mb-3">{{category.categoryName}}</h5>
                            <div class="row" v-if="category.productList.length>0">
                                <div class="col-4" v-for="obj in category.productList">
                                    <div class="card mt-3" style="border-radius: 10px">
                                        <div class="card-body text-center ">
                                            <h5 class="card-title mb-3">{{obj.productName}} {{obj.productRate}}/{{obj.productUnit}}</h5>
                                            <button v-if="userRole==='user' && obj.productQuantity >0" class="btn btn-sm btn-primary " @click="buyProduct(obj)">Buy</button>
                                            <span v-if="userRole==='user' && obj.productQuantity >0" style="position: relative;top: 8px;" class="material-symbols-outlined" >shopping_cart</span>
                                            <button  v-if="obj.productQuantity <=0"  class="btn btn-sm btn-secondary disabled " >Out of Stock</button>
                                            
                                            <button v-if="userRole!=='user' && userRole!=='admin'" class="btn btn-sm btn-primary" @click="showEditProduct(obj)">Edit</button> 
                                            <button v-if="userRole!=='user' && userRole!=='admin'" class="btn btn-sm btn-secondary" @click="delProduct(obj.productId)">Delete</button> 
                                        </div>
                                    </div> 
                                </div>
                            </div>
                            <div v-else>
                            <p>No products created</p>
                            </div>
                        <div class="mb-5 mt-5">
                        <button class= "btn btn-primary btn-sm" v-if="userRole!=='user' && userRole!=='admin'" @click="addProductToCategory(category.categoryId)">+</button>
                        </div>     
                        <button v-if="userRole!=='user'" class="btn btn-sm btn-primary" @click="showEditCategory(category)">Edit</button> 
                        <button v-if="userRole!=='user'" class="btn btn-sm btn-secondary" @click="delCategory(category.categoryId)">Delete</button> 
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
        <p :style="zeroCountStyle"> No Categories or Products Created </p>
        </div>
        </div>
    </div>`,

    data() {
        return {
            userRole: localStorage.getItem('userRole'),
            AuthenticationToken: localStorage.getItem("AuthenticationToken"),
            categoryList: [],
            delCategorySuccess: null,
            delProductSuccess: null,

            zeroCountStyle: {
                color: 'blue',
                fontSize: '20px'
            },
        }
    },

    methods: {
        showAddCategory() {
            this.$router.push('/AddNewCategory')
        },

        addProductToCategory(categoryId) {
            const addPrdToCatData = { prodCategoryId: categoryId }
            this.$router.push({
                path: '/AddNewProduct',
                query: addPrdToCatData
            });
        },

        showEditCategory(categoryObj) {
            const editCatData = { categoryObj: categoryObj }
            this.$router.push({
                path: '/EditCategory',
                query: editCatData
            });
        },

        showEditProduct(productId) {
            const editProdData = { editProductId: productId }
            this.$router.push({
                path: '/EditProduct',
                query: editProdData
            });
        },

        buyProduct(productId) {
            const buyProdData = { buyProductId: productId }
            this.$router.push({
                path: '/BuyProduct',
                query: buyProdData
            });
        },

        async delCategory(categoryId) {
            const getDelCatConfirmation = window.confirm(" Are you sure to delete this category")
            if (getDelCatConfirmation) {
                const delCategoryAPIResponse = await fetch(`/category/${categoryId}`, {
                    method: 'DELETE',
                    headers: {
                        "Authentication-Token": this.AuthenticationToken,
                    },
                })
                const delCategoryResJsonObj = await delCategoryAPIResponse.json()
                if (delCategoryAPIResponse.ok) {
                    this.delCategorySuccess = delCategoryResJsonObj.message
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            }
        },

        async delProduct(productId) {
            const getDelProdConfirmation = window.confirm(" Are you sure to delete this product")
            if (getDelProdConfirmation) {
                const delProdAPIResponse = await fetch(`/product/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        "Authentication-Token": this.AuthenticationToken,
                    },
                })
                const delProdResJsonObj = await delProdAPIResponse.json()
                if (delProdAPIResponse.ok) {
                    this.delProductSuccess = delProdResJsonObj.message
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            }
        },

    },

    components: {
        AddNewCategory,
        AddNewProduct,
        EditCategory,
        EditProduct,
    },

    async mounted() {
        const categoryListAPIResponse = await fetch('/category', {
            headers: {
                "Authentication-Token": this.AuthenticationToken,
            },
        })
        const categoryListJsonObj = await categoryListAPIResponse.json()
        if (categoryListAPIResponse.ok) {
            this.categoryList = categoryListJsonObj
        } else {
            alert(categoryListJsonObj.message)
        }
    }
}


