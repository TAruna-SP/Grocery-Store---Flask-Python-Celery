#IMPORT
from flask import Flask, jsonify, request, render_template,send_file
from flask_restful import Resource, Api, reqparse, marshal_with, marshal,fields
from flask_security import SQLAlchemyUserDatastore , Security , hash_password,auth_required, roles_required,current_user,roles_accepted
from werkzeug.security import generate_password_hash,check_password_hash
import flask_excel as excel
from celery.result import AsyncResult
from celery.schedules import crontab
from flask_caching import Cache
from tasks import product_Backlog
from tasks import daily_Reminder_To_User,monthly_Activity_Report_To_User
from worker import celery_init_app
from grocery_model import *

# ****************************************************** FLASK-INSTANTIATION *************************************************************************************************************

app = Flask(__name__)

# ******************************************************* APP CONFIGURATION *************************************************************************************************************************

app.config['SQLALCHEMY_DATABASE_URI'] ="sqlite:///groceryShop.sqlite3"
app.config['SECRET_KEY'] = "secretissecret" 
app.config['SECURITY_PASSWORD_SALT'] = "saltandsugar"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['WTF_CSRF_ENABLED'] = False
app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authentication-Token'
app.config['CACHE_TYPE'] = "RedisCache"
app.config['CACHE_REDIS_HOST'] = "localhost"
app.config['CACHE_REDIS_PORT'] = 6379
app.config['CACHE_REDIS_DB'] = 3
app.config['CACHE_DEFAULT_TIMEOUT'] = 300

# ******************************************* DB,REST API,Flask Security,Flask Excel,Celery,Cache-INSTANTIATION************************************************************************************************************************************

db.init_app(app)
api = Api(app)
excel.init_excel(app)
groceryUserDataStore = SQLAlchemyUserDatastore(db , User, Privilege)
app.security = Security(app, groceryUserDataStore)
app.app_context().push()
celeryStore = celery_init_app(app)
cacheForGrocery = Cache(app)

# *********************************************************************************************************************************************************************************************
#Request Parser
categoryParserObject = reqparse.RequestParser()
productParserObject = reqparse.RequestParser()
cartParserObject = reqparse.RequestParser()
inActiveUserListParserPbject = reqparse.RequestParser()

#************************************************* Base Page **********************************************************************************************************

@app.route("/", methods=['GET'])
def groceryAppBase():
    return render_template('index.html')
    
# ************************************************ Register Module *****************************************************************************************************************************

@app.route("/register" , methods=['post'])
def registerGroceryUser():
    newUserDetails = request.get_json()
    newUserEmail = newUserDetails.get("userEmail")
    newUserPassword = newUserDetails.get("userPassword")
    newUserName = newUserDetails.get("userName")
    newUserSelectedRole = newUserDetails.get("userSelectedRole")

    if not newUserEmail or not newUserPassword or not newUserName or not newUserSelectedRole:
        return jsonify({"message":"Please enter all the fields"}),400

    userObjExists =  groceryUserDataStore.find_user(email= newUserEmail)

    if not userObjExists:
        groceryUserDataStore.create_user(email=newUserEmail,password=generate_password_hash(newUserPassword), roles=[newUserSelectedRole], userName=newUserName)
        newUserObjCreated =  groceryUserDataStore.find_user(email= newUserEmail)
        userPrivilegeObj = User_privilege_relation.query.filter_by(userId=newUserObjCreated.userId).first()
        if(newUserSelectedRole == "storageManager"):
            userPrivilegeObj.is_active = False
    else:
        if(userObjExists.roles[0].name == "user" and newUserSelectedRole == "storageManager"):
            newUserPrivilegeObj = User_privilege_relation(userId = userObjExists.userId, accessId = 2 ,is_active = False) 
        elif(userObjExists.roles[0].name == "storageManager" and newUserSelectedRole == "user"):
            newUserPrivilegeObj = User_privilege_relation(userId = userObjExists.userId, accessId = 3 ,is_active = True) 
        db.session.add(newUserPrivilegeObj)  

    db.session.commit()
    return jsonify({"message":"Registration completed .Please login"}),200

