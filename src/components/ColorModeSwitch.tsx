import { Switch, useColorMode } from '@chakra-ui/react'

export function ColorModeSwitch() {
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    <div className='flex items-center justify-end gap-2 p-1'>
      <p>{colorMode} color mode</p>
      <Switch isChecked={colorMode === 'dark'} onChange={toggleColorMode} />
    </div>
  )
}
