import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const LOGO_URL = 'https://customer-assets.emergentagent.com/job_ecomm-command/artifacts/qa8d1hm5_RIHLA%20%281%29.png';

export default function Invoice() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoiceData();
  }, [customerId]);

  const fetchInvoiceData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/public/invoice/${customerId}`);
      setInvoiceData(response.data);
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
          <p className="text-muted-foreground font-body">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground font-body">Invoice not found</p>
      </div>
    );
  }

  const { customer, orders, invoice_id, invoice_date, total_amount } = invoiceData;
  const invoiceUrl = `${window.location.origin}/invoice/${customerId}`;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => navigate('/customers')}
          className="flex items-center gap-2 bg-gray-800 text-white hover:bg-gray-700 px-4 py-2 rounded-lg font-heading font-medium transition-all duration-200"
          data-testid="back-button"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-heading font-medium transition-all duration-200"
          data-testid="print-button"
        >
          <Printer size={20} />
          Print / Download PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-8 print:p-0">
        <div className="bg-white text-black p-12 rounded-lg shadow-lg print:shadow-none" data-testid="invoice-content">
          <div className="flex justify-between items-start mb-8 border-b-2 border-gray-300 pb-6">
            <div className="flex items-center gap-4">
              <img src={LOGO_URL} alt="Rihla Logo" className="h-16 w-16 object-contain" />
              <div>
                <h1 className="font-display text-4xl font-bold text-gray-900">Rihla</h1>
                <p className="font-body text-sm text-gray-600 italic mt-1">Where every journey becomes a story worth telling</p>
                <p className="text-xs text-gray-500 mt-1">Email: info@rihlatech.info</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="font-heading text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
              <p className="font-mono text-sm text-gray-600">#{invoice_id}</p>
              <p className="text-sm text-gray-500 mt-1">
                Date: {new Date(invoice_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Bill To:</h3>
              <div className="space-y-1">
                <p className="font-heading text-lg font-semibold text-gray-900">{customer.name}</p>
                <p className="text-sm text-gray-600">{customer.email}</p>
                {customer.phone && <p className="text-sm text-gray-600">{customer.phone}</p>}
                <p className="text-xs text-gray-500 mt-2">
                  Customer Since: {new Date(customer.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">From:</h3>
              <div className="space-y-1">
                <p className="font-heading text-lg font-semibold text-gray-900">Rihla</p>
                <p className="text-sm text-gray-600 italic">Where every journey becomes a story worth telling</p>
                <p className="text-sm text-gray-600 mt-2">Email: info@rihlatech.info</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 bg-gray-50 p-6 rounded-lg">
            <div className="text-center">
              <p className="text-xs font-heading font-semibold uppercase tracking-wide text-gray-500 mb-1">Total Orders</p>
              <p className="text-2xl font-heading font-bold text-gray-900">{customer.total_orders}</p>
            </div>
            <div className="text-center border-l border-r border-gray-300">
              <p className="text-xs font-heading font-semibold uppercase tracking-wide text-gray-500 mb-1">Lifetime Value</p>
              <p className="text-2xl font-heading font-bold text-gray-900">SAR {customer.lifetime_value.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-heading font-semibold uppercase tracking-wide text-gray-500 mb-1">Invoice Total</p>
              <p className="text-2xl font-heading font-bold text-gray-900">SAR {total_amount.toFixed(2)}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-heading text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-2 font-heading text-xs font-semibold uppercase tracking-wide text-gray-600">Order #</th>
                  <th className="text-left py-3 px-2 font-heading text-xs font-semibold uppercase tracking-wide text-gray-600">Brand</th>
                  <th className="text-left py-3 px-2 font-heading text-xs font-semibold uppercase tracking-wide text-gray-600">Products</th>
                  <th className="text-center py-3 px-2 font-heading text-xs font-semibold uppercase tracking-wide text-gray-600">Payment</th>
                  <th className="text-left py-3 px-2 font-heading text-xs font-semibold uppercase tracking-wide text-gray-600">Date</th>
                  <th className="text-left py-3 px-2 font-heading text-xs font-semibold uppercase tracking-wide text-gray-600">Status</th>
                  <th className="text-right py-3 px-2 font-heading text-xs font-semibold uppercase tracking-wide text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">No orders found</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-200">
                      <td className="py-3 px-2 font-mono text-sm text-gray-700">{order.order_number}</td>
                      <td className="py-3 px-2 text-sm text-gray-700">{order.brand_name}</td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <p key={idx} className="text-xs">
                                {item.product_name} (x{item.quantity})
                              </p>
                            ))}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-2 text-center text-xs text-gray-700">{order.payment_method || 'N/A'}</td>
                      <td className="py-3 px-2 text-sm text-gray-700">
                        {new Date(order.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-gray-900">
                        {order.currency} {order.total.toFixed(2)}
                        {order.vat_amount > 0 && (
                          <p className="text-xs text-gray-500">VAT: {order.currency} {order.vat_amount.toFixed(2)}</p>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2 border-t border-gray-300">
                <span className="font-heading text-sm text-gray-600">Subtotal:</span>
                <span className="font-heading text-sm text-gray-900">SAR {total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-300">
                <span className="font-heading text-sm text-gray-600">VAT (15%):</span>
                <span className="font-heading text-sm text-gray-900">SAR {(total_amount * 0.15).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-900">
                <span className="font-heading text-lg font-bold text-gray-900">Total:</span>
                <span className="font-heading text-lg font-bold text-gray-900">SAR {(total_amount * 1.15).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end border-t-2 border-gray-300 pt-6">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-2">Scan QR code to view this invoice online:</p>
              <div className="bg-white p-3 inline-block border-2 border-gray-300 rounded">
                <QRCodeSVG 
                  value={invoiceUrl} 
                  size={120}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Thank you for your business!</p>
              <p className="text-xs text-gray-400">This is a computer-generated invoice.</p>
              <p className="text-xs text-gray-400 mt-2">Rihla Enterprise © 2025</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
