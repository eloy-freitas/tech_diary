import { useState, useEffect } from 'react';
import api from '../api/client';
import './Tasks.css';

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [expandedTask, setExpandedTask] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        pr_links: [],
        important_links: [],
        cmd_commands: [],
        tags: [],
        saved_file_paths: [],
        date_of_execution: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [tasksData, tagsData] = await Promise.all([
                api.getTasks(),
                api.getTags(),
            ]);
            setTasks(tasksData);
            setTags(tagsData);
        } catch (error) {
            console.error('Failed to load data:', error);
            alert('Failed to load tasks. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                date_of_execution: new Date(formData.date_of_execution).toISOString(),
            };

            if (editingTask) {
                await api.updateTask(editingTask.id, submitData);
            } else {
                await api.createTask(submitData);
            }
            await loadData();
            closeModal();
        } catch (error) {
            console.error('Failed to save task:', error);
            alert('Failed to save task: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.deleteTask(id);
            await loadData();
        } catch (error) {
            console.error('Failed to delete task:', error);
            alert('Failed to delete task: ' + error.message);
        }
    };

    const openModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                name: task.name,
                description: task.description,
                pr_links: task.pr_links || [],
                important_links: task.important_links || [],
                cmd_commands: task.cmd_commands || [],
                tags: task.tags || [],
                saved_file_paths: task.saved_file_paths || [],
                date_of_execution: task.date_of_execution ? task.date_of_execution.split('T')[0] : new Date().toISOString().split('T')[0],
            });
        } else {
            setEditingTask(null);
            setFormData({
                name: '',
                description: '',
                pr_links: [],
                important_links: [],
                cmd_commands: [],
                tags: [],
                saved_file_paths: [],
                date_of_execution: new Date().toISOString().split('T')[0],
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTask(null);
    };

    const handleTagToggle = (tagName) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tagName)
                ? prev.tags.filter(t => t !== tagName)
                : [...prev.tags, tagName]
        }));
    };

    const handleArrayFieldChange = (field, index, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const handleAddArrayField = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const handleRemoveArrayField = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading">Loading tasks...</div>
            </div>
        );
    }

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Tasks</h1>
                    <p className="page-subtitle">Track your accomplishments and contributions</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + New Task
                </button>
            </div>

            {tasks.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">✓</div>
                    <h3>No tasks yet</h3>
                    <p>Start documenting your achievements and tasks</p>
                    <button className="btn btn-primary mt-2" onClick={() => openModal()}>
                        Create Task
                    </button>
                </div>
            ) : (
                <div className="tasks-list">
                    {tasks.map((task) => (
                        <div key={task.id} className="task-card card">
                            <div className="card-header">
                                <div className="flex-col" style={{ flex: 1 }}>
                                    <h3 className="card-title mb-0">{task.name}</h3>
                                    <span className="task-date">{formatDate(task.date_of_execution)}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                                    >
                                        {expandedTask === task.id ? 'Collapse' : 'Expand'}
                                    </button>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => openModal(task)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(task.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="card-body">
                                <p className="mb-2">{task.description}</p>

                                {task.tags && task.tags.length > 0 && (
                                    <div className="tags-container mb-2">
                                        {task.tags.map((tag) => (
                                            <span key={tag} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                )}

                                {expandedTask === task.id && (
                                    <div className="task-details">
                                        {task.pr_links && task.pr_links.length > 0 && (
                                            <div className="detail-section">
                                                <h4 className="detail-title">🔗 Pull Requests</h4>
                                                <ul className="detail-list">
                                                    {task.pr_links.map((link, i) => (
                                                        <li key={i}>
                                                            <a href={link} target="_blank" rel="noopener noreferrer" className="link">
                                                                {link}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {task.important_links && task.important_links.length > 0 && (
                                            <div className="detail-section">
                                                <h4 className="detail-title">📌 Important Links</h4>
                                                <ul className="detail-list">
                                                    {task.important_links.map((link, i) => (
                                                        <li key={i}>
                                                            <a href={link} target="_blank" rel="noopener noreferrer" className="link">
                                                                {link}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {task.cmd_commands && task.cmd_commands.length > 0 && (
                                            <div className="detail-section">
                                                <h4 className="detail-title">⌨️ Commands</h4>
                                                <div className="commands-list">
                                                    {task.cmd_commands.map((cmd, i) => (
                                                        <code key={i} className="command">{cmd}</code>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {task.saved_file_paths && task.saved_file_paths.length > 0 && (
                                            <div className="detail-section">
                                                <h4 className="detail-title">📁 File Paths</h4>
                                                <ul className="detail-list">
                                                    {task.saved_file_paths.map((path, i) => (
                                                        <li key={i}>
                                                            <code className="file-path">{path}</code>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-3">{editingTask ? 'Edit Task' : 'New Task'}</h2>
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
                                <label className="form-label">Date of Execution</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.date_of_execution}
                                    onChange={(e) => setFormData({ ...formData, date_of_execution: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">PR Links</label>
                                {formData.pr_links.map((link, index) => (
                                    <div key={index} className="array-field">
                                        <input
                                            type="url"
                                            className="form-input"
                                            value={link}
                                            onChange={(e) => handleArrayFieldChange('pr_links', index, e.target.value)}
                                            placeholder="https://github.com/..."
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleRemoveArrayField('pr_links', index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => handleAddArrayField('pr_links')}
                                >
                                    + Add PR Link
                                </button>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Important Links</label>
                                {formData.important_links.map((link, index) => (
                                    <div key={index} className="array-field">
                                        <input
                                            type="url"
                                            className="form-input"
                                            value={link}
                                            onChange={(e) => handleArrayFieldChange('important_links', index, e.target.value)}
                                            placeholder="https://..."
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleRemoveArrayField('important_links', index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => handleAddArrayField('important_links')}
                                >
                                    + Add Link
                                </button>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Commands</label>
                                {formData.cmd_commands.map((cmd, index) => (
                                    <div key={index} className="array-field">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={cmd}
                                            onChange={(e) => handleArrayFieldChange('cmd_commands', index, e.target.value)}
                                            placeholder="npm run build"
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleRemoveArrayField('cmd_commands', index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => handleAddArrayField('cmd_commands')}
                                >
                                    + Add Command
                                </button>
                            </div>

                            <div className="form-group">
                                <label className="form-label">File Paths</label>
                                {formData.saved_file_paths.map((path, index) => (
                                    <div key={index} className="array-field">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={path}
                                            onChange={(e) => handleArrayFieldChange('saved_file_paths', index, e.target.value)}
                                            placeholder="/path/to/file.py"
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleRemoveArrayField('saved_file_paths', index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => handleAddArrayField('saved_file_paths')}
                                >
                                    + Add File Path
                                </button>
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
                                    {editingTask ? 'Update' : 'Create'}
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
