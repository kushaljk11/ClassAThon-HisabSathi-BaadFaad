import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/landing/Landing'
import AboutUs from './pages/landing/AboutUs'
import Contact from './pages/landing/Contact'
import Home from './pages/dashboard/Home'
import CreateSplit from './pages/split/CreateSplit'
import ReadyToSplit from './pages/split/ReadyToSplit'

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
          <Route path="/split/ready" element={<ReadyToSplit />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
