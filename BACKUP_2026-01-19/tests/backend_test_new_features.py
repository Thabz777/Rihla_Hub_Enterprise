import requests
import sys
from datetime import datetime
import json

class RihlaNewFeaturesTester:
    def __init__(self, base_url="https://ecomm-command.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_product_ids = []
        self.created_order_id = None
        self.customer_id = None

    def log_result(self, test_name, passed, status_code=None, message=""):
        """Log test result"""
        result = {
            "test": test_name,
            "passed": passed,
            "status_code": status_code,
            "message": message
        }
        self.test_results.append(result)
        self.tests_run += 1
        if passed:
            self.tests_passed += 1

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}
        if self.token and 'Authorization' not in headers:
            headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                print(f"✅ Passed - Status: {response.status_code}")
                self.log_result(name, True, response.status_code, "Success")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:300]}")
                self.log_result(name, False, response.status_code, f"Expected {expected_status}, got {response.status_code}")

            return success, response.json() if response.text else {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            self.log_result(name, False, None, "Request timeout")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.log_result(name, False, None, str(e))
            return False, {}

    def test_login(self, email, password):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token received: {self.token[:20]}...")
            return True
        return False

    def test_create_products_for_order(self):
        """Create test products for order testing"""
        print("\n📦 Creating test products for order testing...")
        
        products = [
            {
                "sku": f"TEST-PROD-1-{datetime.now().strftime('%H%M%S')}",
                "name": "Test Product 1",
                "brand_id": "abaya",
                "category": "Clothing",
                "stock": 100,
                "price": 299.99
            },
            {
                "sku": f"TEST-PROD-2-{datetime.now().strftime('%H%M%S')}",
                "name": "Test Product 2",
                "brand_id": "abaya",
                "category": "Accessories",
                "stock": 50,
                "price": 149.99
            },
            {
                "sku": f"TEST-PROD-3-{datetime.now().strftime('%H%M%S')}",
                "name": "Test Product 3",
                "brand_id": "abaya",
                "category": "Jewelry",
                "stock": 75,
                "price": 499.99
            }
        ]
        
        for product in products:
            success, response = self.run_test(
                f"Create Product: {product['name']}",
                "POST",
                "products",
                200,
                data=product
            )
            if success and 'id' in response:
                self.created_product_ids.append(response['id'])
                print(f"   Product ID: {response['id']}, Stock: {response['stock']}")
        
        return len(self.created_product_ids) == 3

    def test_multiple_products_order_with_vat(self):
        """Test creating order with multiple products and VAT enabled"""
        if len(self.created_product_ids) < 3:
            print("⚠️  Skipping - Not enough products created")
            self.log_result("Multiple Products Order with VAT", False, None, "Not enough products")
            return False
        
        order_data = {
            "customer_name": "Test Customer Multi",
            "customer_email": "multicustomer@test.com",
            "customer_phone": "+966501234567",
            "customer_address": "123 Test Street, Riyadh",
            "brand_id": "abaya",
            "items": [
                {"product_id": self.created_product_ids[0], "quantity": 2},
                {"product_id": self.created_product_ids[1], "quantity": 3},
                {"product_id": self.created_product_ids[2], "quantity": 1}
            ],
            "currency": "SAR",
            "apply_vat": True,
            "shipping_charges": 50.0,
            "payment_method": "UPI",
            "status": "pending"
        }
        
        success, response = self.run_test(
            "Create Order: Multiple Products with VAT",
            "POST",
            "orders",
            200,
            data=order_data
        )
        
        if success and 'id' in response:
            self.created_order_id = response['id']
            print(f"   Order ID: {response['id']}")
            print(f"   Items count: {len(response.get('items', []))}")
            print(f"   Subtotal: {response.get('subtotal', 0)}")
            print(f"   VAT Rate: {response.get('vat_rate', 0) * 100}%")
            print(f"   VAT Amount: {response.get('vat_amount', 0)}")
            print(f"   Shipping: {response.get('shipping_charges', 0)}")
            print(f"   Total: {response.get('total', 0)}")
            print(f"   Payment Method: {response.get('payment_method', 'N/A')}")
            
            # Verify calculations
            expected_subtotal = (299.99 * 2) + (149.99 * 3) + (499.99 * 1)
            expected_vat = expected_subtotal * 0.15
            expected_total = expected_subtotal + expected_vat + 50.0
            
            actual_subtotal = response.get('subtotal', 0)
            actual_vat = response.get('vat_amount', 0)
            actual_total = response.get('total', 0)
            
            if abs(actual_subtotal - expected_subtotal) < 0.01:
                print(f"   ✅ Subtotal calculation correct")
            else:
                print(f"   ❌ Subtotal mismatch: Expected {expected_subtotal}, Got {actual_subtotal}")
            
            if abs(actual_vat - expected_vat) < 0.01:
                print(f"   ✅ VAT calculation correct (15% for SAR)")
            else:
                print(f"   ❌ VAT mismatch: Expected {expected_vat}, Got {actual_vat}")
            
            if abs(actual_total - expected_total) < 0.01:
                print(f"   ✅ Total calculation correct")
            else:
                print(f"   ❌ Total mismatch: Expected {expected_total}, Got {actual_total}")
            
            return True
        return False

    def test_order_without_vat(self):
        """Test creating order with VAT disabled"""
        if len(self.created_product_ids) < 2:
            print("⚠️  Skipping - Not enough products created")
            self.log_result("Order without VAT", False, None, "Not enough products")
            return False
        
        order_data = {
            "customer_name": "Test Customer No VAT",
            "customer_email": "novat@test.com",
            "customer_phone": "+966501234568",
            "brand_id": "abaya",
            "items": [
                {"product_id": self.created_product_ids[0], "quantity": 1},
                {"product_id": self.created_product_ids[1], "quantity": 2}
            ],
            "currency": "SAR",
            "apply_vat": False,
            "shipping_charges": 25.0,
            "payment_method": "Cash on delivery",
            "status": "pending"
        }
        
        success, response = self.run_test(
            "Create Order: Without VAT",
            "POST",
            "orders",
            200,
            data=order_data
        )
        
        if success and 'id' in response:
            print(f"   VAT Applied: {response.get('apply_vat', True)}")
            print(f"   VAT Amount: {response.get('vat_amount', 0)}")
            print(f"   Subtotal: {response.get('subtotal', 0)}")
            print(f"   Total: {response.get('total', 0)}")
            
            if response.get('vat_amount', 0) == 0 and not response.get('apply_vat', True):
                print(f"   ✅ VAT correctly set to 0 when disabled")
                return True
            else:
                print(f"   ❌ VAT should be 0 when apply_vat is False")
                return False
        return False

    def test_order_with_inr_vat(self):
        """Test creating order with INR currency (18% VAT)"""
        if len(self.created_product_ids) < 1:
            print("⚠️  Skipping - Not enough products created")
            self.log_result("Order with INR VAT", False, None, "Not enough products")
            return False
        
        order_data = {
            "customer_name": "Test Customer INR",
            "customer_email": "inr@test.com",
            "customer_phone": "+919876543210",
            "brand_id": "abaya",
            "items": [
                {"product_id": self.created_product_ids[0], "quantity": 1}
            ],
            "currency": "INR",
            "apply_vat": True,
            "shipping_charges": 100.0,
            "payment_method": "Bank transfer",
            "status": "pending"
        }
        
        success, response = self.run_test(
            "Create Order: INR with 18% VAT",
            "POST",
            "orders",
            200,
            data=order_data
        )
        
        if success and 'id' in response:
            vat_rate = response.get('vat_rate', 0)
            print(f"   Currency: {response.get('currency', 'N/A')}")
            print(f"   VAT Rate: {vat_rate * 100}%")
            print(f"   VAT Amount: {response.get('vat_amount', 0)}")
            
            if abs(vat_rate - 0.18) < 0.001:
                print(f"   ✅ VAT rate correctly set to 18% for INR")
                return True
            else:
                print(f"   ❌ VAT rate should be 18% for INR, got {vat_rate * 100}%")
                return False
        return False

    def test_payment_methods(self):
        """Test all payment methods"""
        payment_methods = ["UPI", "Cash on delivery", "Bank transfer"]
        
        for method in payment_methods:
            if len(self.created_product_ids) < 1:
                print(f"⚠️  Skipping {method} - No products available")
                continue
            
            order_data = {
                "customer_name": f"Test Customer {method}",
                "customer_email": f"{method.replace(' ', '_').lower()}@test.com",
                "brand_id": "abaya",
                "items": [
                    {"product_id": self.created_product_ids[0], "quantity": 1}
                ],
                "currency": "SAR",
                "apply_vat": True,
                "shipping_charges": 0,
                "payment_method": method,
                "status": "pending"
            }
            
            success, response = self.run_test(
                f"Payment Method: {method}",
                "POST",
                "orders",
                200,
                data=order_data
            )
            
            if success and response.get('payment_method') == method:
                print(f"   ✅ Payment method '{method}' saved correctly")
            else:
                print(f"   ❌ Payment method mismatch")

    def test_stock_deduction(self):
        """Test that stock is deducted when order is created"""
        if len(self.created_product_ids) < 1:
            print("⚠️  Skipping - No products available")
            self.log_result("Stock Deduction", False, None, "No products available")
            return False
        
        # Get initial stock
        success, products = self.run_test(
            "Get Products Before Order",
            "GET",
            f"products?brand_id=abaya",
            200
        )
        
        if not success:
            return False
        
        product = next((p for p in products if p['id'] == self.created_product_ids[0]), None)
        if not product:
            print("⚠️  Product not found")
            return False
        
        initial_stock = product['stock']
        print(f"   Initial stock: {initial_stock}")
        
        # Create order
        order_data = {
            "customer_name": "Stock Test Customer",
            "customer_email": "stocktest@test.com",
            "brand_id": "abaya",
            "items": [
                {"product_id": self.created_product_ids[0], "quantity": 5}
            ],
            "currency": "SAR",
            "apply_vat": True,
            "shipping_charges": 0,
            "payment_method": "Cash on delivery",
            "status": "pending"
        }
        
        success, order_response = self.run_test(
            "Create Order for Stock Test",
            "POST",
            "orders",
            200,
            data=order_data
        )
        
        if not success:
            return False
        
        # Get updated stock
        success, products_after = self.run_test(
            "Get Products After Order",
            "GET",
            f"products?brand_id=abaya",
            200
        )
        
        if not success:
            return False
        
        product_after = next((p for p in products_after if p['id'] == self.created_product_ids[0]), None)
        if not product_after:
            print("⚠️  Product not found after order")
            return False
        
        final_stock = product_after['stock']
        print(f"   Final stock: {final_stock}")
        print(f"   Stock deducted: {initial_stock - final_stock}")
        
        if final_stock == initial_stock - 5:
            print(f"   ✅ Stock correctly deducted by 5")
            self.log_result("Stock Deduction", True, 200, "Stock deducted correctly")
            return True
        else:
            print(f"   ❌ Stock deduction incorrect. Expected {initial_stock - 5}, got {final_stock}")
            self.log_result("Stock Deduction", False, 200, f"Expected {initial_stock - 5}, got {final_stock}")
            return False

    def test_category_update(self):
        """Test updating product category"""
        if len(self.created_product_ids) < 1:
            print("⚠️  Skipping - No products available")
            self.log_result("Category Update", False, None, "No products available")
            return False
        
        new_category = "Updated Category Test"
        
        success, response = self.run_test(
            "Update Product Category",
            "PUT",
            f"products/{self.created_product_ids[0]}",
            200,
            data={"category": new_category}
        )
        
        if success and response.get('category') == new_category:
            print(f"   ✅ Category updated to: {response['category']}")
            return True
        else:
            print(f"   ❌ Category update failed")
            return False

    def test_public_invoice_access(self):
        """Test public invoice access without authentication"""
        # First, get a customer ID
        success, customers = self.run_test(
            "Get Customers for Invoice Test",
            "GET",
            "customers",
            200
        )
        
        if not success or len(customers) == 0:
            print("⚠️  No customers available for invoice test")
            self.log_result("Public Invoice Access", False, None, "No customers available")
            return False
        
        customer_id = customers[0]['id']
        print(f"   Testing with customer ID: {customer_id}")
        
        # Test public endpoint WITHOUT authentication
        url = f"{self.base_url}/public/invoice/{customer_id}"
        print(f"   Testing public URL: {url}")
        
        try:
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Public invoice accessible without auth")
                print(f"   Customer: {data.get('customer', {}).get('name', 'N/A')}")
                print(f"   Orders: {len(data.get('orders', []))}")
                print(f"   Invoice ID: {data.get('invoice_id', 'N/A')}")
                self.log_result("Public Invoice Access", True, 200, "Success")
                return True
            else:
                print(f"   ❌ Failed - Status: {response.status_code}")
                self.log_result("Public Invoice Access", False, response.status_code, f"Expected 200, got {response.status_code}")
                return False
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            self.log_result("Public Invoice Access", False, None, str(e))
            return False

    def test_sample_orders_exist(self):
        """Test that sample orders exist for all 4 brands"""
        brands = ["abaya", "atelier", "technologies", "brand-journey"]
        
        for brand in brands:
            success, orders = self.run_test(
                f"Get Orders for {brand}",
                "GET",
                f"orders?brand_id={brand}",
                200
            )
            
            if success:
                print(f"   Found {len(orders)} orders for {brand}")
                if len(orders) > 0:
                    # Check if orders have multiple products
                    for order in orders[:2]:  # Check first 2 orders
                        items_count = len(order.get('items', []))
                        print(f"     Order {order.get('order_number', 'N/A')}: {items_count} items, Payment: {order.get('payment_method', 'N/A')}")

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("📊 NEW FEATURES TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        print("="*60)
        
        if self.tests_run - self.tests_passed > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['passed']:
                    print(f"  - {result['test']}: {result['message']}")
        
        return self.tests_passed == self.tests_run

def main():
    print("🚀 Starting Rihla New Features API Tests")
    print("="*60)
    
    tester = RihlaNewFeaturesTester()
    
    # Login with admin credentials
    print("\n🔐 Logging in with admin credentials...")
    if not tester.test_login("admin@rihla.com", "admin123"):
        print("❌ Admin login failed, trying user credentials...")
        if not tester.test_login("user@rihla.com", "user123"):
            print("❌ Login failed, stopping tests")
            return 1
    
    # Test 1: Create products for testing
    print("\n" + "="*60)
    print("📦 PRODUCT CREATION FOR TESTING")
    print("="*60)
    tester.test_create_products_for_order()
    
    # Test 2: Multiple products with VAT
    print("\n" + "="*60)
    print("🛒 MULTIPLE PRODUCTS ORDER WITH VAT")
    print("="*60)
    tester.test_multiple_products_order_with_vat()
    
    # Test 3: Order without VAT
    print("\n" + "="*60)
    print("🛒 ORDER WITHOUT VAT")
    print("="*60)
    tester.test_order_without_vat()
    
    # Test 4: Order with INR (18% VAT)
    print("\n" + "="*60)
    print("🛒 ORDER WITH INR CURRENCY (18% VAT)")
    print("="*60)
    tester.test_order_with_inr_vat()
    
    # Test 5: Payment methods
    print("\n" + "="*60)
    print("💳 PAYMENT METHODS")
    print("="*60)
    tester.test_payment_methods()
    
    # Test 6: Stock deduction
    print("\n" + "="*60)
    print("📊 STOCK DEDUCTION")
    print("="*60)
    tester.test_stock_deduction()
    
    # Test 7: Category update
    print("\n" + "="*60)
    print("✏️ CATEGORY UPDATE")
    print("="*60)
    tester.test_category_update()
    
    # Test 8: Public invoice access
    print("\n" + "="*60)
    print("🔓 PUBLIC INVOICE ACCESS")
    print("="*60)
    tester.test_public_invoice_access()
    
    # Test 9: Sample orders
    print("\n" + "="*60)
    print("📋 SAMPLE ORDERS CHECK")
    print("="*60)
    tester.test_sample_orders_exist()
    
    # Print summary
    all_passed = tester.print_summary()
    
    # Save results to file
    results_file = f"/app/test_reports/new_features_backend_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(results_file, 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total_tests": tester.tests_run,
            "passed": tester.tests_passed,
            "failed": tester.tests_run - tester.tests_passed,
            "success_rate": f"{(tester.tests_passed/tester.tests_run*100):.1f}%",
            "results": tester.test_results
        }, f, indent=2)
    print(f"\n📄 Results saved to: {results_file}")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
