import axios from 'axios'

/**
 * Helper untuk mengekstrak pesan error dari berbagai tipe error
 * Bisa menangani AxiosError, Error biasa, dan tipe error unknown
 * @param err - Error object yang tidak diketahui tipenya
 * @returns Pesan error dalam string yang user friendly
 */
export function getErrorMessage(err: unknown): string {
  // Jika error dari Axios
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.message
  }
  // Jika error adalah instance Error standar
  if (err instanceof Error) {
    return err.message
  }
  // Fallback untuk tipe error lain
  return "Something went wrong"
}

/**
 * Type guard untuk memeriksa apakah error adalah AxiosError
 * @param err - Error object yang akan diperiksa
 * @returns Boolean true jika error adalah AxiosError
 */
export function isAxiosError(err: unknown): err is import('axios').AxiosError {
  return axios.isAxiosError(err)
}
