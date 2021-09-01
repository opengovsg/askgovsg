import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import ScrollToTop from './components/ScrollToTop/ScrollToTop.component'

import App from './App'

const queryClient = new QueryClient()

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* ReactQueryDevtools will not appear in production builds */}
      <ReactQueryDevtools initialIsOpen={false} />
      <BrowserRouter>
        <ScrollToTop />
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)
