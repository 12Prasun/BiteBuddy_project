import React, { useState, useEffect } from 'react';
import { LoadingSpinner, ErrorMessage } from './UIComponents';

export default function OrderTracking({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const statusSteps = [
    { key: 'pending', label: 'Pending', icon: '⏳' },
    { key: 'confirmed', label: 'Confirmed', icon: '✓' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { key: 'on_the_way', label: 'On The Way', icon: '🚗' },
    { key: 'delivered', label: 'Delivered', icon: '📦' }
  ];

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
      // Refresh every 30 seconds
      const interval = setInterval(fetchOrder, 30000);
      return () => clearInterval(interval);
    }
  }, [orderId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!order) return <p>Order not found</p>;

  const currentStatusIndex = statusSteps.findIndex(s => s.key === order.status);

  return (
    <div className="order-tracking mt-5">
      <div className="card p-4">
        <h4 className="mb-4">Order #{order.orderId}</h4>

        {/* Status Timeline */}
        <div className="mb-5">
          <div className="progress mb-3" style={{ height: '4px' }}>
            <div
              className="progress-bar bg-success"
              style={{
                width: `${((currentStatusIndex + 1) / statusSteps.length) * 100}%`
              }}
            ></div>
          </div>

          <div className="d-flex justify-content-between">
            {statusSteps.map((step, index) => (
              <div key={step.key} className="text-center">
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2`}
                  style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: index <= currentStatusIndex ? '#28a745' : '#e9ecef',
                    color: index <= currentStatusIndex ? 'white' : '#6c757d',
                    fontSize: '24px'
                  }}
                >
                  {step.icon}
                </div>
                <small className={index <= currentStatusIndex ? 'text-success fw-bold' : 'text-muted'}>
                  {step.label}
                </small>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div className="row mb-4">
          <div className="col-md-6">
            <h6 className="text-muted mb-3">Delivery Details</h6>
            <p><strong>Address:</strong> {order.deliveryAddress}</p>
            <p><strong>Phone:</strong> {order.userPhone}</p>
            <p><strong>Estimated Delivery:</strong> {new Date(order.estimatedDelivery).toLocaleString()}</p>
          </div>
          <div className="col-md-6">
            <h6 className="text-muted mb-3">Order Summary</h6>
            <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
            <p><strong>Payment Method:</strong> {order.paymentMethod.toUpperCase()}</p>
            <p>
              <strong>Payment Status:</strong>
              <span className={`ms-2 badge bg-${order.paymentStatus === 'completed' ? 'success' : 'warning'}`}>
                {order.paymentStatus.toUpperCase()}
              </span>
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="mb-4">
          <h6 className="text-muted mb-3">Items Ordered</h6>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Size</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.size}</td>
                    <td>₹{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status History */}
        <div className="mb-4">
          <h6 className="text-muted mb-3">Status History</h6>
          {order.statusHistory && order.statusHistory.length > 0 ? (
            <div className="timeline">
              {order.statusHistory.slice().reverse().map((entry, idx) => (
                <div key={idx} className="d-flex mb-3">
                  <div className="me-3">
                    <div
                      className="rounded-circle"
                      style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#28a745',
                        marginTop: '5px'
                      }}
                    ></div>
                  </div>
                  <div>
                    <p className="mb-1">
                      <strong>{entry.status.toUpperCase()}</strong>
                    </p>
                    <small className="text-muted">{entry.message}</small>
                    <br />
                    <small className="text-muted">
                      {new Date(entry.timestamp).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No status history available</p>
          )}
        </div>

        {/* Cancel Button */}
        {['pending', 'confirmed'].includes(order.status) && (
          <button
            className="btn btn-outline-danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to cancel this order?')) {
                fetch(`/api/orders/${order.orderId}/cancel`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ reason: 'User cancelled the order' })
                })
                  .then(res => res.json())
                  .then(data => {
                    if (data.success) {
                      fetchOrder();
                      alert('Order cancelled successfully');
                    }
                  });
              }
            }}
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}
