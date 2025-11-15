<template>
    <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div style="font-weight:700;color:#EAF8D3">อันดับยามูลค่าชดเชยสูงสุด</div>
            <div style="font-size:0.85rem;color:var(--muted)">{{ lastUpdated }}</div>
        </div>
        <div class="compact-list">
            <div v-if="isLoading" style="color:var(--muted);font-size:0.9rem">กำลังโหลดรายการ...</div>
            <div v-else-if="!listData || listData.length === 0" style="color:var(--muted)">ไม่มีข้อมูล</div>
            <template v-else>
                <div v-for="(item, index) in listData" :key="item[0]" class="list-item">
                    <div class="item-left">
                        <div style="width:36px;height:36px;border-radius:8px;background:linear-gradient(180deg, rgba(132,204,22,0.12), transparent);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--accent)">
                            {{ index + 1 }}
                        </div>
                        <div>
                            <div style="font-weight:700;color:#EAF8D3">{{ item[0] }}</div>
                            <div style="font-size:0.85rem;color:var(--muted)">{{ formatCurrency(item[1]) }}</div>
                        </div>
                    </div>
                    <div class="pill">{{ (item[1] / 1000).toFixed(0) }}k</div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
defineProps({
    listData: Array,
    isLoading: Boolean,
    lastUpdated: String
});

const formatCurrency = (value) => {
    return (Number(value) || 0).toLocaleString('th-TH', { style: 'currency', currency: 'THB' });
};
</script>