# ******************************************** Login Module ****************************************************************************************************

@app.route("/userLogin" , methods=['post'])
def login():
    regUserDetails = request.get_json()
    regUserEmail = regUserDetails.get("userEmail")
    regUserPassword = regUserDetails.get("userPassword")
    defaultAccess = ""

    if not regUserEmail :
        return jsonify({"message":"Please Enter Email"}),400
    
    if not regUserPassword:
         return jsonify({"message":"Please Enter Password"}),400
    
    regUserObj =  groceryUserDataStore.find_user(email= regUserEmail)
    if not regUserObj:
        return jsonify({"message":"User doesn't exists.Please Register"}),400
    
    if(len(regUserObj.roles) > 1):
        defaultAccess = "user"
    else:
        defaultAccess = regUserObj.roles[0].name

    if(defaultAccess == "storageManager"):
        storageManagerPrivilegeDtlsObj = User_privilege_relation.query.filter_by(userId=regUserObj.userId, is_active = True).first()
        if(not storageManagerPrivilegeDtlsObj):
            return jsonify({"message":"Please contact Admin for Signup"}),401
        
    if(check_password_hash(regUserObj.password , regUserPassword)):
        return jsonify({"AuthenticationToken" : regUserObj.get_auth_token()},{"userRole":defaultAccess})
    else:
        return jsonify({"message":"User Password Incorrect"}),401

#********************************************SignUp Approve Module *************************************************************************************

@app.route("/approveSignUp/storageManager/<int:storageManagerId>", methods=['GET'])
@roles_required("admin")
@auth_required("token")
def approveSignUp(storageManagerId):

    regStorageManagerPrivilegeObj = User_privilege_relation.query.filter_by(userId=storageManagerId).first()
    regStorageManagerPrivilegeObj.is_active = True
    db.session.commit()
    return jsonify({"message":"SignUp Approved"})


# *********************************************** Pending Approval Users list Retrieval Module *****************************************************************************************

# Marshal Data format - pendingUserList

inActiveUserList_data_format = {
    'userId' : fields.Integer,
    'email' : fields.String,
    'userName' :fields.String,
}

@app.route("/inActiveUserList", methods=['GET'])
@marshal_with(inActiveUserList_data_format)
@roles_required("admin")
@auth_required("token")
def inActiveUserList():
    inActiveUserList=[]    
    inActiveUserListObj = User_privilege_relation.query.filter_by(is_active = False).all()
    for inActiveUserObj in inActiveUserListObj:
        inActiveUser = User.query.filter_by(userId = inActiveUserObj.userId).first()
        inActiveUserList.append(inActiveUser)
    return inActiveUserList    
 
    
# *************************************************** Storage Manager Category Modifications/Deletion Approval Module *************************************************************************************************************
# Marshal Data format - pending Category Add/Del/Modify Approvals

categoryModifications_data_format = {
    'categoryId' : fields.Integer,
    'categoryName' : fields.String,
}


@app.route("/toAddCatList", methods=['GET'])
@marshal_with(categoryModifications_data_format)
@roles_required("admin")
@auth_required("token")
def toAddCategoryApproval():
    toAddList = []
    toAddListObj = Category.query.filter_by(is_CategoryApproved = False).all() 
    for toAddObj in toAddListObj:
        toAddList.append(toAddObj)
    return toAddList    

@app.route("/toDelCatList", methods=['GET'])
@marshal_with(categoryModifications_data_format)
@roles_required("admin")
@auth_required("token")
def toDelCategoryApproval():
    toDeleteList = []
    toDelListObj = Category.query.filter_by(yes_ForDelete = True).all() 
    for toDelObj in toDelListObj:
        toDeleteList.append(toDelObj)
    return toDeleteList 

@app.route("/toModifyCatList", methods=['GET'])
@marshal_with(categoryModifications_data_format)
@roles_required("admin")
@auth_required("token")
def toModifyCategoryApproval():
    toModifyList = []
    toModifyListObj = Category.query.filter(Category.alt_NameForCategory != "default").all() 
    for toModifyObj in toModifyListObj:
        toModifyList.append(toModifyObj)
    return toModifyList 

