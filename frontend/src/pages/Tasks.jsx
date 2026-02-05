import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../api/client';
import TaskModal from '../components/TaskModal';
import './Tasks.css';

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [expandedTask, setExpandedTask] = useState(null);
    const [taskComponents, setTaskComponents] = useState({});
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = newest first, 'asc' = oldest first

    // Sort tasks by updated_at or date_of_execution
    const sortedTasks = [...tasks].sort((a, b) => {
        const dateA = new Date(a.updated_at || a.date_of_execution);
        const dateB = new Date(b.updated_at || b.date_of_execution);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [tasksData, projectsData, companiesData, customersData, tagsData] = await Promise.all([
                api.getTasks(),
                api.getProjects(),
                api.getCompanies(),
                api.getCustomers(),
                api.getTags(),
            ]);
            setTasks(tasksData);
            setProjects(projectsData);
            setCompanies(companiesData);
            setCustomers(customersData);
            setTags(tagsData);
        } catch (error) {
            console.error('Failed to load data:', error);
            alert('Failed to load tasks. Make sure the backend is running.');
        } finally {
            setLoading(false);
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
        setEditingTask(task);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTask(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getProjectName = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        return project ? project.name : null;
    };

    const getCompanyName = (companyId) => {
        const company = companies.find(c => c.id === companyId);
        return company ? company.name : null;
    };

    const getCustomerName = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        return customer ? customer.name : null;
    };

    const handleExpandTask = async (taskId) => {
        if (expandedTask === taskId) {
            setExpandedTask(null);
        } else {
            setExpandedTask(taskId);
            // Load components for this task if not already loaded
            if (!taskComponents[taskId]) {
                try {
                    const components = await api.getTaskComponents(taskId);
                    setTaskComponents(prev => ({ ...prev, [taskId]: components }));
                } catch (error) {
                    console.error('Failed to load task components:', error);
                    setTaskComponents(prev => ({ ...prev, [taskId]: [] }));
                }
            }
        }
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        title={sortOrder === 'desc' ? 'Showing newest first - click for oldest first' : 'Showing oldest first - click for newest first'}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            {sortOrder === 'desc' ? (
                                <path d="M3.5 3.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 12.293V3.5zm4 .5a.5.5 0 0 1 0-1h1a.5.5 0 0 1 0 1h-1zm0 3a.5.5 0 0 1 0-1h3a.5.5 0 0 1 0 1h-3zm0 3a.5.5 0 0 1 0-1h5a.5.5 0 0 1 0 1h-5zM7 12.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7a.5.5 0 0 0-.5.5z" />
                            ) : (
                                <path d="M3.5 12.5a.5.5 0 0 1-1 0V3.707L1.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.497.497 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L3.5 3.707V12.5zm3.5-9a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z" />
                            )}
                        </svg>
                        {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => openModal()}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.6rem' }}
                        title="Create new task"
                    >
                        <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>+</span>
                        <span style={{ fontSize: '1.1rem', lineHeight: '1' }}>📋</span>
                    </button>
                </div>
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
                    {sortedTasks.map((task) => (
                        <div key={task.id} className="task-card card">
                            <div className="card-header">
                                <div className="flex-col" style={{ flex: 1 }}>
                                    <h3 className="card-title mb-0">{task.name}</h3>
                                    <div className="task-meta-dates" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.25rem' }}>
                                        <span className="task-date" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            Executed: {formatDate(task.date_of_execution)}
                                        </span>
                                        {task.updated_at && (
                                            <span className="task-updated-date" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                                Updated: {(() => {
                                                    const updateDate = new Date(task.updated_at);
                                                    const day = String(updateDate.getDate()).padStart(2, '0');
                                                    const month = String(updateDate.getMonth() + 1).padStart(2, '0');
                                                    const year = updateDate.getFullYear();
                                                    const hours = String(updateDate.getHours()).padStart(2, '0');
                                                    const minutes = String(updateDate.getMinutes()).padStart(2, '0');
                                                    const seconds = String(updateDate.getSeconds()).padStart(2, '0');
                                                    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                                                })()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1" style={{ alignItems: 'center' }}>
                                    <button
                                        className={`btn btn-sm ${expandedTask === task.id ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => handleExpandTask(task.id)}
                                        style={{ padding: '0.3rem 0.4rem', pointerEvents: 'auto' }}
                                        title={expandedTask === task.id ? 'Collapse details' : 'Expand details'}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                                        </svg>
                                    </button>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => openModal(task)}
                                        style={{ padding: '0.3rem 0.4rem' }}
                                        title="Edit task"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                        </svg>
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(task.id)}
                                        style={{ padding: '0.3rem 0.4rem' }}
                                        title="Delete task"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="mb-2 markdown-content">
                                    <ReactMarkdown>{task.description}</ReactMarkdown>
                                </div>

                                {(task.project || task.company || task.customer) && (
                                    <div className="project-meta mb-2">
                                        {task.project && (
                                            <div className="meta-item">
                                                <span className="meta-label">📁 Project:</span>
                                                <span className="meta-value">{getProjectName(task.project) || 'Unknown'}</span>
                                            </div>
                                        )}
                                        {task.company && (
                                            <div className="meta-item">
                                                <span className="meta-label">🏢 Company:</span>
                                                <span className="meta-value">{getCompanyName(task.company) || 'Unknown'}</span>
                                            </div>
                                        )}
                                        {task.customer && (
                                            <div className="meta-item">
                                                <span className="meta-label">👥 Customer:</span>
                                                <span className="meta-value">{getCustomerName(task.customer) || 'Unknown'}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {task.tags && task.tags.length > 0 && (
                                    <div className="tags-container mb-2">
                                        {task.tags.map((tag) => (
                                            <span key={tag} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                )}

                                {expandedTask === task.id && (
                                    <div className="task-details">
                                        {taskComponents[task.id] && taskComponents[task.id].length > 0 && (
                                            <div className="detail-section">
                                                {taskComponents[task.id].map((component, i) => (
                                                    <div key={i} style={{ marginBottom: '1rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '0.75rem' }}>
                                                        {component.component_type === 'text_area' ? (
                                                            <div className="markdown-content" style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
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
                                                        ) : (
                                                            <pre style={{ background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '4px', overflow: 'auto' }}>
                                                                <code>{component.component_value}</code>
                                                            </pre>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <TaskModal
                show={showModal}
                task={editingTask}
                onClose={closeModal}
                onSave={loadData}
                projects={projects}
                companies={companies}
                setCompanies={setCompanies}
                customers={customers}
                setCustomers={setCustomers}
                tags={tags}
                setTags={setTags}
            />
        </div>
    );
}
