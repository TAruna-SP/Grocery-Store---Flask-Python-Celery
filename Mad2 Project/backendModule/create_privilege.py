from app import *
from grocery_model import *
from werkzeug.security import generate_password_hash


with app.app_context():
    db.create_all()

    groceryUserDataStore.find_or_create_role(name="admin")
    groceryUserDataStore.find_or_create_role(name="storageManager")
    groceryUserDataStore.find_or_create_role(name="user")
    db.session.commit()

    if not groceryUserDataStore.find_user(email="admin@grocerystore.com"):
        groceryUserDataStore.create_user(email="admin@grocerystore.com",password=generate_password_hash("admin"), roles=["admin"],active = True,userName="admin")
    
    adminPrivilegeObj = User_privilege_relation.query.filter_by(accessId = 1).first()
    adminPrivilegeObj.is_active = True
    db.session.commit()
