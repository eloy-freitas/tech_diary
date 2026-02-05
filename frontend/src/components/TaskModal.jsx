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
        tags: [],
        date_of_execution: new Date().toISOString().split('T')[0],
        project: '',
        company: '',
        customer: '',
    });

    const [components, setComponents] = useState([]);
    const [newComponentType, setNewComponentType] = useState('text_area');

    const [previewMode, setPreviewMode] = useState(false);
    const [showComponentHelp, setShowComponentHelp] = useState(false);
    const textareaRef = useRef(null);

    // Helper function to get component type icon
    const getComponentIcon = (type) => {
        switch (type) {
            case 'text_area':
                return (
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                        <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z" />
                    </svg>
                );
            case 'link':
                return (
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />
                        <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />
                    </svg>
                );
            case 'command':
                return (
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5z" />
                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2z" />
                    </svg>
                );
            case 'code_snippet':
                return (
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294l4-13zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0zm6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const getComponentTypeName = (type) => {
        const names = {
            'text_area': 'Text Area',
            'link': 'Link',
            'command': 'Command',
            'code_snippet': 'Code Snippet'
        };
        return names[type] || type;
    };

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
        const loadTaskData = async () => {
            if (task) {
                setFormData({
                    name: task.name || '',
                    description: task.description || '',
                    tags: task.tags || [],
                    date_of_execution: task.date_of_execution ? task.date_of_execution.split('T')[0] : new Date().toISOString().split('T')[0],
                    project: task.project || '',
                    company: task.company || '',
                    customer: task.customer || '',
                });
                // Load components
                try {
                    const taskComponents = await api.getTaskComponents(task.id);
                    setComponents(taskComponents);
                } catch (error) {
                    console.error('Failed to load components:', error);
                    setComponents([]);
                }
            } else {
                setFormData({
                    name: '',
                    description: '',
                    tags: [],
                    date_of_execution: new Date().toISOString().split('T')[0],
                    project: '',
                    company: '',
                    customer: '',
                });
                setComponents([]);
            }
            setPreviewMode(false);
        };
        loadTaskData();
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



    const handleAddComponent = () => {
        const newComponent = {
            component_type: newComponentType,
            component_value: '',
            component_sequence: components.length,
            isNew: true // Flag to identify unsaved components
        };
        setComponents([...components, newComponent]);
    };

    const handleComponentChange = (index, value) => {
        setComponents(prev => prev.map((comp, i) =>
            i === index ? { ...comp, component_value: value } : comp
        ));
    };

    const handleRemoveComponent = async (index) => {
        const component = components[index];
        if (component.component_id && task) {
            try {
                await api.deleteTaskComponent(task.id, component.component_id);
            } catch (error) {
                console.error('Failed to delete component:', error);
            }
        }
        setComponents(prev => prev.filter((_, i) => i !== index));
    };

    const handleMoveComponentUp = (index) => {
        if (index === 0) return;
        setComponents(prev => {
            const newComponents = [...prev];
            [newComponents[index - 1], newComponents[index]] = [newComponents[index], newComponents[index - 1]];
            return newComponents;
        });
    };

    const handleMoveComponentDown = (index) => {
        if (index === components.length - 1) return;
        setComponents(prev => {
            const newComponents = [...prev];
            [newComponents[index], newComponents[index + 1]] = [newComponents[index + 1], newComponents[index]];
            return newComponents;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                date_of_execution: new Date(formData.date_of_execution).toISOString(),
            };

            let taskId;
            if (task) {
                await api.updateTask(task.id, submitData);
                taskId = task.id;
            } else {
                const newTask = await api.createTask(submitData);
                taskId = newTask.id;
            }

            // Save components
            for (let i = 0; i < components.length; i++) {
                const comp = components[i];
                const componentData = {
                    component_type: comp.component_type,
                    component_value: comp.component_value,
                    component_sequence: i
                };

                if (comp.isNew) {
                    await api.createTaskComponent(taskId, componentData);
                } else if (comp.component_id) {
                    await api.updateTaskComponent(taskId, comp.component_id, componentData);
                }
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

                        {/* Reordered fields: Date, Project, Company, Customer, Tags */}
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
                            <label className="form-label">Tags</label>
                            <div className="tags-selector-wrapper">
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    {tags.map((tag) => (
                                        <label key={tag.name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.tags.includes(tag.name)}
                                                onChange={() => handleTagToggle(tag.name)}
                                                disabled={previewMode}
                                            />
                                            <span>{tag.name}</span>
                                        </label>
                                    ))}
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


                        {/* Dynamic Components */}
                        <div className="form-group">
                            {components.map((component, index) => (
                                <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                                    {/* Component type icon */}
                                    <div
                                        style={{ padding: '4px', display: 'flex', alignItems: 'center' }}
                                        title={getComponentTypeName(component.component_type)}
                                    >
                                        {getComponentIcon(component.component_type)}
                                    </div>

                                    {/* Reorder buttons */}
                                    {!previewMode && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => handleMoveComponentUp(index)}
                                                disabled={index === 0}
                                                style={{ padding: '2px 6px', lineHeight: '1' }}
                                                title="Move up"
                                            >
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                                                    <path d="M6 3L2 7h8L6 3z" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => handleMoveComponentDown(index)}
                                                disabled={index === components.length - 1}
                                                style={{ padding: '2px 6px', lineHeight: '1' }}
                                                title="Move down"
                                            >
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                                                    <path d="M6 9L2 5h8L6 9z" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}

                                    {/* Component content */}
                                    <div style={{ flex: 1 }}>
                                        {previewMode ? (
                                            component.component_type === 'text_area' ? (
                                                <div className="form-textarea markdown-content" style={{ minHeight: '60px', overflowY: 'auto' }}>
                                                    <ReactMarkdown>{component.component_value}</ReactMarkdown>
                                                </div>
                                            ) : component.component_type === 'link' ? (
                                                <a href={component.component_value} target="_blank" rel="noopener noreferrer" className="link">
                                                    {component.component_value}
                                                </a>
                                            ) : component.component_type === 'command' ? (
                                                <code className="command" style={{ display: 'block', padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                                                    {component.component_value}
                                                </code>
                                            ) : component.component_type === 'code_snippet' ? (
                                                <pre style={{ background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '4px', overflow: 'auto' }}>
                                                    <code>{component.component_value}</code>
                                                </pre>
                                            ) : (
                                                <span>{component.component_value}</span>
                                            )
                                        ) : (
                                            component.component_type === 'text_area' || component.component_type === 'code_snippet' ? (
                                                <textarea
                                                    className="form-textarea"
                                                    value={component.component_value}
                                                    onChange={(e) => handleComponentChange(index, e.target.value)}
                                                    placeholder={component.component_type === 'code_snippet' ? 'Enter code snippet...' : 'Enter text...'}
                                                    style={{ minHeight: '80px' }}
                                                />
                                            ) : (
                                                <input
                                                    type={component.component_type === 'link' ? 'url' : 'text'}
                                                    className="form-input"
                                                    value={component.component_value}
                                                    onChange={(e) => handleComponentChange(index, e.target.value)}
                                                    placeholder={component.component_type === 'link' ? 'https://...' : 'Enter command...'}
                                                />
                                            )
                                        )}
                                    </div>

                                    {/* Remove button - vertically centered */}
                                    {!previewMode && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleRemoveComponent(index)}
                                            style={{ alignSelf: 'center', padding: '4px 8px' }}
                                            title="Remove component"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}

                            {!previewMode && (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <select
                                        className="form-select"
                                        value={newComponentType}
                                        onChange={(e) => setNewComponentType(e.target.value)}
                                        style={{ flex: '0 0 200px' }}
                                    >
                                        <option value="text_area">Text Area</option>
                                        <option value="link">Link</option>
                                        <option value="command">Command</option>
                                        <option value="code_snippet">Code Snippet</option>
                                    </select>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-secondary"
                                        onClick={handleAddComponent}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                                        </svg>
                                        Add Component
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => setShowComponentHelp(!showComponentHelp)}
                                        style={{ padding: '4px 8px' }}
                                        title="Component types help"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                            <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {showComponentHelp && (
                                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '0.875rem' }}>
                                    <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Component Types:</div>
                                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {getComponentIcon('text_area')}
                                            <span><strong>Text Area:</strong> Free-form text with markdown support</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {getComponentIcon('link')}
                                            <span><strong>Link:</strong> URL that becomes a clickable link</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {getComponentIcon('command')}
                                            <span><strong>Command:</strong> Terminal command with code styling</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {getComponentIcon('code_snippet')}
                                            <span><strong>Code Snippet:</strong> Multi-line code block</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 mt-3">
                            <button type="submit" className="btn btn-primary">
                                {task ? 'Update' : 'Create'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setPreviewMode(!previewMode)}
                                style={{ marginLeft: 'auto' }}
                            >
                                {previewMode ? 'Edit' : 'Preview MD'}
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
