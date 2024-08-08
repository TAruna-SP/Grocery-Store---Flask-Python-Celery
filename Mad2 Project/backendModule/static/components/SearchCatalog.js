export default {
    template: ` <div>
  
    <div class="row">
    <div class="col-6" v-for="searchKey in searchResults">
        <div class="card mt-2 bg-light text-dark" style="border-radius: 20px">
            <div class="card-body text-center ">   
                <h5 class="card-title mb-3">{{searchKey.categoryName}}</h5>
                    <div class="row">
                        <div class="col-3" v-for="prod in searchKey.productList">
                            <div class="card" style="border-radius: 10px">
                                <div class="card-body text-center ">
                                    <h5 class="card-title mb-3">{{prod.productName}}</h5>
                                </div>
                            </div> 
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
    `,

    data() {
        return {
            searchResults: [],
            searchKey: null,
            AuthenticationToken: localStorage.getItem("AuthenticationToken"),
        }
    },

    async mounted() {
        this.searchKey = this.$route.query.searchKeyText
        // console.log(this.searchKeyText)
        const searchResultsAPIRes = await fetch(`/searchProducts/${this.searchKey}`, {
            headers: {
                "Authentication-Token": this.AuthenticationToken,
            },
        })

        const searchResultsObj = await searchResultsAPIRes.json()
        if (searchResultsAPIRes.ok) {
            this.searchResults = searchResultsObj
            console.log(this.searchResults)
        } else {
            alert(searchResultsObj.message)
        }
    }
}






