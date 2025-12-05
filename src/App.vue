<script setup lang="ts">
import UserManager from './components/UserManager.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-zinc-950 py-2">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2 mt-4">
          User Management
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Supabase CRUD Example
        </p>
      </div>

      <UserManager />
    </div>
  </div>
</template>
