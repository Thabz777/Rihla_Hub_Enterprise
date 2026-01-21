import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2, FileText, Calendar, User, Package, DollarSign } from 'lucide-react';

// Use the same environment variable pattern as AuthContext
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const LOGO_URL = 'https://customer-assets.emergentagent.com/job_ecomm-command/artifacts/qa8d1hm5_RIHLA%20%281%29.png';

export default function PublicInvoice() {
    const { orderId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInvoice();
    }, [orderId]);

    const fetchInvoice = async () => {
        try {
            const response = await axios.get(`${API}/public/invoice-by-order/${orderId}`);
            setData(response.data);
        } catch (err) {
            console.error('Invoice fetch error:', err);
            setError('Invoice not found or invalid.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="text-white animate-spin mx-auto mb-4" />
                    <p className="text-white/70 font-medium">Verifying Invoice...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-900 via-slate-900 to-slate-900 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Invoice Not Found</h1>
                    <p className="text-white/70">The invoice you're looking for doesn't exist or has been removed.</p>
                    <p className="text-white/50 text-sm mt-4">Reference: {orderId}</p>
                </div>
            </div>
        );
    }

    const { invoice_id, invoice_date, customer, order } = data;

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-900 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Verification Badge */}
                <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-2xl p-6 mb-6 text-center backdrop-blur-sm">
                    <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold text-white mb-1">Invoice Verified</h1>
                    <p className="text-emerald-300/80 text-sm">This is an authentic Rihla Enterprise invoice</p>
                </div>

                {/* Invoice Card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 flex items-center justify-between">
                        <img src={LOGO_URL} alt="Rihla" className="h-10" />
                        <div className="text-right">
                            <p className="text-white/50 text-xs uppercase tracking-wide">Invoice</p>
                            <p className="text-white font-mono font-bold">{invoice_id}</p>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="p-6 space-y-6">
                        {/* Date & Customer */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Calendar size={20} className="text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-slate-400 text-xs uppercase tracking-wide">Date</p>
                                    <p className="text-white font-medium">{new Date(invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <User size={20} className="text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-slate-400 text-xs uppercase tracking-wide">Customer</p>
                                    <p className="text-white font-medium">{customer?.name || order.customer_name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="border-t border-white/10 pt-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Package size={18} className="text-slate-400" />
                                <p className="text-white font-semibold">Order Items</p>
                            </div>
                            <div className="space-y-3">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5">
                                        <div>
                                            <p className="text-white font-medium">{item.product_name}</p>
                                            <p className="text-slate-400 text-sm">Qty: {item.quantity} × {order.currency || 'SAR'} {item.price?.toFixed(2)}</p>
                                        </div>
                                        <p className="text-white font-semibold">{order.currency || 'SAR'} {(item.quantity * item.price).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="border-t border-white/10 pt-4 space-y-2">
                            {order.vat_amount > 0 && (
                                <div className="flex justify-between text-slate-400">
                                    <span>Subtotal</span>
                                    <span>{order.currency || 'SAR'} {(order.total - order.vat_amount).toFixed(2)}</span>
                                </div>
                            )}
                            {order.vat_amount > 0 && (
                                <div className="flex justify-between text-slate-400">
                                    <span>VAT (15%)</span>
                                    <span>{order.currency || 'SAR'} {order.vat_amount?.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <DollarSign size={20} className="text-emerald-400" />
                                    <span className="text-lg font-bold text-white">Total</span>
                                </div>
                                <span className="text-2xl font-bold text-emerald-400">{order.currency || 'SAR'} {order.total?.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-center gap-2 py-3 bg-white/5 rounded-lg">
                            <FileText size={18} className="text-slate-400" />
                            <span className="text-slate-400">Status:</span>
                            <span className={`font-semibold uppercase text-sm px-3 py-1 rounded-full ${order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                order.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                                    order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                }`}>
                                {order.status}
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-800/50 px-6 py-4 text-center">
                        <p className="text-slate-400 text-xs">Rihla Enterprise Cloud Platform</p>
                        <p className="text-slate-500 text-[10px] mt-1">This is an electronically generated invoice</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
