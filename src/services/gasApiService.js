// src/services/gasApiService.js

// !!! วาง URL ที่คัดลอกมาจากการ Deploy GAS Web App ที่นี่ !!!
const API_URL =
  'https://script.google.com/macros/s/AKfycbwHc9U41AhZ8DgXYuUGCRZxuAbvxkuAm3tN1nDCd9YbmgHOsc8x7fVE57g8k-YzgIaR/exec'

async function callGasApi(action, params = {}) {
  const url = new URL(API_URL)
  url.searchParams.append('action', action)
  for (const key in params) {
    url.searchParams.append(key, params[key])
  }

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    if (result.status === 'success') {
      return result.data
    } else {
      throw new Error(result.message || 'An unknown error occurred in the API.')
    }
  } catch (error) {
    console.error(`Error calling GAS API action "${action}":`, error)
    throw error
  }
}

export const getAvailableYears = () => callGasApi('getYears')
export const getDashboardData = (yearSuffix) => callGasApi('getData', { year: yearSuffix })
