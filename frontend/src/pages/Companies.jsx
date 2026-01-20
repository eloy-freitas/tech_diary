import { useState, useEffect } from 'react';
import api from '../api/client';
import '../pages/Projects.css';

export default function Companies() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
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
            const data = await api.getCompanies();
            setCompanies(data);
        } catch (error) {
            console.error('Failed to load companies:', error);
            alert('Failed to load companies. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCompany) {
                await api.updateCompany(editingCompany.id, formData);
            } else {
                await api.createCompany(formData);
            }
            await loadData();
            closeModal();
        } catch (error) {
            console.error('Failed to save company:', error);
            alert('Failed to save company: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this company?')) return;
        try {
            await api.deleteCompany(id);
            await loadData();
        } catch (error) {
            console.error('Failed to delete company:', error);
            alert('Failed to delete company: ' + error.message);
        }
    };

    const openModal = (company = null) => {
        if (company) {
            setEditingCompany(company);
            setFormData({
                name: company.name,
                description: company.description || '',
            });
        } else {
            setEditingCompany(null);
            setFormData({
                name: '',
                description: '',
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCompany(null);
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading">Loading companies...</div>
            </div>
        );
    }

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Companies</h1>
                    <p className="page-subtitle">Manage companies you've worked with</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + New Company
                </button>
            </div>

            {companies.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🏢</div>
                    <h3>No companies yet</h3>
                    <p>Add companies you've worked with or for</p>
                    <button className="btn btn-primary mt-2" onClick={() => openModal()}>
                        Create Company
                    </button>
                </div>
            ) : (
                <div className="grid grid-3">
                    {companies.map((company) => (
                        <div key={company.id} className="card">
                            <div className="card-header">
                                <h3 className="card-title">{company.name}</h3>
                                <div className="flex gap-1">
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => openModal(company)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(company.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            {company.description && (
                                <div className="card-body">
                                    <p className="mb-0">{company.description}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-3">{editingCompany ? 'Edit Company' : 'New Company'}</h2>
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
                                    {editingCompany ? 'Update' : 'Create'}
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
