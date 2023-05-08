import App from './App'
import './App.css'
import { DataProvider } from './components/DataContext'
import { ChakraProvider } from '@chakra-ui/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider>
      <DataProvider>
        <App />
      </DataProvider>
    </ChakraProvider>
  </StrictMode>,
)
