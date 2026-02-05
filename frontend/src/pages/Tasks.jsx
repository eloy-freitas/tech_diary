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
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
