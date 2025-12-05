<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import type { User } from '../types'
import { Trash2, Pencil, Plus, Save, X, Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
    <Card class="mb-8">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <span v-if="isEditing">Edit User</span>
          <span v-else>Add New User</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="grid w-full items-center gap-1.5">
              <Label for="name">Name</Label>
              <Input
                id="name"
                v-model="form.name"
                type="text"
                required
                placeholder="Enter name"
              />
            </div>
            <div class="grid w-full items-center gap-1.5">
              <Label for="age">Age</Label>
              <Input
                id="age"
                v-model="form.age"
                type="number"
                required
                min="0"
                placeholder="Enter age"
              />
            </div>
            <div class="grid w-full items-center gap-1.5">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="form.email"
                type="email"
                required
                placeholder="Enter email"
              />
            </div>
          </div>

          <div class="flex gap-2 justify-end">
            <Button
              v-if="isEditing"
              type="button"
              variant="outline"
              @click="resetForm"
            >
              <X class="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button
              type="submit"
              :disabled="loading"
            >
              <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
              <template v-else>
                <Save v-if="isEditing" class="w-4 h-4 mr-2" />
                <Plus v-else class="w-4 h-4 mr-2" />
              </template>
              {{ isEditing ? 'Update User' : 'Add User' }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <div v-if="error" class="mb-4 p-4 text-red-700 bg-red-100 rounded-md border border-red-200">
      {{ error }}
    </div>

    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="users.length === 0">
            <TableCell colspan="6" class="text-center h-24 text-muted-foreground">
              No users found. Add one above!
            </TableCell>
          </TableRow>
          <TableRow v-for="user in users" :key="user.id">
            <TableCell>{{ user.id }}</TableCell>
            <TableCell class="font-medium">{{ user.name }}</TableCell>
            <TableCell>{{ user.age }}</TableCell>
            <TableCell>{{ user.email }}</TableCell>
            <TableCell class="text-muted-foreground">
              {{ user.created_at ? new Date(user.created_at).toLocaleString() : '-' }}
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-2">
                <Button
                  @click="startEdit(user)"
                  variant="ghost"
                  size="icon"
                  title="Edit"
                >
                  <Pencil class="w-4 h-4" />
                </Button>
                <Button
                  @click="deleteUser(user.id)"
                  variant="ghost"
                  size="icon"
                  class="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 class="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
