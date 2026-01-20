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
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + New Project
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
                                <div className="flex gap-1">
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => openModal(project)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(project.id)}
                                    >
                                        Delete
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
