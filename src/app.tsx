import React from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./pages/Layout";
import Projects from "./pages/Projects";
import Project from "./pages/Project";
import Chapter from "./pages/Chapter";

const root = createRoot(document.body);
root.render(
    <Router>
        <Routes>
            <Route path="/" element={<Layout/>}>
                <Route path="/" element={<Home/>}/>
                <Route path="/projects" element={<Projects/>}/>
                <Route path="/projects/:project_id" element={<Project/>}/>
                <Route path="/projects/:project_id/chapters/:chapter_id" element={<Chapter/>}/>
            </Route>
        </Routes>
    </Router>);