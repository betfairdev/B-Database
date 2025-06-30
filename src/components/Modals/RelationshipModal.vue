<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ relationship ? 'Edit Relationship' : 'Create Relationship' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="name" class="form-label">Relationship Name</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              class="form-input"
              placeholder="e.g., User Posts, Order Items"
            />
          </div>

          <div>
            <label for="type" class="form-label">Relationship Type</label>
            <select
              id="type"
              v-model="formData.type"
              @change="onTypeChange"
              required
              class="form-input"
            >
              <option value="">Select relationship type</option>
              <option value="one-to-one">One to One</option>
              <option value="one-to-many">One to Many</option>
              <option value="many-to-one">Many to One</option>
              <option value="many-to-many">Many to Many</option>
              <option value="self-referential">Self Referential</option>
            </select>
          </div>
        </div>

        <div>
          <label for="description" class="form-label">Description (Optional)</label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="2"
            class="form-input resize-none"
            placeholder="Describe this relationship..."
          />
        </div>

        <!-- Source Table -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="sourceTable" class="form-label">Source Table</label>
            <select
              id="sourceTable"
              v-model="formData.sourceTableId"
              @change="onSourceTableChange"
              required
              class="form-input"
            >
              <option value="">Select source table</option>
              <option
                v-for="table in availableTables"
                :key="table.id"
                :value="table.id"
              >
                {{ table.name }}
              </option>
            </select>
          </div>

          <div>
            <label for="sourceField" class="form-label">Source Field</label>
            <select
              id="sourceField"
              v-model="formData.sourceFieldId"
              required
              class="form-input"
              :disabled="!formData.sourceTableId"
            >
              <option value="">Select source field</option>
              <option
                v-for="field in sourceFields"
                :key="field.id"
                :value="field.id"
              >
                {{ field.name }} ({{ field.type }})
              </option>
            </select>
          </div>
        </div>

        <!-- Target Table -->
        <div v-if="formData.type !== 'self-referential'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="targetTable" class="form-label">Target Table</label>
            <select
              id="targetTable"
              v-model="formData.targetTableId"
              @change="onTargetTableChange"
              required
              class="form-input"
            >
              <option value="">Select target table</option>
              <option
                v-for="table in availableTargetTables"
                :key="table.id"
                :value="table.id"
              >
                {{ table.name }}
              </option>
            </select>
          </div>

          <div>
            <label for="targetField" class="form-label">Target Field</label>
            <select
              id="targetField"
              v-model="formData.targetFieldId"
              required
              class="form-input"
              :disabled="!formData.targetTableId"
            >
              <option value="">Select target field</option>
              <option
                v-for="field in targetFields"
                :key="field.id"
                :value="field.id"
              >
                {{ field.name }} ({{ field.type }})
              </option>
            </select>
          </div>
        </div>

        <!-- Self-referential target field -->
        <div v-else>
          <label for="selfTargetField" class="form-label">Target Field (Same Table)</label>
          <select
            id="selfTargetField"
            v-model="formData.targetFieldId"
            required
            class="form-input"
            :disabled="!formData.sourceTableId"
          >
            <option value="">Select target field</option>
            <option
              v-for="field in sourceFields.filter(f => f.id !== formData.sourceFieldId)"
              :key="field.id"
              :value="field.id"
            >
              {{ field.name }} ({{ field.type }})
            </option>
          </select>
        </div>

        <!-- Relationship Options -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Options</h3>
          
          <div class="flex items-center space-x-6">
            <label class="flex items-center space-x-2">
              <input
                v-model="formData.isRequired"
                type="checkbox"
                class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              />
              <span class="text-sm text-gray-900 dark:text-white">Required</span>
            </label>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="onDelete" class="form-label">On Delete</label>
              <select
                id="onDelete"
                v-model="formData.onDelete"
                class="form-input"
              >
                <option value="CASCADE">CASCADE</option>
                <option value="SET_NULL">SET NULL</option>
                <option value="RESTRICT">RESTRICT</option>
              </select>
            </div>

            <div>
              <label for="onUpdate" class="form-label">On Update</label>
              <select
                id="onUpdate"
                v-model="formData.onUpdate"
                class="form-input"
              >
                <option value="CASCADE">CASCADE</option>
                <option value="SET_NULL">SET NULL</option>
                <option value="RESTRICT">RESTRICT</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Many-to-Many Junction Table -->
        <div v-if="formData.type === 'many-to-many'" class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Junction Table</h3>
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div class="flex items-center space-x-2 mb-2">
              <InformationCircleIcon class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span class="text-sm font-medium text-blue-900 dark:text-blue-200">
                Junction Table Required
              </span>
            </div>
            <p class="text-sm text-blue-800 dark:text-blue-300">
              A junction table will be created automatically to manage the many-to-many relationship.
              It will be named: <code class="bg-blue-100 dark:bg-blue-800 px-1 rounded">{{ getJunctionTableName() }}</code>
            </p>
          </div>
        </div>

        <!-- Relationship Preview -->
        <div v-if="formData.type && formData.sourceTableId" class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Relationship Preview</h3>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              {{ getRelationshipDescription() }}
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="$emit('close')"
            class="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn-primary"
          >
            {{ relationship ? 'Update' : 'Create' }} Relationship
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import type { Relationship, Table, Field, RelationshipType } from '@/types/database'
import {
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'

interface Props {
  relationship?: Relationship | null
  tables: Table[]
  currentTableId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [data: any]
}>()

const formData = reactive({
  name: '',
  type: '' as RelationshipType | '',
  description: '',
  sourceTableId: '',
  targetTableId: '',
  sourceFieldId: '',
  targetFieldId: '',
  isRequired: false,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
})

const availableTables = computed(() => props.tables)

const availableTargetTables = computed(() => {
  if (formData.type === 'self-referential') {
    return props.tables.filter(table => table.id === formData.sourceTableId)
  }
  return props.tables.filter(table => table.id !== formData.sourceTableId)
})

const sourceFields = computed(() => {
  const table = props.tables.find(t => t.id === formData.sourceTableId)
  return table?.fields || []
})

const targetFields = computed(() => {
  const tableId = formData.type === 'self-referential' ? formData.sourceTableId : formData.targetTableId
  const table = props.tables.find(t => t.id === tableId)
  return table?.fields || []
})

const onTypeChange = () => {
  if (formData.type === 'self-referential') {
    formData.targetTableId = formData.sourceTableId
  } else {
    formData.targetTableId = ''
  }
  formData.targetFieldId = ''
}

const onSourceTableChange = () => {
  formData.sourceFieldId = ''
  if (formData.type === 'self-referential') {
    formData.targetTableId = formData.sourceTableId
  }
  formData.targetFieldId = ''
}

const onTargetTableChange = () => {
  formData.targetFieldId = ''
}

const getJunctionTableName = () => {
  const sourceTable = props.tables.find(t => t.id === formData.sourceTableId)
  const targetTable = props.tables.find(t => t.id === formData.targetTableId)
  if (sourceTable && targetTable) {
    return `${sourceTable.name}_${targetTable.name}`
  }
  return 'junction_table'
}

const getRelationshipDescription = () => {
  const sourceTable = props.tables.find(t => t.id === formData.sourceTableId)
  const targetTable = props.tables.find(t => t.id === formData.targetTableId) || sourceTable
  const sourceField = sourceFields.value.find(f => f.id === formData.sourceFieldId)
  const targetField = targetFields.value.find(f => f.id === formData.targetFieldId)

  if (!sourceTable || !targetTable || !sourceField || !targetField) {
    return 'Select all fields to see relationship preview'
  }

  const descriptions = {
    'one-to-one': `Each ${sourceTable.name} has exactly one ${targetTable.name}`,
    'one-to-many': `Each ${sourceTable.name} can have multiple ${targetTable.name} records`,
    'many-to-one': `Multiple ${sourceTable.name} records can belong to one ${targetTable.name}`,
    'many-to-many': `${sourceTable.name} and ${targetTable.name} can have multiple relationships`,
    'self-referential': `${sourceTable.name} records can reference other ${sourceTable.name} records`
  }

  return descriptions[formData.type as RelationshipType] || ''
}

const handleSubmit = () => {
  const relationshipData = {
    ...formData,
    targetTableId: formData.type === 'self-referential' ? formData.sourceTableId : formData.targetTableId
  }
  emit('save', relationshipData)
}

onMounted(() => {
  if (props.relationship) {
    Object.assign(formData, {
      name: props.relationship.name,
      type: props.relationship.type,
      description: props.relationship.description || '',
      sourceTableId: props.relationship.sourceTableId,
      targetTableId: props.relationship.targetTableId,
      sourceFieldId: props.relationship.sourceFieldId,
      targetFieldId: props.relationship.targetFieldId,
      isRequired: props.relationship.isRequired,
      onDelete: props.relationship.onDelete,
      onUpdate: props.relationship.onUpdate
    })
  } else if (props.currentTableId) {
    formData.sourceTableId = props.currentTableId
  }
})
</script>