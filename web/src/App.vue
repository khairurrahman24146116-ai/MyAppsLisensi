<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <component :is="currentPage" />
  </div>
</template>

<script>
import { ref } from "vue";
import UserPage from "./pages/UserPage.vue";
import AdminPage from "./pages/AdminPage.vue";

export default {
  components: { UserPage, AdminPage },
  setup() {
    const currentPage = ref("UserPage");
    const isAdmin = ref(false);

    window.switchToAdmin = (token) => {
      isAdmin.value = true;
      currentPage.value = "AdminPage";
      localStorage.setItem("adminToken", token);
    };

    window.logout = () => {
      isAdmin.value = false;
      currentPage.value = "UserPage";
      localStorage.removeItem("adminToken");
    };

    return { currentPage };
  },
};
</script>
