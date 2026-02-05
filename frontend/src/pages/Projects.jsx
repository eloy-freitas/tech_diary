import { useState, useEffect } from 'react';
import api from '../api/client';
import './Projects.css';

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        tags: [],
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [projectsData, tagsData] = await Promise.all([
                api.getProjects(),
                api.getTags(),
            ]);
            setProjects(projectsData);
            setTags(tagsData);
        } catch (error) {
            console.error('Failed to load data:', error);
            alert('Failed to load projects. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProject) {
                await api.updateProject(editingProject.id, formData);
            } else {
                await api.createProject(formData);
            }
            await loadData();
            closeModal();
        } catch (error) {
            console.error('Failed to save project:', error);
            alert('Failed to save project: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            await api.deleteProject(id);
            await loadData();
        } catch (error) {
            console.error('Failed to delete project:', error);
            alert('Failed to delete project: ' + error.message);
        }
    };

    const openModal = (project = null) => {
        if (project) {
            setEditingProject(project);
            setFormData({
                name: project.name,
                description: project.description,
                tags: project.tags || [],
            });
        } else {
            setEditingProject(null);
            setFormData({
                name: '',
                description: '',
                tags: [],
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProject(null);
    };

    const handleTagToggle = (tagName) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tagName)
                ? prev.tags.filter(t => t !== tagName)
                : [...prev.tags, tagName]
        }));
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading">Loading projects...</div>
            </div>
        );
    }

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Projects</h1>
                    <p className="page-subtitle">Manage your professional projects and achievements</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => openModal()}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.6rem' }}
                    title="Create new project"
                >
                    <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>+</span>
                    <span style={{ fontSize: '1.1rem', lineHeight: '1' }}>📁</span>
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📁</div>
                    <h3>No projects yet</h3>
                    <p>Create your first project to start building your brag document</p>
                    <button className="btn btn-primary mt-2" onClick={() => openModal()}>
                        Create Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-2">
                    {projects.map((project) => (
                        <div key={project.id} className="card">
                            <div className="card-header">
                                <h3 className="card-title">{project.name}</h3>
                                <div className="flex gap-1" style={{ alignItems: 'center' }}>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => openModal(project)}
                                        style={{ padding: '0.3rem 0.4rem' }}
                                        title="Edit project"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                        </svg>
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(project.id)}
                                        style={{ padding: '0.3rem 0.4rem' }}
                                        title="Delete project"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                <p className="mb-2">{project.description}</p>

                                {project.tags && project.tags.length > 0 && (
                                    <div className="tags-container">
                                        {project.tags.map((tag) => (
                                            <span key={tag} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-3">{editingProject ? 'Edit Project' : 'New Project'}</h2>
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
                                <label className="form-label">Description *</label>
                                <textarea
                                    className="form-textarea"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Tags</label>
                                <div className="tags-selector">
                                    {tags.map((tag) => (
                                        <label key={tag.name} className="tag-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={formData.tags.includes(tag.name)}
                                                onChange={() => handleTagToggle(tag.name)}
                                            />
                                            <span className="tag">{tag.name}</span>
                                        </label>
                                    ))}
                                    {tags.length === 0 && (
                                        <p className="text-muted text-small">No tags available. Create tags first.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 mt-3">
                                <button type="submit" className="btn btn-primary">
                                    {editingProject ? 'Update' : 'Create'}
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
