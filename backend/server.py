from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("SECRET_KEY", "rihla-enterprise-secret-key-2024")
ALGORITHM = "HS256"
security = HTTPBearer()

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Brand(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    name_ar: str
    color: str
    description: str

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str
    customer_name: str
    customer_email: EmailStr
    brand_id: str
    brand_name: str
    items_count: int
    total: float
    status: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    brand_id: str
    items_count: int
    total: float
    status: str = "pending"

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sku: str
    name: str
    brand_id: str
    brand_name: str
    category: str
    stock: int
    price: float
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    sku: str
    name: str
    brand_id: str
    category: str
    stock: int
    price: float
    image_url: Optional[str] = None

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    total_orders: int = 0
    lifetime_value: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class Employee(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    position: str
    department: str
    brand_id: str
    brand_name: str
    salary: float
    bonus: float = 0.0
    target: float = 0.0
    achieved: float = 0.0
    status: str = "active"
    hire_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EmployeeCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    position: str
    department: str
    brand_id: str
    salary: float
    bonus: float = 0.0
    target: float = 0.0
    status: str = "active"

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    salary: Optional[float] = None
    bonus: Optional[float] = None
    target: Optional[float] = None
    achieved: Optional[float] = None
    status: Optional[str] = None

class DashboardMetrics(BaseModel):
    total_revenue: float
    total_orders: int
    total_customers: int
    total_products: int
    revenue_change: float
    orders_change: float

class RevenueTrend(BaseModel):
    date: str
    revenue: float
    brand_id: Optional[str] = None

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(email=user_data.email, full_name=user_data.full_name)
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    user_dict['password_hash'] = pwd_context.hash(user_data.password)
    
    await db.users.insert_one(user_dict)
    
    token = create_access_token({"sub": user.email, "id": user.id})
    return Token(access_token=token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc or not pwd_context.verify(credentials.password, user_doc['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**user_doc)
    token = create_access_token({"sub": user.email, "id": user.id})
    return Token(access_token=token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_current_user(payload: dict = Depends(verify_token)):
    user_doc = await db.users.find_one({"email": payload["sub"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    return User(**user_doc)

@api_router.get("/brands", response_model=List[Brand])
async def get_brands():
    brands = [
        {"id": "abaya", "name": "Rihla Abaya", "name_ar": "رحلة عباية", "color": "hsl(280, 45%, 58%)", "description": "Elegant modest fashion"},
        {"id": "atelier", "name": "Rihla Atelier", "name_ar": "رحلة أتيليه", "color": "hsl(45, 85%, 58%)", "description": "Luxury jewelry & fashion"},
        {"id": "technologies", "name": "Rihla Technologies", "name_ar": "رحلة التقنيات", "color": "hsl(210, 75%, 55%)", "description": "Digital services & solutions"},
        {"id": "brand-journey", "name": "Rihla Brand Journey", "name_ar": "رحلة العلامة التجارية", "color": "hsl(160, 60%, 48%)", "description": "Consulting & branding"}
    ]
    return brands

@api_router.get("/dashboard/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(brand_id: Optional[str] = None, _: dict = Depends(verify_token)):
    filter_query = {"brand_id": brand_id} if brand_id else {}
    
    orders = await db.orders.find(filter_query, {"_id": 0}).to_list(10000)
    total_revenue = sum(o.get('total', 0) for o in orders)
    total_orders = len(orders)
    
    customers = await db.customers.find({}, {"_id": 0}).to_list(10000)
    total_customers = len(customers)
    
    products_query = {"brand_id": brand_id} if brand_id else {}
    total_products = await db.products.count_documents(products_query)
    
    return DashboardMetrics(
        total_revenue=total_revenue,
        total_orders=total_orders,
        total_customers=total_customers,
        total_products=total_products,
        revenue_change=12.5,
        orders_change=8.3
    )

@api_router.get("/dashboard/revenue-trend", response_model=List[RevenueTrend])
async def get_revenue_trend(brand_id: Optional[str] = None, _: dict = Depends(verify_token)):
    from datetime import timedelta
    trends = []
    for i in range(30, 0, -1):
        date = (datetime.now(timezone.utc) - timedelta(days=i)).strftime("%Y-%m-%d")
        revenue = 5000 + (i * 100) + (i % 7 * 500)
        trends.append({"date": date, "revenue": revenue, "brand_id": brand_id})
    return trends

@api_router.get("/orders", response_model=List[Order])
async def get_orders(brand_id: Optional[str] = None, status: Optional[str] = None, _: dict = Depends(verify_token)):
    filter_query = {}
    if brand_id:
        filter_query["brand_id"] = brand_id
    if status:
        filter_query["status"] = status
    
    orders = await db.orders.find(filter_query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for order in orders:
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    return orders

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, _: dict = Depends(verify_token)):
    brand = await db.brands.find_one({"id": order_data.brand_id}, {"_id": 0})
    brand_name = brand["name"] if brand else "Unknown"
    
    order_number = f"ORD-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    order = Order(
        order_number=order_number,
        customer_name=order_data.customer_name,
        customer_email=order_data.customer_email,
        brand_id=order_data.brand_id,
        brand_name=brand_name,
        items_count=order_data.items_count,
        total=order_data.total,
        status=order_data.status
    )
    
    order_dict = order.model_dump()
    order_dict['created_at'] = order_dict['created_at'].isoformat()
    await db.orders.insert_one(order_dict)
    
    customer = await db.customers.find_one({"email": order_data.customer_email}, {"_id": 0})
    if customer:
        await db.customers.update_one(
            {"email": order_data.customer_email},
            {"$inc": {"total_orders": 1, "lifetime_value": order_data.total}}
        )
    else:
        new_customer = Customer(
            name=order_data.customer_name,
            email=order_data.customer_email,
            total_orders=1,
            lifetime_value=order_data.total
        )
        customer_dict = new_customer.model_dump()
        customer_dict['created_at'] = customer_dict['created_at'].isoformat()
        await db.customers.insert_one(customer_dict)
    
    return order

@api_router.put("/orders/{order_id}", response_model=Order)
async def update_order(order_id: str, status: str, _: dict = Depends(verify_token)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    order['status'] = status
    
    if isinstance(order['created_at'], str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return Order(**order)

@api_router.get("/products", response_model=List[Product])
async def get_products(brand_id: Optional[str] = None, _: dict = Depends(verify_token)):
    filter_query = {"brand_id": brand_id} if brand_id else {}
    products = await db.products.find(filter_query, {"_id": 0}).to_list(1000)
    for product in products:
        if isinstance(product['created_at'], str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    return products

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate, _: dict = Depends(verify_token)):
    brand = await db.brands.find_one({"id": product_data.brand_id}, {"_id": 0})
    if not brand:
        brands = await get_brands()
        brand = next((b for b in brands if b['id'] == product_data.brand_id), None)
    
    brand_name = brand['name'] if brand and isinstance(brand, dict) else (brand.name if brand else "Unknown")
    
    product = Product(
        sku=product_data.sku,
        name=product_data.name,
        brand_id=product_data.brand_id,
        brand_name=brand_name,
        category=product_data.category,
        stock=product_data.stock,
        price=product_data.price,
        image_url=product_data.image_url
    )
    
    product_dict = product.model_dump()
    product_dict['created_at'] = product_dict['created_at'].isoformat()
    await db.products.insert_one(product_dict)
    
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, stock: int, _: dict = Depends(verify_token)):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.products.update_one({"id": product_id}, {"$set": {"stock": stock}})
    product['stock'] = stock
    
    if isinstance(product['created_at'], str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return Product(**product)

@api_router.get("/customers", response_model=List[Customer])
async def get_customers(_: dict = Depends(verify_token)):
    customers = await db.customers.find({}, {"_id": 0}).sort("lifetime_value", -1).to_list(1000)
    for customer in customers:
        if isinstance(customer['created_at'], str):
            customer['created_at'] = datetime.fromisoformat(customer['created_at'])
    return customers

@api_router.get("/employees", response_model=List[Employee])
async def get_employees(brand_id: Optional[str] = None, department: Optional[str] = None, status: Optional[str] = None, _: dict = Depends(verify_token)):
    filter_query = {}
    if brand_id:
        filter_query["brand_id"] = brand_id
    if department:
        filter_query["department"] = department
    if status:
        filter_query["status"] = status
    
    employees = await db.employees.find(filter_query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for employee in employees:
        if isinstance(employee['created_at'], str):
            employee['created_at'] = datetime.fromisoformat(employee['created_at'])
        if isinstance(employee.get('hire_date'), str):
            employee['hire_date'] = datetime.fromisoformat(employee['hire_date'])
    return employees

@api_router.post("/employees", response_model=Employee)
async def create_employee(employee_data: EmployeeCreate, _: dict = Depends(verify_token)):
    brands = await get_brands()
    brand = next((b for b in brands if b['id'] == employee_data.brand_id), None)
    brand_name = brand['name'] if brand else "Unknown"
    
    employee = Employee(
        name=employee_data.name,
        email=employee_data.email,
        phone=employee_data.phone,
        position=employee_data.position,
        department=employee_data.department,
        brand_id=employee_data.brand_id,
        brand_name=brand_name,
        salary=employee_data.salary,
        bonus=employee_data.bonus,
        target=employee_data.target,
        status=employee_data.status
    )
    
    employee_dict = employee.model_dump()
    employee_dict['created_at'] = employee_dict['created_at'].isoformat()
    employee_dict['hire_date'] = employee_dict['hire_date'].isoformat()
    await db.employees.insert_one(employee_dict)
    
    return employee

@api_router.put("/employees/{employee_id}", response_model=Employee)
async def update_employee(employee_id: str, employee_update: EmployeeUpdate, _: dict = Depends(verify_token)):
    employee = await db.employees.find_one({"id": employee_id}, {"_id": 0})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    update_data = {k: v for k, v in employee_update.model_dump().items() if v is not None}
    
    if update_data:
        await db.employees.update_one({"id": employee_id}, {"$set": update_data})
        employee.update(update_data)
    
    if isinstance(employee['created_at'], str):
        employee['created_at'] = datetime.fromisoformat(employee['created_at'])
    if isinstance(employee.get('hire_date'), str):
        employee['hire_date'] = datetime.fromisoformat(employee['hire_date'])
    
    return Employee(**employee)

@api_router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: str, _: dict = Depends(verify_token)):
    result = await db.employees.delete_one({"id": employee_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deleted successfully"}

@api_router.get("/employees/stats")
async def get_employee_stats(brand_id: Optional[str] = None, _: dict = Depends(verify_token)):
    filter_query = {"brand_id": brand_id} if brand_id else {}
    
    employees = await db.employees.find(filter_query, {"_id": 0}).to_list(10000)
    
    total_employees = len(employees)
    active_employees = len([e for e in employees if e.get('status') == 'active'])
    total_salary = sum(e.get('salary', 0) for e in employees if e.get('status') == 'active')
    total_bonus = sum(e.get('bonus', 0) for e in employees)
    avg_achievement = sum(e.get('achieved', 0) / e.get('target', 1) * 100 for e in employees if e.get('target', 0) > 0) / max(len([e for e in employees if e.get('target', 0) > 0]), 1)
    
    return {
        "total_employees": total_employees,
        "active_employees": active_employees,
        "total_salary": total_salary,
        "total_bonus": total_bonus,
        "avg_achievement_rate": round(avg_achievement, 2)
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()