import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/landing/Landing'
import AboutUs from './pages/landing/AboutUs'
import Contact from './pages/landing/Contact'
import Home from './pages/Dashboard/Home'
import CreateSplit from './pages/split/CreateSplit'
import ScanBill from './pages/split/ScanBill'
import ReadyToSplit from './pages/split/ReadyToSplit'
import JoinedParticipants from './pages/split/JoinedParticipants'
import SplitBreakdown from './pages/split/SplitBreakdown'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/split/create" element={<CreateSplit />} />
          <Route path="/split/scan" element={<ScanBill />} />
          <Route path="/split/ready" element={<ReadyToSplit />} />
          <Route path="/split/joined" element={<JoinedParticipants />} />
          <Route path="/split/breakdown" element={<SplitBreakdown />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
