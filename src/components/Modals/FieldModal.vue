<template>
  <Modal size="lg">
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ field ? 'Edit Field' : 'Add Field' }}
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
      <!-- Basic Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="name" class="form-label">Field Name</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="form-input"
            placeholder="Enter field name"
          />
        </div>

        <div>
          <label for="type" class="form-label">Field Type</label>
          <select
            id="type"
            v-model="formData.type"
            @change="onTypeChange"
            required
            class="form-input"
          >
            <option value="">Select field type</option>
            <optgroup label="Text">
              <option value="text">Text</option>
              <option value="long_text">Long Text</option>
              <option value="rich_text">Rich Text</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="url">URL</option>
            </optgroup>
            <optgroup label="Numbers">
              <option value="number">Number</option>
              <option value="currency">Currency</option>
              <option value="rating">Rating</option>
            </optgroup>
            <optgroup label="Date & Time">
              <option value="date">Date</option>
              <option value="time">Time</option>
              <option value="datetime">Date & Time</option>
            </optgroup>
            <optgroup label="Media">
              <option value="image">Image</option>
              <option value="file">File</option>
            </optgroup>
            <optgroup label="Advanced">
              <option value="boolean">Boolean</option>
              <option value="enum">Select/Enum</option>
              <option value="json">JSON</option>
              <option value="geometry">Geometry/Location</option>
              <option value="color">Color</option>
              <option value="csv">CSV Data</option>
              <option value="tags">Tags</option>
              <option value="barcode">Barcode</option>
              <option value="qr_code">QR Code</option>
              <option value="relationship">Relationship</option>
            </optgroup>
          </select>
        </div>
      </div>

      <!-- Field Properties -->
      <div class="space-y-4">
        <div class="flex items-center space-x-6">
          <label class="flex items-center space-x-2">
            <input
              v-model="formData.isRequired"
              type="checkbox"
              class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
            />
            <span class="text-sm text-gray-900 dark:text-white">Required</span>
          </label>

          <label class="flex items-center space-x-2">
            <input
              v-model="formData.isPrimary"
              type="checkbox"
              class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
            />
            <span class="text-sm text-gray-900 dark:text-white">Primary Field</span>
          </label>

          <label class="flex items-center space-x-2">
            <input
              v-model="formData.isUnique"
              type="checkbox"
              class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
            />
            <span class="text-sm text-gray-900 dark:text-white">Unique</span>
          </label>
        </div>

        <div v-if="formData.type && formData.type !== 'relationship'">
          <label for="defaultValue" class="form-label">Default Value</label>
          <input
            id="defaultValue"
            v-model="formData.defaultValue"
            :type="getDefaultValueInputType()"
            class="form-input"
            :placeholder="getDefaultValuePlaceholder()"
          />
        </div>
      </div>

      <!-- Type-specific Options -->
      <div v-if="showOptions" class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Options</h3>
        
        <!-- Enum Options -->
        <div v-if="formData.type === 'enum'" class="space-y-3">
          <div class="flex items-center space-x-2">
            <input
              v-model="newEnumValue"
              type="text"
              placeholder="Add option"
              class="form-input flex-1"
              @keyup.enter="addEnumValue"
            />
            <button
              type="button"
              @click="addEnumValue"
              :disabled="!newEnumValue.trim()"
              class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          <div v-if="formData.options.enumValues.length > 0" class="space-y-2">
            <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Options:</div>
            <div class="space-y-1">
              <div
                v-for="(value, index) in formData.options.enumValues"
                :key="index"
                class="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded px-3 py-2"
              >
                <span class="text-sm text-gray-900 dark:text-white">{{ value }}</span>
                <button
                  type="button"
                  @click="removeEnumValue(index)"
                  class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Rating Options -->
        <div v-if="formData.type === 'rating'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="maxRating" class="form-label">Maximum Rating</label>
            <select
              id="maxRating"
              v-model="formData.options.maxRating"
              class="form-input"
            >
              <option value="5">5 Stars</option>
              <option value="10">10 Points</option>
            </select>
          </div>
        </div>

        <!-- Tags Options -->
        <div v-if="formData.type === 'tags'" class="space-y-3">
          <div class="flex items-center space-x-2">
            <input
              v-model="newTagSuggestion"
              type="text"
              placeholder="Add suggested tag"
              class="form-input flex-1"
              @keyup.enter="addTagSuggestion"
            />
            <button
              type="button"
              @click="addTagSuggestion"
              :disabled="!newTagSuggestion.trim()"
              class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          <div v-if="formData.options.suggestedTags.length > 0" class="space-y-2">
            <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Suggested Tags:</div>
            <div class="flex flex-wrap gap-1">
              <div
                v-for="(tag, index) in formData.options.suggestedTags"
                :key="index"
                class="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1"
              >
                <span class="text-xs text-gray-700 dark:text-gray-300">{{ tag }}</span>
                <button
                  type="button"
                  @click="removeTagSuggestion(index)"
                  class="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <XMarkIcon class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Currency Options -->
        <div v-if="formData.type === 'currency'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="currency" class="form-label">Currency</label>
            <select
              id="currency"
              v-model="formData.options.currency"
              class="form-input"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
          </div>
          <div>
            <label for="precision" class="form-label">Decimal Places</label>
            <input
              id="precision"
              v-model.number="formData.options.precision"
              type="number"
              min="0"
              max="4"
              class="form-input"
            />
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
          class="btn-primary"
        >
          {{ field ? 'Update' : 'Add' }} Field
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue'
import type { Field, Table } from '@/types/database'
import { FieldType } from '@/types/database'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import Modal from '@/components/UI/Modal.vue'

