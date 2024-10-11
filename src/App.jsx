import { useState } from 'react'
import { RetroImageGenerator } from './components/RetroImageGenerator'
import { Artmind } from './components/Artmind'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <RetroImageGenerator />
      {/* <Artmind /> */}
    </>
  )
}

export default App
