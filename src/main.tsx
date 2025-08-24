import 'preact/debug';
import { render } from 'preact';
import { App } from './App';
import { LocalizationProvider } from './contexts/LocalizationContext';
import './index.css';

render(
  <LocalizationProvider>
    <App />
  </LocalizationProvider>,
  document.getElementById('app')!
);