@app.route("/getCurrentUser" , methods=['GET'])
@auth_required("token")
def getCurrentUser():
    return User.query.get(current_user.userName)

# Resources
# ******************************************************* Category Management ******************************************************************************************************************************************

# Marshal Data format - Category
categoryParserObject.add_argument('categoryName' , type=str, help='Category name is required', required=True)

categoryManagement_data_format = {
    'categoryId' : fields.Integer,
    'categoryName' : fields.String,
    'is_CategoryApproved' : fields.Boolean,
    'yes_ForDelete' : fields.Boolean,
    'alt_NameForCategory' : fields.String,
    'productList':fields.List(fields.Nested({
        'productId' : fields.Integer,
        'productName' : fields.String,
        'productRate' : fields.String,
        'productUnit' : fields.String,
        'productExpiryDate' : fields.DateTime,
        'productQuantity':fields.Integer,
    })),
}

# ******************************************************** Category - GET, POST *********************************************************************************
class CategoryManagement(Resource):

    # GET All category

    @marshal_with(categoryManagement_data_format)
    @auth_required("token")
    # @cacheForGrocery.cached(timeout=60)
    def get(self):
        allCategoriesList = Category.query.filter_by(is_CategoryApproved = True).all()
        return allCategoriesList

    #POST category

    @roles_accepted('admin','storageManager')
    @auth_required("token")
    def post(self):
        newCategoryArgs = categoryParserObject.parse_args()
        newCategoryName= newCategoryArgs['categoryName']
        newCategoryObject = Category(categoryName = newCategoryName)
        db.session.add(newCategoryObject)
                
        if(current_user.roles[0].name == "storageManager"):
            newCategoryObject.is_CategoryApproved = False

        db.session.commit()

        if(not newCategoryObject.is_CategoryApproved):
            return jsonify({"message":"Please wait for admin to approve this category"})

        return {'message' : 'New Category Added by Admin'}

#********************************************************* Approve Category ******************************************************************************************************

class ApproveCategory(Resource):
      
    @roles_required('admin')
    @auth_required("token")
    def get(self,categoryId):
        newCategoryObj = Category.query.get(categoryId)
    
        if not newCategoryObj:
            return jsonify({"message":"No category found"})

        if not newCategoryObj.is_CategoryApproved :
            newCategoryObj.is_CategoryApproved = True

        if newCategoryObj.alt_NameForCategory != "default" :
            newCategoryObj.categoryName = newCategoryObj.alt_NameForCategory
            newCategoryObj.alt_NameForCategory = "default"

        if  newCategoryObj.yes_ForDelete :
             db.session.delete(newCategoryObj)

        db.session.commit()
        return jsonify({"message":"Requested Operations on Category Approved"})

#**************************************************** PUT , Get Specific category , DELETE ****************************************************************************************************************

class CategoryManagement_Id(Resource):
    # PUT category
      
    @roles_accepted('admin','storageManager')
    @auth_required("token")
    def put(self,categoryId):
        editCategoryObj = Category.query.get(categoryId)
    
        if not editCategoryObj:
            return jsonify({"message":"No category found"})
        
        editCategoryArgs = categoryParserObject.parse_args()
        editCategoryName= editCategoryArgs['categoryName']
       
        if(current_user.roles[0].name == "storageManager"):
            editCategoryObj.alt_NameForCategory = editCategoryName
            db.session.commit()
            return jsonify({"message":"Please wait for admin to approve modifications to this category"})

        editCategoryObj.categoryName = editCategoryName
        db.session.commit()
        return jsonify({"message":"Category has been updated"})
    

    # GET Specific Category

    @marshal_with(categoryManagement_data_format)
    @auth_required("token")
    def get(self,categoryId):
       
        getCategoryObj = Category.query.get(categoryId)
        if not getCategoryObj:
            return jsonify({"message":"No category found"})
        
        if not getCategoryObj.is_CategoryApproved:
            return jsonify({"message":"This category is yet to be approved by the Admin"})
        
        return getCategoryObj
    
    #Delete category

    @roles_accepted('admin','storageManager')
    @auth_required("token")
    def delete(self,categoryId):
       
        delCategoryObj = Category.query.get(categoryId)
        if not delCategoryObj:
            return jsonify({"message":"No category found"})
        
        if(current_user.roles[0].name == "storageManager"):
            delCategoryObj.yes_ForDelete = True
            db.session.commit()
            return jsonify({"message":"Please wait for admin to approve deletion to this category"})
        
        db.session.delete(delCategoryObj)
        db.session.commit()
        return jsonify({"message":"category is removed"})
    
