import { useState, useEffect, useMemo } from 'react';
import api from '../api/client';
import TaskModal from '../components/TaskModal';
import './ProjectView.css';

export default function ProjectView() {
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // UI state
    const [expandedTasks, setExpandedTasks] = useState(new Set());
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [projectsData, companiesData, customersData, tagsData] = await Promise.all([
                api.getProjects(),
                api.getCompanies(),
                api.getCustomers(),
                api.getTags()
            ]);
            setProjects(projectsData);
            setCompanies(companiesData);
            setCustomers(customersData);
            setTags(tagsData);

            if (projectsData.length > 0) {
                setSelectedProjectId(projectsData[0].id);
            }
        } catch (error) {
            console.error('Failed to load initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedProjectId) {
            loadTasks();
        } else {
            setTasks([]);
        }
    }, [selectedProjectId]);

    const loadTasks = async () => {
        try {
            const allTasks = await api.getTasks();
            setTasks(allTasks.filter(t => t.project === selectedProjectId));
        } catch (error) {
            console.error('Failed to load tasks:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.deleteTask(taskId);
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (error) {
            console.error('Failed to delete task:', error);
            alert('Failed to delete task.');
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

    const toggleExpand = (taskId) => {
        setExpandedTasks(prev => {
            const next = new Set(prev);
            if (next.has(taskId)) {
                next.delete(taskId);
            } else {
                next.add(taskId);
            }
            return next;
        });
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesCustomer = !selectedCustomerId || task.customer === selectedCustomerId;
            const matchesTag = !selectedTag || (task.tags && task.tags.includes(selectedTag));
            const matchesKeyword = !searchKeyword ||
                task.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                task.description.toLowerCase().includes(searchKeyword.toLowerCase());

            const taskDate = task.date_of_execution.split('T')[0];
            const matchesDateFrom = !dateFrom || taskDate >= dateFrom;
            const matchesDateTo = !dateTo || taskDate <= dateTo;

            return matchesCustomer && matchesTag && matchesKeyword && matchesDateFrom && matchesDateTo;
        });
    }, [tasks, selectedCustomerId, selectedTag, searchKeyword, dateFrom, dateTo]);

    // Group tasks by date
    const tasksByDate = useMemo(() => {
        const grouped = {};
        filteredTasks.forEach(task => {
            const date = task.date_of_execution.split('T')[0];
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(task);
        });

        // Sort dates
        return Object.keys(grouped).sort().reduce((acc, date) => {
            acc[date] = grouped[date];
            return acc;
        }, {});
    }, [filteredTasks]);

    const formatDate = (dateString) => {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
    };

    if (loading) return <div className="loading">Loading dashboard...</div>;

    return (
        <div className="project-view-container fade-in">
            <header className="view-header">
                <div style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title">Project Visualization</h1>
                        <p className="page-subtitle">Chronological matrix of your achievements</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        + New Task
                    </button>
                </div>

                <div className="project-selector-wrapper">
                    <label>Project:</label>
                    <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="form-select"
                    >
                        <option value="">Select Project</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </header>

            <div className="filter-bar card">
                <div className="filter-group">
                    <label>From:</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="form-input" />
                </div>
                <div className="filter-group">
                    <label>To:</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="form-input" />
                </div>
                <div className="filter-group">
                    <label>Customer:</label>
                    <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} className="form-select">
                        <option value="">All Customers</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Tag:</label>
                    <select value={selectedTag} onChange={e => setSelectedTag(e.target.value)} className="form-select">
                        <option value="">All Tags</option>
                        {tags.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                    </select>
                </div>
                <div className="filter-group keyword-search">
                    <label>Search:</label>
                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={e => setSearchKeyword(e.target.value)}
                        placeholder="Keywords..."
                        className="form-input"
                    />
                </div>
            </div>

            <div className="matrix-viewport">
                {Object.keys(tasksByDate).length === 0 ? (
                    <div className="empty-dashboard">
                        <p>No tasks found for the selected filters.</p>
                    </div>
                ) : (
                    <div className="matrix-board">
                        {Object.entries(tasksByDate).map(([date, dateTasks]) => (
                            <div key={date} className="date-column">
                                <div className="column-header">
                                    <span className="date-label">{formatDate(date)}</span>
                                    <span className="task-count">{dateTasks.length}</span>
                                </div>
                                <div className="task-stack">
                                    {dateTasks.map(task => (
                                        <div key={task.id} className={`task-matrix-card ${expandedTasks.has(task.id) ? 'expanded' : ''}`}>
                                            <div className="card-mini-content">
                                                <h4 className="task-name">{task.name}</h4>
                                                <div className="card-actions">
                                                    <button onClick={() => toggleExpand(task.id)} className="btn btn-sm btn-secondary">
                                                        {expandedTasks.has(task.id) ? 'Collapse' : 'Expand'}
                                                    </button>
                                                    <button onClick={() => openModal(task)} className="btn btn-sm btn-secondary">
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteTask(task.id)} className="btn btn-sm btn-danger">
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>

                                            {expandedTasks.has(task.id) && (
                                                <div className="card-full-content animate-slide-down">
                                                    <p className="task-desc">{task.description}</p>
                                                    {task.tags && task.tags.length > 0 && (
                                                        <div className="card-tags">
                                                            {task.tags.map(tag => <span key={tag} className="tag tag-sm">{tag}</span>)}
                                                        </div>
                                                    )}
                                                    {task.pr_links && task.pr_links.length > 0 && (
                                                        <div className="card-links">
                                                            <strong>PRs:</strong>
                                                            {task.pr_links.map((link, i) => (
                                                                <a key={i} href={link} target="_blank" rel="noreferrer" className="link-icon">🔗</a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <TaskModal
                show={showModal}
                task={editingTask}
                onClose={closeModal}
                onSave={loadTasks}
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
