import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const LOGO_URL = 'https://customer-assets.emergentagent.com/job_ecomm-command/artifacts/qa8d1hm5_RIHLA%20%281%29.png';

export default function Invoice({ mode }) {
  const params = useParams(); // { customerId } or { orderId }
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [mode, params]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      if (mode === 'order') {
        const orderId = params.orderId;
        response = await axios.get(`${API}/public/invoice-by-order/${orderId}`);
      } else {
        const customerId = params.customerId;
        response = await axios.get(`${API}/public/invoice/${customerId}`);
      }
      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-body">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground font-body">Document not found</p>
      </div>
    );
  }

  // Normalize Data
  const { customer, invoice_id, invoice_date } = data;
  const isSingleOrder = mode === 'order';
  const order = isSingleOrder ? data.order : null;
  const orders = !isSingleOrder ? data.orders : [order]; // Treat single order as list for table if needed

  // Totals
  const totalAmount = isSingleOrder ? order.total : data.total_amount;
  // Use a public URL format so it can be scanned "via internet"
  // const invoiceUrl = `https://verify.rihla-enterprise.com/invoice?id=${invoice_id}&ref=${isSingleOrder ? order.order_number : customer.id}`;
  const invoiceUrl = isSingleOrder
    ? `${window.location.origin}/public/invoice/${order.order_number}`
    : `${window.location.origin}/public/invoice/customer/${customer.id}`; // Fallback for customer statement if we add public route for it later, or just keep as is for now.

  // Since we only really implemented /public/invoice/:orderId, let's stick to that for orders.
  // For statements, we might not have a public view yet, but let's make it consistent.
  const qrUrl = isSingleOrder
    ? `https://rihlahub.rihlatech.info/public/invoice/${order.order_number}`
    : `https://rihlahub.rihlatech.info`; // Point to home for now if no specific route


  return (
    <div className="min-h-screen bg-gray-100">
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => navigate('/customers')}
          className="flex items-center gap-2 bg-gray-800 text-white hover:bg-gray-700 px-4 py-2 rounded-lg font-heading font-medium transition-all duration-200"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-heading font-medium transition-all duration-200"
        >
          <Printer size={20} />
          Print / Save PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-8 print:p-0">
        <div className="bg-white text-black p-12 rounded-lg shadow-lg print:shadow-none">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 border-b-2 border-gray-300 pb-6">
            <div className="flex items-center gap-4">
              <img src={LOGO_URL} alt="Rihla Logo" className="h-24 w-auto object-contain" />
              <div>
                <h1 className="font-display text-4xl font-bold text-gray-900">Rihla</h1>
                <p className="font-body text-sm text-gray-600 italic mt-1">Where every journey becomes a story worth telling</p>
                <p className="text-xs text-gray-500 mt-1">Email: info@rihlatech.info</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="font-heading text-3xl font-bold text-gray-900 mb-2">
                {isSingleOrder ? 'TAX INVOICE' : 'STATEMENT'}
              </h2>
              <p className="font-mono text-sm text-gray-600">#{invoice_id}</p>
              <p className="text-sm text-gray-500 mt-1">
                Date: {new Date(invoice_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Bill To / From */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Bill To:</h3>
              <div className="space-y-1">
                <p className="font-heading text-lg font-semibold text-gray-900">{customer.name}</p>
                <p className="text-sm text-gray-600">{customer.email}</p>
                {customer.phone && <p className="text-sm text-gray-600">{customer.phone}</p>}
                <p className="text-xs text-gray-500 mt-2">
                  Customer Since: {new Date(customer.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Issued By:</h3>
              <div className="space-y-1">
                <p className="font-heading text-lg font-semibold text-gray-900">
                  {isSingleOrder ? order.brand_name : 'Rihla Enterprise'}
                </p>
                <p className="text-sm text-gray-600">Rihla Cloud Platform</p>
                <p className="text-sm text-gray-600 mt-1">Email: info@rihlatech.info</p>
              </div>
            </div>
          </div>

          {/* Order Details Table */}
          <div className="mb-8">
            <h3 className="font-heading text-lg font-semibold text-gray-900 mb-4">
              {isSingleOrder ? 'Invoice Items' : 'Account Activity'}
            </h3>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-2 font-heading text-xs font-semibold uppercase tracking-wide text-gray-600">Description</th>
                  <th className="text-center py-3 px-2 font-heading text-xs font-semibold uppercase tracking-wide text-gray-600">Qty</th>
                  <th className="text-right py-3 px-2 font-heading text-xs font-semibold uppercase tracking-wide text-gray-600">Unit Price</th>
                  <th className="text-right py-3 px-2 font-heading text-xs font-semibold uppercase tracking-wide text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <React.Fragment key={ord.id}>
                    {/* For Single Order, list ITEMS. For Statement, list ORDERS. */}
                    {isSingleOrder ? (
                      ord.items.map((item, idx) => (
                        <tr key={`${ord.id}-${idx}`} className="border-b border-gray-100">
                          <td className="py-3 px-2 text-sm text-gray-700">
                            <div className="font-medium">{item.product_name}</div>
                            <div className="text-xs text-gray-500">SKU: {item.product_id}</div>
                          </td>
                          <td className="py-3 px-2 text-center text-sm text-gray-700">{item.quantity}</td>
                          <td className="py-3 px-2 text-right text-sm text-gray-700">{ord.currency} {item.price.toFixed(2)}</td>
                          <td className="py-3 px-2 text-right text-sm text-gray-900 font-semibold">{ord.currency} {(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-2 text-sm text-gray-700">
                          <div className="font-medium">Order #{ord.order_number}</div>
                          <div className="text-xs text-gray-500">{new Date(ord.created_at).toLocaleDateString()} - {ord.brand_name}</div>
                        </td>
                        <td className="py-3 px-2 text-center text-sm text-gray-700">{ord.items.reduce((s, i) => s + i.quantity, 0)}</td>
                        <td className="py-3 px-2 text-right text-sm text-gray-700">-</td>
                        <td className="py-3 px-2 text-right text-sm text-gray-900 font-semibold">{ord.currency} {ord.total.toFixed(2)}</td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary / Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="space-y-2">
                {isSingleOrder ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">SAR {order.subtotal.toFixed(2)}</span>
                    </div>
                    {order.apply_vat && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">VAT ({(order.vat_rate * 100).toFixed(0)}%):</span>
                        <span className="text-gray-900">SAR {order.vat_amount.toFixed(2)}</span>
                      </div>
                    )}
                    {order.shipping_charges > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="text-gray-900">SAR {order.shipping_charges.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Orders Value:</span>
                    <span className="text-gray-900">SAR {totalAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between py-3 border-t-2 border-gray-900 mt-2">
                  <span className="font-heading text-lg font-bold text-gray-900">Total Due:</span>
                  <span className="font-heading text-lg font-bold text-gray-900">SAR {totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end border-t-2 border-gray-300 pt-6">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-2">Scan for Digital Copy:</p>
              <div className="bg-white p-2 inline-block border border-gray-300 rounded">
                <QRCodeSVG value={qrUrl} size={80} level="M" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Thank you for your business!</p>
              <p className="text-xs text-gray-400">Rihla Enterprise © 2026</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