api.add_resource(CategoryManagement, '/category')
api.add_resource(CategoryManagement_Id, '/category/<int:categoryId>')
api.add_resource(ApproveCategory, '/approve/category/<int:categoryId>')

# **********************************************Product Management***********************************************************************************************************************************************************
# Marshal Data format - Product

productParserObject.add_argument('productName' , type=str, help='Product name is required', required=True)
productParserObject.add_argument('productExpiryDate' , type=str, help='product Expiry Date is required', required=True)
productParserObject.add_argument('productRate' , type=int, help='product rate is required', required=True)
productParserObject.add_argument('productQuantity' , type=int, help='product quantity is required', required=True)
productParserObject.add_argument('productUnit' , type=str, help='product unit is required', required=True)

productManagement_data_format = {
    'productId' : fields.Integer,
    'productName' : fields.String,
    'productExpiryDate' : fields.DateTime,
    'productRate' : fields.Integer,
    'productQuantity':fields.Integer,
    'productUnit': fields.String
}

# ************************************************** Product - GET , POST , PUT , DELETE ***********************************************************************************************
class ProductManagement(Resource):

    # GET

    @marshal_with(productManagement_data_format)
    @auth_required("token")
    def get(self,id):
        
        getProductObj = Product.query.get(id)
        if not getProductObj :
            return jsonify({"message":"No such products available"})
        return getProductObj
    
    # POST

    @roles_required('storageManager')
    @auth_required("token")
    def post(self,id):

        addToCategoryObj = Category.query.get(id)

        newProductArgs = productParserObject.parse_args()
        newProductName= newProductArgs['productName']
        newProductExpDate = datetime.strptime(newProductArgs['productExpiryDate'],"%Y-%m-%d")
        newProductRate= newProductArgs['productRate']
        newProductQty= newProductArgs['productQuantity']
        newProductUnit= newProductArgs['productUnit']
        newProductObj = Product(productName = newProductName, productExpiryDate = newProductExpDate, productRate = newProductRate, productUnit=newProductUnit,productQuantity = newProductQty , categoryId = id)
        
        db.session.add(newProductObj)
        db.session.commit()

        addToCategoryObj.productList.append(newProductObj)
        return jsonify({'message' : 'New Product Added'})    

    # PUT

    @roles_required('storageManager')
    @auth_required("token")
    def put(self,id):
        editProductObj = Product.query.get(id)

        editProductArgs = productParserObject.parse_args()
        editProductName= editProductArgs['productName']
        editProductExpDate = datetime.strptime(editProductArgs['productExpiryDate'],"%Y-%m-%d")
        editProductRate= editProductArgs['productRate']
        editProductUnit= editProductArgs['productUnit']
        editProductQty= editProductArgs['productQuantity']

        editProductObj.productName = editProductName
        editProductObj.productExpiryDate = editProductExpDate
        editProductObj.productRate = editProductRate
        editProductObj.productUnit = editProductUnit
        editProductObj.productQuantity = editProductQty
       
        db.session.commit()
        return jsonify({'message' : 'Product Changes Applied'})
    
    # DELETE

    @roles_required('storageManager')
    @auth_required("token")
    def delete(self,id):
       
        delProductObj = Product.query.get(id)
        if not delProductObj:
            return jsonify({"message":"No product found"})
        db.session.delete(delProductObj)
        db.session.commit()
        return jsonify({"message":"product is removed"})

