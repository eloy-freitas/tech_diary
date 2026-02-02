import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Companies from './pages/Companies';
import Customers from './pages/Customers';
import Tags from './pages/Tags';
import ProjectView from './pages/ProjectView';
import Admin from './pages/Admin';
import './index.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/project-view" element={<ProjectView />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
