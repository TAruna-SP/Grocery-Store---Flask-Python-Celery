import BasePage from "./components/BasePage.js"
import UserLogin from "./components/UserLogin.js"
import UserRegistration from "./components/UserRegistration.js"
import InActiveUsers from "./components/InActiveUsers.js"
import CategoryAlterations from "./components/CategoryAlterations.js"
import AddNewCategory from "./components/AddNewCategory.js"
import AddNewProduct from "./components/AddNewProduct.js"
import EditCategory from "./components/EditCategory.js"
import EditProduct from "./components/EditProduct.js"
import BuyProduct from "./components/BuyProduct.js"
import UserCart from './components/UserCart.js'
import SearchCatalog from "./components/SearchCatalog.js"
import ToAddCategorybySM from "./components/ToAddCategorybySM.js"
import ToEditCategorybySM from "./components/ToEditCategorybySM.js"
import ToDeleteCategorybySM from "./components/ToDeleteCategorybySM.js"
import EditUserCart from "./components/EditUserCart.js"
import Reports from "./components/Reports.js"
import UserOrders from "./components/UserOrders.js"

const routes = [
    { path: '/', component: BasePage },
    { path: '/UserLogin', name: 'UserLogin', component: UserLogin },
    {
        path: '/UserRegistration',
        name: 'UserRegistration',
        component: UserRegistration,
    },
    {
        path: '/InActiveUsers',
        name: 'InActiveUsers',
        component: InActiveUsers,
    },
    {
        path: '/CategoryAlterations',
        name: 'CategoryAlterations',
        component: CategoryAlterations,
    },
    {
        path: '/AddNewCategory',
        name: 'AddNewCategory',
        component: AddNewCategory,
    },
    {
        path: '/AddNewProduct',
        name: 'AddNewProduct',
        component: AddNewProduct,
        props: true
    },
    {
        path: '/EditCategory',
        name: 'EditCategory',
        component: EditCategory,
        props: true
    },
    {
        path: '/EditProduct',
        name: 'EditProduct',
        component: EditProduct,
        props: true
    },
    {
        path: '/BuyProduct',
        name: 'BuyProduct',
        component: BuyProduct,
        props: true
    },
    {
        path: '/UserCart',
        name: 'UserCart',
        component: UserCart,
        props: true
    },
    {
        path: '/SearchCatalog',
        name: 'SearchCatalog',
        component: SearchCatalog,
        props: true
    },
    {
        path: '/ToAddCategorybySM',
        name: 'ToAddCategorybySM',
        component: ToAddCategorybySM,
    },
    {
        path: '/ToEditCategorybySM',
        name: 'ToEditCategorybySM',
        component: ToEditCategorybySM,
    },
    {
        path: '/ToDeleteCategorybySM',
        name: 'ToDeleteCategorybySM',
        component: ToDeleteCategorybySM,
    },
    {
        path: '/EditUserCart',
        name: 'EditUserCart',
        component: EditUserCart,
        props: true
    },
    {
        path: '/Reports',
        name: 'Reports',
        component: Reports,
    },
    {
        path: '/UserOrders',
        name: 'UserOrders',
        component: UserOrders,
        props: true
    },
]

export default new VueRouter({
    routes,
})