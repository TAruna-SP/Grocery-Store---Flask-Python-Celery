from celery import shared_task
from flask import render_template
import flask_excel as excel
from grocery_model import *
from mail_user import *

@shared_task(ignore_result=False)
def product_Backlog():
    prodBacklogObj = Product.query.with_entities(Product.productId, Product.productName,Product.productExpiryDate,Product.productRate,Product.productQuantity).all()

    product_Backlog_CSV = excel.make_response_from_query_sets(prodBacklogObj,["productId","productName","productExpiryDate","productRate","productQuantity"],"csv")
    product_Backlog_Filename = "product_Backlog.csv"

    with open(product_Backlog_Filename, 'wb') as f:
        f.write(product_Backlog_CSV.data)

    return product_Backlog_Filename    

@shared_task(ignore_result=True)
def daily_Reminder_To_User():
   
    customerList = User.query.all()
    for customer in customerList:
        if(not customer.ordersByUser and customer.roles[0] != 'admin'):
            trigger_reminder_email(customer.email, "Knock-Knock", "We hold a big surprise for you. Please visit our Store")
    return "ok"

@shared_task(ignore_result=True)
def monthly_Activity_Report_To_User():
   
    reportForMonth = datetime.now().month
    ordersForGivenMonth = list()
    userList = User.query.all()
    for user in userList:
        if not user.roles[0] == 'admin':
            orderList = user.ordersByUser
            if orderList:
                username = user.userName
                for userOrder in orderList:
                    orderDateString = userOrder.orderDate.strftime('%m')
                    if(reportForMonth == int(orderDateString)):
                        ordersForGivenMonth.append(userOrder)
                     
                userMonthlyReport = render_template("monthlyReport.html" , ordersForGivenMonth = ordersForGivenMonth ,username =username )
                trigger_reminder_email(user.email, "Monthly Activity Report", userMonthlyReport)

   