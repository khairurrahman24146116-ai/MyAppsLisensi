<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div v-if="!token" class="flex items-center justify-center min-h-screen p-4">
      <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Admin Login</h1>
        <form @submit.prevent="login" class="space-y-4">
          <input
            v-model="password"
            type="password"
            placeholder="Password Admin"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg"
          >
            {{ loading ? "Login..." : "Login" }}
          </button>
        </form>
        <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {{ error }}
        </div>
        <div class="mt-6 text-center">
          <button @click="goToUser" class="text-sm text-blue-600 hover:text-blue-700 underline">
            Kembali ke User
          </button>
        </div>
      </div>
    </div>

    <div v-else class="min-h-screen">
      <header class="bg-white shadow sticky top-0 z-10">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Admin Lisensi</h1>
            <span v-if="pendingCount > 0" class="inline-block mt-1 px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
              ({{ pendingCount }}) Request Baru
            </span>
          </div>
          <button @click="logout" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
            Logout
          </button>
        </div>
      </header>

      <main class="max-w-7xl mx-auto p-4">
        <div class="mb-6 flex gap-2">
          <button
            v-for="s in ['semua', 'pending', 'approved', 'rejected']"
            :key="s"
            @click="filter = s"
            :class="[
              'px-4 py-2 rounded-lg font-semibold transition',
              filter === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            {{ s.charAt(0).toUpperCase() + s.slice(1) }}
          </button>
        </div>

        <div class="bg-white rounded-lg shadow overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Pesanan</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nama</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Waktu</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="req in filteredRequests"
                :key="req.id"
                :class="['border-b', req.is_seen === 0 ? 'bg-yellow-50' : 'hover:bg-gray-50']"
              >
                <td class="px-6 py-4 text-sm font-mono">
                  {{ req.order_number }}
                  <span v-if="req.is_seen === 0" class="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                    BARU
                  </span>
                </td>
                <td class="px-6 py-4 text-sm">{{ req.customer_name }}</td>
                <td class="px-6 py-4 text-sm">{{ req.email }}</td>
                <td class="px-6 py-4 text-sm">
                  <span
                    :class="[
                      'px-2 py-1 rounded text-xs font-semibold',
                      req.status === 'pending' && 'bg-yellow-100 text-yellow-700',
                      req.status === 'approved' && 'bg-green-100 text-green-700',
                      req.status === 'rejected' && 'bg-red-100 text-red-700'
                    ]"
                  >
                    {{ req.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(req.created_at) }}</td>
                <td class="px-6 py-4 text-sm space-x-2">
                  <button
                    v-if="req.status === 'pending'"
                    @click="approve(req.id)"
                    class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition"
                  >
                    Setujui
                  </button>
                  <button
                    v-if="req.status === 'pending'"
                    @click="reject(req.id)"
                    class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition"
                  >
                    Tolak
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";
import axios from "axios";

export default {
  setup() {
    const password = ref("");
    const token = ref(localStorage.getItem("adminToken"));
    const loading = ref(false);
    const error = ref("");
    const requests = ref([]);
    const filter = ref("semua");
    const pendingCount = ref(0);
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    let pollInterval;

    const filteredRequests = computed(() => {
      if (filter.value === "semua") return requests.value;
      return requests.value.filter((r) => r.status === filter.value);
    });

    const login = async () => {
      error.value = "";
      loading.value = true;

      try {
        const res = await axios.post(`${apiUrl}/api/admin/login`, { password: password.value });
        token.value = res.data.token;
        localStorage.setItem("adminToken", res.data.token);
        fetchRequests();
      } catch (err) {
        error.value = err.response?.data?.message || "Login gagal";
      } finally {
        loading.value = false;
      }
    };

    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/admin/requests`, {
          headers: { Authorization: `Bearer ${token.value}` },
        });
        requests.value = res.data.requests;
        const oldPending = pendingCount.value;
        pendingCount.value = res.data.pending_count;
        
        if (oldPending < pendingCount.value) {
          playNotificationSound();
        }
        document.title = pendingCount.value > 0 ? `(${pendingCount.value}) Admin Lisensi` : "Admin Lisensi";
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    const approve = async (requestId) => {
      try {
        await axios.post(
          `${apiUrl}/api/admin/approve`,
          { request_id: requestId },
          { headers: { Authorization: `Bearer ${token.value}` } }
        );
        await fetchRequests();
      } catch (err) {
        alert("Gagal menyetujui request");
      }
    };

    const reject = async (requestId) => {
      try {
        await axios.post(
          `${apiUrl}/api/admin/reject`,
          { request_id: requestId },
          { headers: { Authorization: `Bearer ${token.value}` } }
        );
        await fetchRequests();
      } catch (err) {
        alert("Gagal menolak request");
      }
    };

    const playNotificationSound = () => {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    };

    const formatDate = (date) => new Date(date).toLocaleString("id-ID");
    const logout = () => {
      token.value = null;
      localStorage.removeItem("adminToken");
      clearInterval(pollInterval);
    };
    const goToUser = () => window.location.hash = "";

    onMounted(() => {
      if (token.value) {
        fetchRequests();
        pollInterval = setInterval(fetchRequests, 10000);
      }
    });

    onUnmounted(() => clearInterval(pollInterval));

    return {
      password,
      token,
      loading,
      error,
      requests,
      filter,
      filteredRequests,
      pendingCount,
      login,
      approve,
      reject,
      formatDate,
      logout,
      goToUser,
    };
  },
};
</script>
