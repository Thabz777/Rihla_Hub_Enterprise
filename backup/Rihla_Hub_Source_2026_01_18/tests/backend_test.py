import requests
import sys
from datetime import datetime
import json

class RihlaAPITester:
    def __init__(self, base_url="https://ecomm-command.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_order_id = None
        self.created_product_id = None

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
                print(f"   Response: {response.text[:200]}")
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

    def test_register(self, email, password, full_name):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={"email": email, "password": password, "full_name": full_name}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token received: {self.token[:20]}...")
            return True
        return False

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

    def test_get_current_user(self):
        """Test get current user"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        if success and 'email' in response:
            print(f"   User: {response['email']}")
            return True
        return False

    def test_get_brands(self):
        """Test get brands"""
        success, response = self.run_test(
            "Get Brands",
            "GET",
            "brands",
            200
        )
        if success and isinstance(response, list) and len(response) > 0:
            print(f"   Found {len(response)} brands")
            return True
        return False

    def test_get_dashboard_metrics(self):
        """Test get dashboard metrics"""
        success, response = self.run_test(
            "Get Dashboard Metrics",
            "GET",
            "dashboard/metrics",
            200
        )
        if success and 'total_revenue' in response:
            print(f"   Revenue: {response['total_revenue']}, Orders: {response['total_orders']}")
            return True
        return False

    def test_get_revenue_trend(self):
        """Test get revenue trend"""
        success, response = self.run_test(
            "Get Revenue Trend",
            "GET",
            "dashboard/revenue-trend",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} data points")
            return True
        return False

    def test_create_order(self):
        """Test create order"""
        order_data = {
            "customer_name": "Test Customer",
            "customer_email": "customer@test.com",
            "brand_id": "abaya",
            "items_count": 2,
            "total": 599.99,
            "status": "pending"
        }
        success, response = self.run_test(
            "Create Order",
            "POST",
            "orders",
            200,
            data=order_data
        )
        if success and 'id' in response:
            self.created_order_id = response['id']
            print(f"   Order created: {response['order_number']}")
            return True
        return False

    def test_get_orders(self):
        """Test get orders"""
        success, response = self.run_test(
            "Get Orders",
            "GET",
            "orders",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} orders")
            return True
        return False

    def test_get_orders_filtered(self):
        """Test get orders with filter"""
        success, response = self.run_test(
            "Get Orders (Filtered by Status)",
            "GET",
            "orders?status=pending",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} pending orders")
            return True
        return False

    def test_update_order_status(self):
        """Test update order status"""
        if not self.created_order_id:
            print("⚠️  Skipping - No order ID available")
            self.log_result("Update Order Status", False, None, "No order ID available")
            return False
        
        success, response = self.run_test(
            "Update Order Status",
            "PUT",
            f"orders/{self.created_order_id}?status=processing",
            200
        )
        if success and response.get('status') == 'processing':
            print(f"   Status updated to: {response['status']}")
            return True
        return False

    def test_create_product(self):
        """Test create product"""
        product_data = {
            "sku": f"TEST-SKU-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "name": "Test Product",
            "brand_id": "abaya",
            "category": "Clothing",
            "stock": 50,
            "price": 299.99,
            "image_url": "https://example.com/image.jpg"
        }
        success, response = self.run_test(
            "Create Product",
            "POST",
            "products",
            200,
            data=product_data
        )
        if success and 'id' in response:
            self.created_product_id = response['id']
            print(f"   Product created: {response['name']}")
            return True
        return False

    def test_get_products(self):
        """Test get products"""
        success, response = self.run_test(
            "Get Products",
            "GET",
            "products",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} products")
            return True
        return False

    def test_update_product_stock(self):
        """Test update product stock"""
        if not self.created_product_id:
            print("⚠️  Skipping - No product ID available")
            self.log_result("Update Product Stock", False, None, "No product ID available")
            return False
        
        success, response = self.run_test(
            "Update Product Stock",
            "PUT",
            f"products/{self.created_product_id}?stock=75",
            200
        )
        if success and response.get('stock') == 75:
            print(f"   Stock updated to: {response['stock']}")
            return True
        return False

    def test_get_customers(self):
        """Test get customers"""
        success, response = self.run_test(
            "Get Customers",
            "GET",
            "customers",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} customers")
            return True
        return False

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
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
    print("🚀 Starting Rihla Enterprise Cloud Platform API Tests")
    print("="*60)
    
    tester = RihlaAPITester()
    
    # Test with existing user first
    print("\n📝 Testing with existing user credentials...")
    if not tester.test_login("test@rihla.com", "test123"):
        print("\n⚠️  Existing user login failed, trying to register...")
        test_email = f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}@rihla.com"
        if not tester.test_register(test_email, "test123", "Test User"):
            print("❌ Registration failed, stopping tests")
            return 1
    
    # Authentication tests
    print("\n" + "="*60)
    print("🔐 AUTHENTICATION TESTS")
    print("="*60)
    tester.test_get_current_user()
    
    # Brands test
    print("\n" + "="*60)
    print("🏢 BRANDS TESTS")
    print("="*60)
    tester.test_get_brands()
    
    # Dashboard tests
    print("\n" + "="*60)
    print("📊 DASHBOARD TESTS")
    print("="*60)
    tester.test_get_dashboard_metrics()
    tester.test_get_revenue_trend()
    
    # Orders tests
    print("\n" + "="*60)
    print("🛒 ORDERS TESTS")
    print("="*60)
    tester.test_create_order()
    tester.test_get_orders()
    tester.test_get_orders_filtered()
    tester.test_update_order_status()
    
    # Products tests
    print("\n" + "="*60)
    print("📦 PRODUCTS TESTS")
    print("="*60)
    tester.test_create_product()
    tester.test_get_products()
    tester.test_update_product_stock()
    
    # Customers tests
    print("\n" + "="*60)
    print("👥 CUSTOMERS TESTS")
    print("="*60)
    tester.test_get_customers()
    
    # Print summary
    all_passed = tester.print_summary()
    
    # Save results to file
    results_file = f"/app/test_reports/backend_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
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
