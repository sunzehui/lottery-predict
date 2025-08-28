<template>
  <div class="fixed bottom-4 right-4 z-50 space-y-2">
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :message="toast.message"
      :type="toast.type"
      :duration="toast.duration"
      :show="true"
      @hide="removeToast(toast.id)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useToastStore } from '~/stores/toastStore'
import Toast from './Toast.vue'

const toastStore = useToastStore()

const toasts = computed(() => toastStore.toasts)

const removeToast = (id) => {
  toastStore.removeToast(id)
}
</script>