api.add_resource(ProductManagement, '/product/<int:id>')

# ********************************************************** Cart Management ********************************************************************************* 
# Marshal Data format - Cart

cartParserObject.add_argument('productQuantity' , type=int, help='purchase quantity is required', required=True)

cartManagement_data_format = {
    'purchaseId' :fields.Integer,
    'purchaseCategory' : fields.String,
    'purchaseProduct' : fields.String,
    'purchaseQuantity' : fields.Integer,
    'productUnitPrice' : fields.Integer,
    'productTotalPrice':fields.Integer,
    'productUnit': fields.String,
}

# ************************************************************ GET , POST **********************************************************************************

#GET
class cartManagement_User(Resource):
    
    @marshal_with(cartManagement_data_format)
    @auth_required("token")
    def get(self):

        userShoppingCart =  User.query.get(current_user.userId).productsPurchased

        if not userShoppingCart :
            return jsonify({"message":"No Products in Cart"})
        return userShoppingCart
       
#POST
class cartManagement(Resource):

    # @marshal_with(cartManagement_data_format)
    @auth_required("token")
    def post(self, productId):

        buyProductObj = Product.query.get(productId)
        productTotalPrice = 0

        buyProductArgs = cartParserObject.parse_args()
        buyProductQty= buyProductArgs['productQuantity']

        if(buyProductQty < 1):
            return ({"message":"Please Enter Valid Quantity"}),400
        
        if(buyProductQty > buyProductObj.productQuantity):
            return ({"message":"Insufficient Stocks Available"}),400

        productTotalPrice = buyProductObj.productRate * int(buyProductQty)
        buyProductDoneObj = UserCart (purchaseCategory = buyProductObj.getCategory.categoryName , 
                                        purchaseProductId = buyProductObj.productId,
                                        purchaseProduct = buyProductObj.productName,
                                        purchaseQuantity = buyProductQty , 
                                        productUnitPrice = buyProductObj.productRate , 
                                        productUnit = buyProductObj.productUnit,
                                        productTotalPrice = productTotalPrice ,
                                        purchaseUserId = current_user.userId )
        db.session.add(buyProductDoneObj)
        buyProductObj.productQuantity -= int(buyProductQty)
        db.session.commit()
        return jsonify({"message":"Product Added to Cart"})
     

# ************************************************************ PUT , DELETE **********************************************************************************

#PUT
class cartManagement_Purchase(Resource):

    @auth_required("token")
    def put(self, purchaseId):

        reviewProductInCartObj = UserCart.query.get(purchaseId)
        originalProductDetailsObj = Product.query.get(reviewProductInCartObj.purchaseProductId)
        reviewProductTotalPrice = 0

        editProductInCartArgs = cartParserObject.parse_args()
        editProductInCartQty= editProductInCartArgs['productQuantity']

        if(editProductInCartQty < 1):
            return ({"message":"Please Enter Valid Quantity"}),400
        
        originalProductDetailsObj.productQuantity += int(reviewProductInCartObj.purchaseQuantity)
        db.session.commit()

        if(editProductInCartQty > originalProductDetailsObj.productQuantity ):
            return ({"message":"Insufficient Stocks Available"}),400
        
        reviewProductInCartObj.purchaseQuantity = editProductInCartQty
        reviewProductTotalPrice = originalProductDetailsObj.productRate * int(editProductInCartQty)
        reviewProductInCartObj.productTotalPrice = reviewProductTotalPrice
       
        originalProductDetailsObj.productQuantity -= int(editProductInCartQty)
        db.session.commit()
        return jsonify({"message":"Product Modified To Cart"})
      
#Delete

    @auth_required("token")
    def delete(self, purchaseId):
        
        delCartObj = UserCart.query.get(purchaseId)

        if not delCartObj :
            return jsonify({"message":"The product is not Found in the Cart"})
        
        db.session.delete(delCartObj)
        originalProductDetailsObj = Product.query.get(delCartObj.purchaseProductId)
        originalProductDetailsObj.productQuantity += int(delCartObj.purchaseQuantity)

        db.session.commit()
        return jsonify({"message":"Product is Removed From the Cart"})