interface Props {
  field?: Field | null
  tables?: Table[]
  currentTableId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [data: any]
}>()

const newEnumValue = ref('')
const newTagSuggestion = ref('')

const formData = reactive({
  name: '',
  type: '' as FieldType | '',
  isRequired: false,
  isPrimary: false,
  isUnique: false,
  defaultValue: '',
  position: 1,
  validation: {
    minLength: undefined as number | undefined,
    maxLength: undefined as number | undefined,
    min: undefined as number | undefined,
    max: undefined as number | undefined,
    pattern: ''
  },
  options: {
    enumValues: [] as string[],
    currency: 'USD',
    precision: 2,
    dateFormat: 'default',
    fileTypes: [] as string[],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxRating: 5,
    suggestedTags: [] as string[],
    barcodeFormat: 'CODE128'
  }
})

const showOptions = computed(() => 
  ['enum', 'currency', 'file', 'image', 'rating', 'tags', 'barcode', 'qr_code'].includes(formData.type)
)

const onTypeChange = () => {
  // Reset validation and options when type changes
  formData.validation = {
    minLength: undefined,
    maxLength: undefined,
    min: undefined,
    max: undefined,
    pattern: ''
  }
  
  formData.options = {
    enumValues: [],
    currency: 'USD',
    precision: 2,
    dateFormat: 'default',
    fileTypes: [],
    maxFileSize: 5 * 1024 * 1024,
    maxRating: 5,
    suggestedTags: [],
    barcodeFormat: 'CODE128'
  }
  
  formData.defaultValue = ''
}

const getDefaultValueInputType = () => {
  switch (formData.type) {
    case 'number':
    case 'currency':
      return 'number'
    case 'date':
      return 'date'
    case 'time':
      return 'time'
    case 'datetime':
      return 'datetime-local'
    case 'email':
      return 'email'
    case 'url':
      return 'url'
    case 'phone':
      return 'tel'
    case 'color':
      return 'color'
    case 'boolean':
      return 'checkbox'
    default:
      return 'text'
  }
}

const getDefaultValuePlaceholder = () => {
  switch (formData.type) {
    case 'text':
      return 'Default text value'
    case 'number':
      return '0'
    case 'currency':
      return '0.00'
    case 'email':
      return 'user@example.com'
    case 'phone':
      return '+1234567890'
    case 'url':
      return 'https://example.com'
    case 'color':
      return '#000000'
    default:
      return 'Default value'
  }
}

const addEnumValue = () => {
  if (newEnumValue.value.trim() && !formData.options.enumValues.includes(newEnumValue.value.trim())) {
    formData.options.enumValues.push(newEnumValue.value.trim())
    newEnumValue.value = ''
  }
}

const removeEnumValue = (index: number) => {
  formData.options.enumValues.splice(index, 1)
}

const addTagSuggestion = () => {
  if (newTagSuggestion.value.trim() && !formData.options.suggestedTags.includes(newTagSuggestion.value.trim())) {
    formData.options.suggestedTags.push(newTagSuggestion.value.trim())
    newTagSuggestion.value = ''
  }
}

const removeTagSuggestion = (index: number) => {
  formData.options.suggestedTags.splice(index, 1)
}

const handleSubmit = () => {
  const fieldData = {
    ...formData,
    validation: Object.fromEntries(
      Object.entries(formData.validation).filter(([_, value]) => value !== undefined && value !== '')
    ),
    options: Object.fromEntries(
      Object.entries(formData.options).filter(([_, value]) => {
        if (Array.isArray(value)) return value.length > 0
        return value !== undefined && value !== ''
      })
    )
  }
  
  emit('save', fieldData)
}

onMounted(() => {
  if (props.field) {
    Object.assign(formData, {
      name: props.field.name,
      type: props.field.type,
      isRequired: props.field.isRequired,
      isPrimary: props.field.isPrimary,
      isUnique: props.field.isUnique,
      defaultValue: props.field.defaultValue || '',
      position: props.field.position,
      validation: props.field.validation || {},
      options: props.field.options || {}
    })
  }
})
</script>