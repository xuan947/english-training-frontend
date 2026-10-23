// src/api/http.ts
import axios from 'axios'

export const http = axios.create({
  baseURL: '',
  timeout: 500000,
})


http.interceptors.request.use((config) => {
  // e.g. attach token
  return config
})

http.interceptors.response.use(
  (res) => res,
  (err) => {
    // e.g. global error handler
    return Promise.reject(err)
  },
)
