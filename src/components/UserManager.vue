<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import type { User } from '../types'
import { Trash2, Pencil, Plus, Save, X, Loader2 } from 'lucide-vue-next'

const users = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const isEditing = ref(false)

const initialForm = {
  name: '',
  age: 0,
  email: ''
}

const form = ref<Omit<User, 'id' | 'created_at' | 'updated_at'>>({ ...initialForm })
const editId = ref<number | null>(null)

const fetchUsers = async () => {
  loading.value = true
  error.value = null
  try {
    const { data, error: supabaseError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (supabaseError) throw supabaseError
    users.value = data
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = null
  try {
    if (isEditing.value && editId.value) {
      const { error: supabaseError } = await supabase
        .from('users')
        .update({ ...form.value, updated_at: new Date().toISOString() })
        .eq('id', editId.value)

      if (supabaseError) throw supabaseError
    } else {
      const { error: supabaseError } = await supabase
        .from('users')
        .insert([form.value])

      if (supabaseError) throw supabaseError
    }

    resetForm()
    await fetchUsers()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const deleteUser = async (id: number) => {
  if (!confirm('Are you sure you want to delete this user?')) return

  loading.value = true
  error.value = null
  try {
    const { error: supabaseError } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (supabaseError) throw supabaseError
    await fetchUsers()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const startEdit = (user: User) => {
  form.value = {
    name: user.name,
    age: user.age,
    email: user.email
  }
  editId.value = user.id
  isEditing.value = true
}

const resetForm = () => {
  form.value = { ...initialForm }
  editId.value = null
  isEditing.value = false
  error.value = null
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-2">
    <div class="mb-8 bg-white dark:bg-zinc-900 rounded-lg shadow-md px-6 py-2 border border-zinc-200 dark:border-zinc-800">
      <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
        <span v-if="isEditing">Edit User</span>
        <span v-else>Add New User</span>
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Name</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Age</label>
            <input
              v-model="form.age"
              type="number"
              required
              min="0"
              class="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter age"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
            />
          </div>
        </div>

        <div class="flex gap-2 justify-end">
          <button
            v-if="isEditing"
            type="button"
            @click="resetForm"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center gap-2"
          >
            <X class="w-4 h-4" /> Cancel
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-black bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <span v-else>
              <Save v-if="isEditing" class="w-4 h-4" />
              <Plus v-else class="w-4 h-4" />
            </span>
            {{ isEditing ? 'Update User' : 'Add User' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="error" class="mb-4 p-4 text-red-700 bg-red-100 rounded-md border border-red-200">
      {{ error }}
    </div>

    <div class="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 dark:bg-zinc-800 border-b dark:border-zinc-700">
            <tr>
              <th class="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">ID</th>
              <th class="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
              <th class="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Age</th>
              <th class="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
              <th class="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Created At</th>
              <th class="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-zinc-700">
            <tr v-if="users.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                No users found. Add one above!
              </td>
            </tr>
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
              <td class="px-6 py-4">{{ user.id }}</td>
              <td class="px-6 py-4 font-medium">{{ user.name }}</td>
              <td class="px-6 py-4">{{ user.age }}</td>
              <td class="px-6 py-4">{{ user.email }}</td>
              <td class="px-6 py-4 text-gray-500 text-xs">
                {{ user.created_at ? new Date(user.created_at).toLocaleString() : '-' }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    @click="startEdit(user)"
                    class="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteUser(user.id)"
                    class="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
