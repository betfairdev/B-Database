<template>
  <Modal size="xl">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ record ? 'Edit Record' : 'Add Record' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="field in table.fields"
          :key="field.id"
          :class="[
            field.type === 'long_text' || field.type === 'json' || field.type === 'csv' 
              ? 'md:col-span-2' 
              : ''
          ]"
        >
          <label :for="field.id" class="form-label">
            {{ field.name }}
            <span v-if="field.isRequired" class="text-red-500 ml-1">*</span>
            <span v-if="field.isPrimary" class="text-primary-600 dark:text-primary-400 ml-1">(Primary)</span>
          </label>
          
          <FieldRenderer
            :field="field"
            :value="formData[field.id]"
            :readonly="false"
            @update:value="updateFieldValue(field.id, $event)"
          />
          
          <div v-if="fieldErrors[field.id]" class="text-xs text-red-600 dark:text-red-400 mt-1">
            {{ fieldErrors[field.id] }}
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          @click="$emit('close')"
          class="btn-secondary"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="!isValid"
          class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ record ? 'Update' : 'Add' }} Record
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import type { Table, Record } from '@/types/database'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import Modal from '@/components/UI/Modal.vue'
import FieldRenderer from '@/components/FieldRenderers/FieldRenderer.vue'

interface Props {
  table: Table
  record?: Record | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [data: any]
}>()

const formData = reactive<{ [fieldId: string]: any }>({})
const fieldErrors = reactive<{ [fieldId: string]: string }>({})

const isValid = computed(() => {
  // Check required fields
  for (const field of props.table.fields) {
    if (field.isRequired && (!formData[field.id] || formData[field.id] === '')) {
      return false
    }
  }
  
  // Check for validation errors
  return Object.keys(fieldErrors).length === 0
})

const updateFieldValue = (fieldId: string, value: any) => {
  formData[fieldId] = value
  validateField(fieldId, value)
}

const validateField = (fieldId: string, value: any) => {
  const field = props.table.fields.find(f => f.id === fieldId)
  if (!field) return
  
  // Clear previous error
  delete fieldErrors[fieldId]
  
  // Required validation
  if (field.isRequired && (!value || value === '')) {
    fieldErrors[fieldId] = `${field.name} is required`
    return
  }
  
  // Type-specific validation
  if (value && field.validation) {
    const validation = field.validation
    
    // Text validation
    if (typeof value === 'string') {
      if (validation.minLength && value.length < validation.minLength) {
        fieldErrors[fieldId] = `${field.name} must be at least ${validation.minLength} characters`
        return
      }
      
      if (validation.maxLength && value.length > validation.maxLength) {
        fieldErrors[fieldId] = `${field.name} must be no more than ${validation.maxLength} characters`
        return
      }
      
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        fieldErrors[fieldId] = `${field.name} format is invalid`
        return
      }
    }
    
    // Number validation
    if (typeof value === 'number') {
      if (validation.min !== undefined && value < validation.min) {
        fieldErrors[fieldId] = `${field.name} must be at least ${validation.min}`
        return
      }
      
      if (validation.max !== undefined && value > validation.max) {
        fieldErrors[fieldId] = `${field.name} must be no more than ${validation.max}`
        return
      }
    }
  }
  
  // Email validation
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      fieldErrors[fieldId] = 'Please enter a valid email address'
      return
    }
  }
  
  // URL validation
  if (field.type === 'url' && value) {
    try {
      new URL(value)
    } catch {
      fieldErrors[fieldId] = 'Please enter a valid URL'
      return
    }
  }
  
  // Phone validation
  if (field.type === 'phone' && value) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    const cleanPhone = value.replace(/[\s\-\(\)]/g, '')
    if (!phoneRegex.test(cleanPhone)) {
      fieldErrors[fieldId] = 'Please enter a valid phone number'
      return
    }
  }
  
  // Color validation
  if (field.type === 'color' && value) {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/
    if (!hexRegex.test(value)) {
      fieldErrors[fieldId] = 'Please enter a valid hex color'
      return
    }
  }
}

const handleSubmit = () => {
  // Validate all fields
  for (const field of props.table.fields) {
    validateField(field.id, formData[field.id])
  }
  
  if (isValid.value) {
    emit('save', { ...formData })
  }
}

onMounted(() => {
  // Initialize form data
  for (const field of props.table.fields) {
    if (props.record) {
      formData[field.id] = props.record.data[field.id] || field.defaultValue || ''
    } else {
      formData[field.id] = field.defaultValue || ''
    }
  }
})
</script>