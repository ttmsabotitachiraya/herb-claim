// src/stores/dashboardStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getAvailableYears, getDashboardData } from '@/services/gasApiService';

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const years = ref([]);
  const selectedYearSuffix = ref(null);
  const dashboardData = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const statusMessage = ref('ไม่ได้โหลดข้อมูล');

  // Getters (Computed)
  const selectedYearText = computed(() => {
    const foundYear = years.value.find(y => y.suffix === selectedYearSuffix.value);
    return foundYear ? foundYear.year : '';
  });

  // Actions
  async function fetchYears() {
    isLoading.value = true;
    error.value = null;
    statusMessage.value = 'กำลังโหลดรายการปี...';
    try {
      const data = await getAvailableYears();
      if (data && data.length > 0) {
        years.value = data;
        selectedYearSuffix.value = data[0].suffix; // เลือกปีล่าสุดเป็นค่าเริ่มต้น
      } else {
        throw new Error("ไม่พบชีตข้อมูลปี (HerbalDrugXX)");
      }
    } catch (e) {
      error.value = e.message;
      statusMessage.value = 'เกิดข้อผิดพลาดในการโหลดปี';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchDataForYear() {
    if (!selectedYearSuffix.value) return;
    
    isLoading.value = true;
    error.value = null;
    dashboardData.value = null; // Clear old data
    statusMessage.value = `กำลังโหลดข้อมูลปี ${selectedYearText.value}...`;
    try {
      const data = await getDashboardData(selectedYearSuffix.value);
      dashboardData.value = data;
      statusMessage.value = 'โหลดข้อมูลสำเร็จ';
    } catch (e) {
      error.value = e.message;
      dashboardData.value = null;
      statusMessage.value = 'เกิดข้อผิดพลาด';
    } finally {
      isLoading.value = false;
    }
  }

  return {
    // state
    years,
    selectedYearSuffix,
    dashboardData,
    isLoading,
    error,
    statusMessage,
    // getters
    selectedYearText,
    // actions
    fetchYears,
    fetchDataForYear,
  };
});