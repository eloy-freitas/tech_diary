import { useState, useEffect } from 'react';
import api from '../api/client';
import './Tags.css';

export default function Tags() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTagName, setNewTagName] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getTags();
            setTags(data);
        } catch (error) {
            console.error('Failed to load tags:', error);
            alert('Failed to load tags. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newTagName.trim()) return;

        try {
            await api.createTag({ name: newTagName.trim() });
            setNewTagName('');
            await loadData();
        } catch (error) {
            console.error('Failed to create tag:', error);
            alert('Failed to create tag: ' + error.message);
        }
    };

    const handleDelete = async (name) => {
        if (!confirm(`Are you sure you want to delete the tag "${name}"?`)) return;
        try {
            await api.deleteTag(name);
            await loadData();
        } catch (error) {
            console.error('Failed to delete tag:', error);
            alert('Failed to delete tag: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading">Loading tags...</div>
            </div>
        );
    }

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Tags</h1>
                    <p className="page-subtitle">Organize your projects and tasks with tags</p>
                </div>
            </div>

            <div className="tags-manager">
                <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h3 className="mb-2">Create New Tag</h3>
                    <form onSubmit={handleSubmit} className="tag-form">
                        <input
                            type="text"
                            className="form-input"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="Enter tag name (e.g., python, backend, frontend)"
                            required
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.6rem' }}
                            title="Add tag"
                        >
                            <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>+</span>
                            <span style={{ fontSize: '1.1rem', lineHeight: '1' }}>🏷️</span>
                        </button>
                    </form>
                </div>

                {tags.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏷️</div>
                        <h3>No tags yet</h3>
                        <p>Create tags to categorize your projects and tasks</p>
                    </div>
                ) : (
                    <div>
                        <h3 className="mb-2">All Tags ({tags.length})</h3>
                        <div className="tags-grid">
                            {tags.map((tag) => (
                                <div key={tag.name} className="tag-item">
                                    <span className="tag tag-large">{tag.name}</span>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(tag.name)}
                                        style={{ padding: '0.3rem 0.4rem' }}
                                        title="Delete tag"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
