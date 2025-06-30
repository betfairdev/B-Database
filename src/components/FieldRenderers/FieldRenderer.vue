<template>
  <div class="field-renderer">
    <component
      :is="getRendererComponent(field.type)"
      :field="field"
      :value="value"
      :readonly="readonly"
      :compact="compact"
      :tables="tables"
      :records="records"
      @update:value="$emit('update:value', $event)"
      @create-record="$emit('create-record', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Field, Table, Record } from '@/types/database'
import { FieldType } from '@/types/database'
import TextRenderer from './TextRenderer.vue'
import NumberRenderer from './NumberRenderer.vue'
import DateRenderer from './DateRenderer.vue'
import BooleanRenderer from './BooleanRenderer.vue'
import ImageRenderer from './ImageRenderer.vue'
import FileRenderer from './FileRenderer.vue'
import URLRenderer from './URLRenderer.vue'
import EmailRenderer from './EmailRenderer.vue'
import PhoneRenderer from './PhoneRenderer.vue'
import ColorRenderer from './ColorRenderer.vue'
import EnumRenderer from './EnumRenderer.vue'
import JSONRenderer from './JSONRenderer.vue'
import GeometryRenderer from './GeometryRenderer.vue'
import CurrencyRenderer from './CurrencyRenderer.vue'
import CSVRenderer from './CSVRenderer.vue'
import RelationshipRenderer from './RelationshipRenderer.vue'
import RichTextRenderer from './RichTextRenderer.vue'
import RatingRenderer from './RatingRenderer.vue'
import TagsRenderer from './TagsRenderer.vue'
import BarcodeRenderer from './BarcodeRenderer.vue'
import QRCodeRenderer from './QRCodeRenderer.vue'

interface Props {
  field: Field
  value: any
  readonly?: boolean
  compact?: boolean
  tables?: Table[]
  records?: Record[]
}

defineProps<Props>()

defineEmits<{
  'update:value': [value: any]
  'create-record': [tableId: string, data: any]
}>()

const getRendererComponent = (type: FieldType) => {
  const renderers = {
    [FieldType.TEXT]: TextRenderer,
    [FieldType.LONG_TEXT]: TextRenderer,
    [FieldType.RICH_TEXT]: RichTextRenderer,
    [FieldType.NUMBER]: NumberRenderer,
    [FieldType.CURRENCY]: CurrencyRenderer,
    [FieldType.DATE]: DateRenderer,
    [FieldType.TIME]: DateRenderer,
    [FieldType.DATETIME]: DateRenderer,
    [FieldType.IMAGE]: ImageRenderer,
    [FieldType.FILE]: FileRenderer,
    [FieldType.GEOMETRY]: GeometryRenderer,
    [FieldType.COLOR]: ColorRenderer,
    [FieldType.URL]: URLRenderer,
    [FieldType.EMAIL]: EmailRenderer,
    [FieldType.PHONE]: PhoneRenderer,
    [FieldType.ENUM]: EnumRenderer,
    [FieldType.JSON]: JSONRenderer,
    [FieldType.BOOLEAN]: BooleanRenderer,
    [FieldType.CSV]: CSVRenderer,
    [FieldType.RELATIONSHIP]: RelationshipRenderer,
    [FieldType.RATING]: RatingRenderer,
    [FieldType.TAGS]: TagsRenderer,
    [FieldType.BARCODE]: BarcodeRenderer,
    [FieldType.QR_CODE]: QRCodeRenderer
  }
  return renderers[type] || TextRenderer
}
</script>