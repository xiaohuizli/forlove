import './style.css'
import { StageApp } from './app/StageApp'

const root = document.querySelector<HTMLElement>('#app')

if (!root) {
  throw new Error('Missing app root')
}

new StageApp(root)
