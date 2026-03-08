import React, { useState } from 'react'
import MapPanel from './components/map/MapPanel'
import Dashboard from './components/dashboard/Dashboard'

export default function App() {
  const [selected, setSelected] = useState(null)

  return (
    <div className="app-root">
      <div className="header">
        <div className="brand">LiveScape</div>
        <div className="muted">Remote Location Experience Preview</div>
      </div>

      <div className="panes">
        <div className="left">
          <MapPanel onPick={(lat,lng)=>setSelected({lat,lng})} />
        </div>
        <div className="right">
          <Dashboard location={selected} />
        </div>
      </div>
    </div>
  )
}
