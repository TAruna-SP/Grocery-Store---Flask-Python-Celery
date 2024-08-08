from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_,func,extract
from flask_security import UserMixin , RoleMixin
from datetime import datetime

db = SQLAlchemy()

class User(db.Model, UserMixin):
    userId =  db.Column(db.Integer() ,primary_key = True)
    userName = db.Column(db.String(30) ,nullable = False)
    email = db.Column(db.String(70) ,nullable = False)
    password = db.Column(db.String(255) ,nullable = False)
    active =  db.Column(db.Boolean() , default = True)
    fs_uniquifier = db.Column(db.String(255) ,unique = True, nullable = False) 
    roles = db.relationship("Privilege" , backref= "getUsersByPrivilege" ,secondary="user_privilege_relation")
    productsPurchased = db.relationship("UserCart", backref="purchasedByUser")
    ordersByUser = db.relationship("UserOrder", backref="orderedByUser")

class UserCart(db.Model):
    purchaseId = db.Column(db.Integer() ,primary_key = True)
    purchaseCategory = db.Column(db.String(30) ,nullable = False)
    purchaseProductId = db.Column(db.Integer ,nullable = False)
    purchaseProduct = db.Column(db.String(30) ,nullable = False)
    purchaseQuantity =  db.Column(db.Integer() , nullable =False)
    productUnitPrice =  db.Column(db.Integer() , nullable =False)
    productUnit = db.Column(db.String(30) ,nullable = False)
    productTotalPrice = db.Column(db.Integer())
    purchaseUserId = db.Column(db.Integer(), db.ForeignKey("user.userId" ))

class UserOrder(db.Model):
    orderId = db.Column(db.Integer() ,primary_key = True)
    orderInvoiceId = db.Column(db.Integer())
    orderCategory = db.Column(db.String(30) ,nullable = False)
    orderProductId = db.Column(db.Integer ,nullable = False)
    orderProduct = db.Column(db.String(30) ,nullable = False)
    orderQuantity =  db.Column(db.Integer() , nullable =False)
    orderTotalPrice = db.Column(db.Integer())
    orderDate = db.Column(db.DateTime, default=datetime.utcnow)
    orderByUserId = db.Column(db.Integer(), db.ForeignKey("user.userId" ))    

class Privilege(db.Model, RoleMixin):
    accessId = db.Column(db.Integer() ,primary_key = True)
    name =  db.Column(db.String(30) ,unique=True)
     
class User_privilege_relation(db.Model):
    userId =  db.Column(db.Integer() ,db.ForeignKey("user.userId"),primary_key = True)
    accessId = db.Column(db.Integer() ,db.ForeignKey("privilege.accessId"),primary_key = True)
    is_active =  db.Column(db.Boolean(), default = True)
   
class Category(db.Model):
    categoryId =  db.Column(db.Integer() ,primary_key = True)
    categoryName = db.Column(db.String(30) ,nullable = False)
    is_CategoryApproved =  db.Column(db.Boolean() , default = True)
    yes_ForDelete = db.Column(db.Boolean() , default = False)
    alt_NameForCategory = db.Column(db.String(30), default = "default")
    productList = db.relationship("Product", backref="getCategory")
    
class Product(db.Model):
    productId =  db.Column(db.Integer() ,primary_key = True)
    productName = db.Column(db.String(30) ,nullable = False)
    productManufactureDate =  db.Column(db.DateTime, default=datetime.now)  
    productExpiryDate =  db.Column(db.DateTime)  
    productRate = db.Column(db.Integer() , nullable =False)
    productUnit = db.Column(db.String(30) ,nullable = False)
    productQuantity = db.Column(db.Integer() , nullable =False)
    categoryId = db.Column(db.Integer(), db.ForeignKey("category.categoryId" ))
    