import axios from 'axios'

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.message
  }
  if (err instanceof Error) {
    return err.message
  }
  return "Something went wrong"
}

export function isAxiosError(err: unknown): err is import('axios').AxiosError {
  return axios.isAxiosError(err)
}
