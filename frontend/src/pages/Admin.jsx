import React, { useState } from 'react';

const Admin = () => {
    const [importFile, setImportFile] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const handleTruncate = async () => {
        if (!window.confirm("ARE YOU SURE? This will delete ALL data!")) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/admin/truncate`, {
                method: 'POST'
            });
            if (response.ok) setMessage('Database truncated successfully.');
            else setMessage('Error truncating database.');
        } catch (error) {
            setMessage('Error connecting to server.');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format) => {
        setLoading(true);
        try {
            if (format === 'json') {
                const response = await fetch(`${API_URL}/api/admin/export?format=json`);
                if (!response.ok) {
                    const err = await response.json().catch(() => ({ detail: response.statusText }));
                    throw new Error(err.detail || 'Failed to export JSON');
                }
                const data = await response.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `tech_diary_backup_${new Date().toISOString()}.json`;
                a.click();
            } else {
                const response = await fetch(`${API_URL}/api/admin/export?format=sql`);
                if (!response.ok) {
                    const err = await response.json().catch(() => ({ detail: response.statusText }));
                    throw new Error(err.detail || 'Failed to export SQL');
                }
                const data = await response.json();

                // data.data contains the SQL dump string
                if (!data.data) {
                    throw new Error('No data received from server');
                }

                const blob = new Blob([data.data], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = data.filename || `backup_${Date.now()}.sql`;
                a.click();
            }
            setMessage('Export started.');
        } catch (error) {
            setMessage('Error exporting data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (format) => {
        if (!importFile) {
            setMessage('Please select a file first.');
            return;
        }
        if (!window.confirm("This might overwrite existing data. Continue?")) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', importFile);

        try {
            const response = await fetch(`${API_URL}/api/admin/import?format=${format}`, {
                method: 'POST',
                body: formData
            });
            if (response.ok) setMessage('Import successful.');
            else {
                const err = await response.json();
                setMessage('Error importing: ' + err.detail);
            }
        } catch (error) {
            setMessage('Error connecting to server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Admin / Settings</h1>
            {message && <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>{message}</div>}

            <div style={{ marginBottom: '40px' }}>
                <h2>Danger Zone</h2>
                <button
                    onClick={handleTruncate}
                    style={{ backgroundColor: '#ff4444', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    disabled={loading}
                >
                    Truncate Database (Clear All Data)
                </button>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h2>Export Data</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleExport('json')} disabled={loading}>Export as JSON</button>
                    <button onClick={() => handleExport('sql')} disabled={loading}>Export as SQL Dump</button>
                </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h2>Import Data</h2>
                <div style={{ marginBottom: '10px' }}>
                    <input type="file" onChange={(e) => setImportFile(e.target.files[0])} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleImport('json')} disabled={loading}>Import JSON</button>
                    <button onClick={() => handleImport('sql')} disabled={loading}>Import SQL Dump</button>
                </div>
            </div>
        </div>
    );
};

export default Admin;
