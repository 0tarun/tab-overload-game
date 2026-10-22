import { GameProvider } from './game/GameProvider'
import { GameContainer } from './components/GameContainer'

export default function App() {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  )
}