# ********************************************************** User Order Management ********************************************************************************* 
# Marshal Data format -User Order

orderManagement_data_format = {
    'orderId' :fields.Integer,
    'orderInvoiceId' : fields.Integer,
    'orderCategory' : fields.String,
    'orderProduct' : fields.String,
    'orderQuantity' : fields.Integer,
    'orderTotalPrice':fields.Integer,
}
 
# ************************************************************ GET , POST **********************************************************************************

#GET
class userOrderManagement(Resource):
    
    @marshal_with(orderManagement_data_format)
    @auth_required("token")
    def get(self):

        userOrders=  User.query.get(current_user.userId).ordersByUser

        if not userOrders :
            return jsonify({"message":"No Orders found for the User"})
        return userOrders
       
#POST
    @auth_required("token")
    def post(self):

        userCartObjList = User.query.get(current_user.userId).productsPurchased
        orderInvoiceMax = db.session.query(func.max(UserOrder.orderInvoiceId)).scalar()

        if orderInvoiceMax is not None:
            orderInvoiceMax += 1
        else:
            orderInvoiceMax = 1    

        for userCartObj in userCartObjList:
            userOrderObj = UserOrder (orderInvoiceId = orderInvoiceMax ,
                                      orderCategory = userCartObj.purchaseCategory , 
                                        orderProductId = userCartObj.purchaseProductId,
                                        orderProduct = userCartObj.purchaseProduct,
                                        orderQuantity = userCartObj.purchaseQuantity , 
                                        orderTotalPrice = userCartObj.productTotalPrice , 
                                        orderByUserId = current_user.userId )

            db.session.add(userOrderObj)
            db.session.delete(userCartObj)
        db.session.commit()
        return jsonify({"message":"Your Order is Created"})
      
api.add_resource(userOrderManagement, '/Orders')      

#****************************************************************** Search Module ***************************************************************************************  

class cartManagement_Search(Resource):

    @marshal_with(categoryManagement_data_format) 
    @auth_required("token")
    def get(self,searchWord):
        searchCategoryResults = Category.query.filter(Category.categoryName.ilike(f'%{searchWord}%')).all()
               
        if not searchCategoryResults:
            return jsonify({"message":"No results found"})

        return searchCategoryResults

api.add_resource(cartManagement, '/addProductToCart/<int:productId>')
api.add_resource(cartManagement_User, '/viewProductCart')
api.add_resource(cartManagement_Purchase, '/reviewProductCart/<int:purchaseId>')
api.add_resource(cartManagement_Search, '/searchProducts/<string:searchWord>')

# ********************************************************User Triggered Async Job/Export Reports ************************************************************************************************

# Export the Product backlog Data
@app.get('/download-productBacklog-data/<backlogJobId>')
def exportCSVProductBacklogData(backlogJobId):
    prod_Backlog_Report = AsyncResult(backlogJobId)
    if prod_Backlog_Report.ready():
        filename = prod_Backlog_Report.result
        return send_file(filename, as_attachment=True)
    else:
        return jsonify({"message":"Job In Progress"}),404

# trigger the job
@app.get('/trigger_prodBacklog_job')
def trigger_prodBacklog_job():
  
    prodBacklogJob = product_Backlog.delay()
    return jsonify({"prodBacklog_JobId": prodBacklogJob.id})

# *************************************************************DailyJob/Monthly Report Jobs/Send Email ************************************************************************************************************************************

@celeryStore.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=20, minute=15),
        daily_Reminder_To_User.s(),
    ),
    sender.add_periodic_task(
        crontab(hour=20, minute=15, day_of_month='1'),
        monthly_Activity_Report_To_User.s(),
    ),

# **************************************************************** RUN ************************************************************************************

if(__name__) == "__main__" :
    app.run(debug=True)