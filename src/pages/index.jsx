import Layout from "./Layout.jsx";

import Landing from "./Landing";

import Setup from "./Setup";

import Simulation from "./Simulation";

import FormulaEDashboard from "./FormulaEDashboard";

import MotoGPDashboard from "./MotoGPDashboard";

import DroneDashboard from "./DroneDashboard";

import SupplyChainDashboard from "./SupplyChainDashboard";

import TrafficDashboard from "./TrafficDashboard";

import MechanicalDashboard from "./MechanicalDashboard";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Landing: Landing,
    
    Setup: Setup,
    
    Simulation: Simulation,
    
    FormulaEDashboard: FormulaEDashboard,
    
    MotoGPDashboard: MotoGPDashboard,
    
    DroneDashboard: DroneDashboard,
    
    SupplyChainDashboard: SupplyChainDashboard,
    
    TrafficDashboard: TrafficDashboard,
    
    MechanicalDashboard: MechanicalDashboard,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Landing />} />
                
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/Setup" element={<Setup />} />
                
                <Route path="/Simulation" element={<Simulation />} />
                
                <Route path="/FormulaEDashboard" element={<FormulaEDashboard />} />
                
                <Route path="/MotoGPDashboard" element={<MotoGPDashboard />} />
                
                <Route path="/DroneDashboard" element={<DroneDashboard />} />
                
                <Route path="/SupplyChainDashboard" element={<SupplyChainDashboard />} />
                
                <Route path="/TrafficDashboard" element={<TrafficDashboard />} />
                
                <Route path="/MechanicalDashboard" element={<MechanicalDashboard />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}