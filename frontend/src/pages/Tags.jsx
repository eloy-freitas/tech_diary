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
                        <button type="submit" className="btn btn-primary">
                            + Add Tag
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
                                    >
                                        Delete
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
