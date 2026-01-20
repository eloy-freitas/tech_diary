import { useState, useEffect } from 'react';
import api from '../api/client';
import '../pages/Projects.css';

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getCustomers();
            setCustomers(data);
        } catch (error) {
            console.error('Failed to load customers:', error);
            alert('Failed to load customers. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCustomer) {
                await api.updateCustomer(editingCustomer.id, formData);
            } else {
                await api.createCustomer(formData);
            }
            await loadData();
            closeModal();
        } catch (error) {
            console.error('Failed to save customer:', error);
            alert('Failed to save customer: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this customer?')) return;
        try {
            await api.deleteCustomer(id);
            await loadData();
        } catch (error) {
            console.error('Failed to delete customer:', error);
            alert('Failed to delete customer: ' + error.message);
        }
    };

    const openModal = (customer = null) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                name: customer.name,
                description: customer.description || '',
            });
        } else {
            setEditingCustomer(null);
            setFormData({
                name: '',
                description: '',
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCustomer(null);
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading">Loading customers...</div>
            </div>
        );
    }

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Customers</h1>
                    <p className="page-subtitle">Manage your clients and customers</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + New Customer
                </button>
            </div>

            {customers.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <h3>No customers yet</h3>
                    <p>Add customers you've worked with</p>
                    <button className="btn btn-primary mt-2" onClick={() => openModal()}>
                        Create Customer
                    </button>
                </div>
            ) : (
                <div className="grid grid-3">
                    {customers.map((customer) => (
                        <div key={customer.id} className="card">
                            <div className="card-header">
                                <h3 className="card-title">{customer.name}</h3>
                                <div className="flex gap-1">
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => openModal(customer)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(customer.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            {customer.description && (
                                <div className="card-body">
                                    <p className="mb-0">{customer.description}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-3">{editingCustomer ? 'Edit Customer' : 'New Customer'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-textarea"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Optional description"
                                />
                            </div>

                            <div className="flex gap-2 mt-3">
                                <button type="submit" className="btn btn-primary">
                                    {editingCustomer ? 'Update' : 'Create'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
