import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../api/client';

export default function TaskModal({ task, show, onClose, onSave, projects, companies, setCompanies, customers, setCustomers, tags, setTags }) {
    const [showCompanyModal, setShowCompanyModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showTagModal, setShowTagModal] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newTagName, setNewTagName] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        pr_links: [],
        important_links: [],
        cmd_commands: [],
        tags: [],
        saved_file_paths: [],
        date_of_execution: new Date().toISOString().split('T')[0],
        project: '',
        company: '',
        customer: '',
    });

    const [previewMode, setPreviewMode] = useState(false);
    const textareaRef = useRef(null);

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    useEffect(() => {
        if (!previewMode) {
            adjustTextareaHeight();
        }
    }, [formData.description, previewMode, show]);

    useEffect(() => {
        if (task) {
            setFormData({
                name: task.name || '',
                description: task.description || '',
                pr_links: task.pr_links || [],
                important_links: task.important_links || [],
                cmd_commands: task.cmd_commands || [],
                tags: task.tags || [],
                saved_file_paths: task.saved_file_paths || [],
                date_of_execution: task.date_of_execution ? task.date_of_execution.split('T')[0] : new Date().toISOString().split('T')[0],
                project: task.project || '',
                company: task.company || '',
                customer: task.customer || '',
            });
        } else {
            setFormData({
                name: '',
                description: '',
                pr_links: [],
                important_links: [],
                cmd_commands: [],
                tags: [],
                saved_file_paths: [],
                date_of_execution: new Date().toISOString().split('T')[0],
                project: '',
                company: '',
                customer: '',
            });
        }
        setPreviewMode(false);
    }, [task]);

    const handleCreateCompany = async () => {
        if (!newCompanyName.trim()) return;
        try {
            const newCompany = await api.createCompany({ name: newCompanyName.trim(), description: '' });
            setCompanies([...companies, newCompany]);
            setFormData({ ...formData, company: newCompany.id });
            setNewCompanyName('');
            setShowCompanyModal(false);
        } catch (error) {
            console.error('Failed to create company:', error);
            alert('Failed to create company: ' + error.message);
        }
    };

    const handleCreateCustomer = async () => {
        if (!newCustomerName.trim()) return;
        try {
            const newCustomer = await api.createCustomer({ name: newCustomerName.trim(), description: '' });
            setCustomers([...customers, newCustomer]);
            setFormData({ ...formData, customer: newCustomer.id });
            setNewCustomerName('');
            setShowCustomerModal(false);
        } catch (error) {
            console.error('Failed to create customer:', error);
            alert('Failed to create customer: ' + error.message);
        }
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;
        try {
            const newTag = await api.createTag({ name: newTagName.trim() });
            setTags([...tags, newTag]);
            setFormData({ ...formData, tags: [...formData.tags, newTag.name] });
            setNewTagName('');
            setShowTagModal(false);
        } catch (error) {
            console.error('Failed to create tag:', error);
            alert('Failed to create tag: ' + error.message);
        }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                date_of_execution: new Date(formData.date_of_execution).toISOString(),
            };

            if (task) {
                await api.updateTask(task.id, submitData);
            } else {
                await api.createTask(submitData);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('Failed to save task:', error);
            alert('Failed to save task: ' + error.message);
        }
    };

    if (!show) return null;

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="mb-0">{task ? 'Edit Task' : 'New Task'}</h2>
                        <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => setPreviewMode(!previewMode)}
                        >
                            {previewMode ? 'Edit Mode' : 'Preview MD'}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                disabled={previewMode}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            {previewMode ? (
                                <div className="form-textarea markdown-content" style={{ minHeight: '100px', overflowY: 'auto' }}>
                                    <ReactMarkdown>{formData.description}</ReactMarkdown>
                                </div>
                            ) : (
                                <textarea
                                    ref={textareaRef}
                                    className="form-textarea"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    style={{ minHeight: '100px', resize: 'vertical', overflow: 'hidden' }}
                                    required
                                />
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Date of Execution</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.date_of_execution}
                                onChange={(e) => setFormData({ ...formData, date_of_execution: e.target.value })}
                                disabled={previewMode}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Project *</label>
                            <select
                                className="form-select"
                                value={formData.project}
                                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                                required
                                disabled={previewMode}
                            >
                                <option value="">Select a project</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Company</label>
                            <div className="inline-create-field">
                                <select
                                    className="form-select"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    disabled={previewMode}
                                >
                                    <option value="">Select a company</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => setShowCompanyModal(true)}
                                    disabled={previewMode}
                                >
                                    + New
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Customer</label>
                            <div className="inline-create-field">
                                <select
                                    className="form-select"
                                    value={formData.customer}
                                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                    disabled={previewMode}
                                >
                                    <option value="">Select a customer</option>
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => setShowCustomerModal(true)}
                                    disabled={previewMode}
                                >
                                    + New
                                </button>
                            </div>
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
                                        disabled={previewMode}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleRemoveArrayField('pr_links', index)}
                                        disabled={previewMode}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleAddArrayField('pr_links')}
                                disabled={previewMode}
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
                                        disabled={previewMode}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleRemoveArrayField('important_links', index)}
                                        disabled={previewMode}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleAddArrayField('important_links')}
                                disabled={previewMode}
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
                                        disabled={previewMode}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleRemoveArrayField('cmd_commands', index)}
                                        disabled={previewMode}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleAddArrayField('cmd_commands')}
                                disabled={previewMode}
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
                                        disabled={previewMode}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleRemoveArrayField('saved_file_paths', index)}
                                        disabled={previewMode}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleAddArrayField('saved_file_paths')}
                                disabled={previewMode}
                            >
                                + Add File Path
                            </button>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Tags</label>
                            <div className="tags-selector-wrapper">
                                <div className="tags-selector">
                                    {tags.map((tag) => (
                                        <label key={tag.name} className="tag-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={formData.tags.includes(tag.name)}
                                                onChange={() => handleTagToggle(tag.name)}
                                                disabled={previewMode}
                                            />
                                            <span className="tag">{tag.name}</span>
                                        </label>
                                    ))}
                                    {tags.length === 0 && (
                                        <p className="text-muted text-small">No tags available. Create your first tag.</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => setShowTagModal(true)}
                                    disabled={previewMode}
                                >
                                    + New Tag
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                            <button type="submit" className="btn btn-primary">
                                {task ? 'Update' : 'Create'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Inline Company Creation Modal */}
            {showCompanyModal && (
                <div className="modal-overlay" onClick={() => setShowCompanyModal(false)}>
                    <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
                        <h3 className="mb-2">Create New Company</h3>
                        <div className="form-group">
                            <label className="form-label">Company Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newCompanyName}
                                onChange={(e) => setNewCompanyName(e.target.value)}
                                placeholder="Enter company name"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="btn btn-primary" onClick={handleCreateCompany}>
                                Create
                            </button>
                            <button className="btn btn-secondary" onClick={() => {
                                setShowCompanyModal(false);
                                setNewCompanyName('');
                            }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Inline Customer Creation Modal */}
            {showCustomerModal && (
                <div className="modal-overlay" onClick={() => setShowCustomerModal(false)}>
                    <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
                        <h3 className="mb-2">Create New Customer</h3>
                        <div className="form-group">
                            <label className="form-label">Customer Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newCustomerName}
                                onChange={(e) => setNewCustomerName(e.target.value)}
                                placeholder="Enter customer name"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="btn btn-primary" onClick={handleCreateCustomer}>
                                Create
                            </button>
                            <button className="btn btn-secondary" onClick={() => {
                                setShowCustomerModal(false);
                                setNewCustomerName('');
                            }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Inline Tag Creation Modal */}
            {showTagModal && (
                <div className="modal-overlay" onClick={() => setShowTagModal(false)}>
                    <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
                        <h3 className="mb-2">Create New Tag</h3>
                        <div className="form-group">
                            <label className="form-label">Tag Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                placeholder="e.g., python, backend, frontend"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="btn btn-primary" onClick={handleCreateTag}>
                                Create
                            </button>
                            <button className="btn btn-secondary" onClick={() => {
                                setShowTagModal(false);
                                setNewTagName('');
                            }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
