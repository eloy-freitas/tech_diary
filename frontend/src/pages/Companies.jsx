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
                <button
                    className="btn btn-primary"
                    onClick={() => openModal()}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.6rem' }}
                    title="Create new company"
                >
                    <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>+</span>
                    <span style={{ fontSize: '1.1rem', lineHeight: '1' }}>🏢</span>
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
                                <div className="flex gap-1" style={{ alignItems: 'center' }}>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => openModal(company)}
                                        style={{ padding: '0.3rem 0.4rem' }}
                                        title="Edit company"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                        </svg>
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(company.id)}
                                        style={{ padding: '0.3rem 0.4rem' }}
                                        title="Delete company"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                        </svg>
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
