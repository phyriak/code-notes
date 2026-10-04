import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
} from 'react-router-dom';

import Home from './pages/Home';
import Article from './pages/Article';
import NewArticle from './pages/NewArticle';
import { getCategories } from './api/articles';


function App() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
  async function fetchCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  }

  fetchCategories();
}, []);

  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-mark">&lt;/&gt;</div>

            <div>
              <div className="logo-title">Code Notes</div>
              <div className="logo-subtitle">Knowledge base</div>
            </div>
          </div>

          <nav className="navigation">
            <div className="nav-section-title">NOTES</div>

            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              All notes
            </NavLink>

            {categories.map((category) => (
              <NavLink
                key={category}
                to={`/?category=${encodeURIComponent(category)}`}
                className="nav-link"
              >
                {category}
              </NavLink>
            ))}

          </nav>

          <div className="sidebar-bottom">
            <NavLink to="/articles/new" className="new-article">
              <span>+</span>
              New article
            </NavLink>
          </div>
        </aside>

        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/articles/new"
              element={<NewArticle />}
            />

            <Route
              path="/articles/:id"
              element={<Article />}
            />

            <Route
              path="/articles/:id/edit"
              element={<NewArticle />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;