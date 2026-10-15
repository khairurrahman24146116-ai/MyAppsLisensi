<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Dapatkan Lisensi</h1>
      <p class="text-gray-600 mb-6">Masukkan nomor pesanan Anda</p>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <input
            v-model="orderNumber"
            type="text"
            placeholder="Cth: ORD-2024-001"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
        >
          {{ loading ? "Memproses..." : "Dapatkan Lisensi" }}
        </button>
      </form>

      <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
        {{ error }}
      </div>

      <div v-if="result" class="mt-4 space-y-3">
        <div class="p-3 bg-blue-50 border border-blue-200 rounded">
          <p class="text-sm text-gray-600">Status</p>
          <p class="text-lg font-semibold text-blue-600">{{ result.status }}</p>
        </div>

        <div v-if="result.license_code" class="p-3 bg-green-50 border border-green-200 rounded">
          <p class="text-sm text-gray-600">Kode Lisensi</p>
          <div class="flex items-center justify-between mt-1">
            <p class="text-lg font-mono font-semibold text-green-600">{{ result.license_code }}</p>
            <button
              @click="copyCode"
              class="ml-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition"
            >
              Salin
            </button>
          </div>
        </div>

        <div v-if="result.message" class="text-sm text-gray-600">{{ result.message }}</div>

        <button
          @click="reset"
          class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition"
        >
          Input Pesanan Lain
        </button>
      </div>

      <div class="mt-6 text-center">
        <button
          @click="goToAdmin"
          class="text-sm text-blue-600 hover:text-blue-700 underline"
        >
          Admin
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";

export default {
  setup() {
    const orderNumber = ref("");
    const loading = ref(false);
    const error = ref("");
    const result = ref(null);
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const submit = async () => {
      error.value = "";
      result.value = null;
      loading.value = true;

      try {
        const res = await axios.post(`${apiUrl}/api/lisensi`, { order_number: orderNumber.value });
        result.value = res.data;
      } catch (err) {
        error.value = err.response?.data?.message || "Terjadi kesalahan";
      } finally {
        loading.value = false;
      }
    };

    const copyCode = () => {
      navigator.clipboard.writeText(result.value.license_code);
      alert("Kode lisensi disalin!");
    };

    const reset = () => {
      orderNumber.value = "";
      result.value = null;
      error.value = "";
    };

    const goToAdmin = () => {
      window.location.hash = "#admin";
    };

    return { orderNumber, loading, error, result, submit, copyCode, reset, goToAdmin };
  },
};
</script>
