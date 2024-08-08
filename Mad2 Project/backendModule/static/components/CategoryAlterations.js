import ToAddCategorybySM from "./ToAddCategorybySM.js"
import ToDeleteCategorybySM from "./ToDeleteCategorybySM.js"
import ToEditCategorybySM from "./ToEditCategorybySM.js"

export default {
    template: ` 
    <div class="container">
    <div class="row">
    <div class="col-sm-4">
      <div class="card mt-2 bg-light" style="border-radius: 20px">
        <div class="card-body text-center">
          <h5 class="card-title mb-3">ADD Category Requests</h5>
          <router-link class="btn btn-primary" to="/ToAddCategorybySM">View</router-link>
        </div>
      </div>
    </div>
    <div class="col-sm-4">
      <div class="card mt-2 bg-light" style="border-radius: 20px">
        <div class="card-body text-center">
            <h5 class="card-title mb-3">MODIFY Category Requests</h5>
            <router-link class="btn btn-primary" to="/ToEditCategorybySM">View</router-link>
        </div>
      </div>
    </div>
    <div class="col-sm-4">
        <div class="card mt-2 bg-light" style="border-radius: 20px">
          <div class="card-body text-center">
              <h5 class="card-title mb-3">DELETE Category Requests</h5>
              <router-link  class="btn btn-primary" to="/ToDeleteCategorybySM">View</router-link>
          </div>
        </div>
      </div>
  </div>
    </div>`,

    components: {
        ToAddCategorybySM,
        ToDeleteCategorybySM,
        ToEditCategorybySM
    },

}