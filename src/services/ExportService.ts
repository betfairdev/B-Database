import type { Database, Table, ExportOptions } from '@/types/database'

export class ExportService {
  static async exportData(database: Database, options: ExportOptions): Promise<Blob> {
    const selectedTables = database.tables.filter(table => 
      !options.tables || options.tables.includes(table.id)
    )

    switch (options.format) {
      case 'json':
        return this.exportToJSON(database, selectedTables, options)
      case 'csv':
        return this.exportToCSV(selectedTables, options)
      case 'html':
        return this.exportToHTML(database, selectedTables, options)
      case 'pdf':
        return this.exportToPDF(database, selectedTables, options)
      case 'docx':
        return this.exportToDocx(database, selectedTables, options)
      default:
        throw new Error('Unsupported export format')
    }
  }

  private static exportToJSON(database: Database, tables: Table[], options: ExportOptions): Blob {
    const exportData: any = {
      exportedAt: new Date().toISOString(),
      format: 'json',
      version: '1.0'
    }

    if (options.includeMetadata) {
      exportData.database = {
        id: database.id,
        name: database.name,
        emoji: database.emoji,
        description: database.description,
        createdAt: database.createdAt,
        updatedAt: database.updatedAt,
        isEncrypted: database.isEncrypted
      }
    }

    exportData.tables = tables.map(table => ({
      id: table.id,
      name: table.name,
      emoji: table.emoji,
      databaseId: table.databaseId,
      fields: table.fields.map(field => ({
        id: field.id,
        name: field.name,
        type: field.type,
        isRequired: field.isRequired,
        isPrimary: field.isPrimary,
        isUnique: field.isUnique,
        defaultValue: field.defaultValue,
        validation: field.validation,
        options: field.options,
        position: field.position
      })),
      records: table.records.map(record => ({
        id: record.id,
        data: record.data,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        version: record.version
      })),
      relationships: options.includeRelationships ? table.relationships : [],
      createdAt: table.createdAt,
      updatedAt: table.updatedAt
    }))

    const jsonString = JSON.stringify(exportData, null, 2)
    return new Blob([jsonString], { type: 'application/json' })
  }

  private static exportToCSV(tables: Table[], options: ExportOptions): Blob {
    let csvContent = ''

    tables.forEach((table, tableIndex) => {
      if (tableIndex > 0) {
        csvContent += '\n\n'
      }

      // Table header
      csvContent += `# Table: ${table.name}\n`
      
      if (table.records.length === 0) {
        csvContent += 'No records\n'
        return
      }

      // Column headers
      const headers = table.fields.map(field => field.name)
      csvContent += headers.map(header => this.escapeCSV(header)).join(',') + '\n'

      // Data rows
      table.records.forEach(record => {
        const row = table.fields.map(field => {
          const value = record.data[field.id]
          return this.escapeCSV(this.formatValueForCSV(value))
        })
        csvContent += row.join(',') + '\n'
      })
    })

    return new Blob([csvContent], { type: 'text/csv' })
  }

  private static exportToHTML(database: Database, tables: Table[], options: ExportOptions): Blob {
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${database.name} - Data Export</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { margin-bottom: 30px; }
        .table-container { margin-bottom: 40px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .metadata { background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .table-title { font-size: 1.2em; font-weight: bold; margin-bottom: 10px; }
        .export-info { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${database.emoji || '📊'} ${database.name}</h1>
        <div class="export-info">
            Exported on ${new Date().toLocaleString()}
        </div>
    </div>
`

    if (options.includeMetadata) {
      html += `
    <div class="metadata">
        <h2>Database Information</h2>
        <p><strong>Description:</strong> ${database.description || 'No description'}</p>
        <p><strong>Created:</strong> ${new Date(database.createdAt).toLocaleString()}</p>
        <p><strong>Last Updated:</strong> ${new Date(database.updatedAt).toLocaleString()}</p>
        <p><strong>Tables:</strong> ${tables.length}</p>
        <p><strong>Total Records:</strong> ${tables.reduce((sum, table) => sum + table.records.length, 0)}</p>
    </div>
`
    }

    tables.forEach(table => {
      html += `
    <div class="table-container">
        <div class="table-title">${table.emoji || '📋'} ${table.name}</div>
        <p>${table.records.length} records</p>
`

      if (table.records.length > 0) {
        html += `
        <table>
            <thead>
                <tr>
                    ${table.fields.map(field => `<th>${field.name}${field.isRequired ? ' *' : ''}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${table.records.map(record => `
                <tr>
                    ${table.fields.map(field => `<td>${this.formatValueForHTML(record.data[field.id])}</td>`).join('')}
                </tr>
                `).join('')}
            </tbody>
        </table>
`
      } else {
        html += '<p>No records in this table.</p>'
      }

      html += '</div>'
    })

    html += `
</body>
</html>
`

    return new Blob([html], { type: 'text/html' })
  }

  private static async exportToPDF(database: Database, tables: Table[], options: ExportOptions): Promise<Blob> {
    // In a real implementation, use a PDF library like jsPDF or PDFKit
    const pdfContent = `
PDF Export: ${database.name}
Generated: ${new Date().toLocaleString()}

${tables.map(table => `
Table: ${table.name}
Records: ${table.records.length}

${table.fields.map(field => field.name).join(' | ')}
${table.records.map(record => 
  table.fields.map(field => this.formatValueForPDF(record.data[field.id])).join(' | ')
).join('\n')}
`).join('\n\n')}
`

    return new Blob([pdfContent], { type: 'application/pdf' })
  }

  private static async exportToDocx(database: Database, tables: Table[], options: ExportOptions): Promise<Blob> {
    // In a real implementation, use a DOCX library like docx
    const docxContent = `
Database Export: ${database.name}
Generated: ${new Date().toLocaleString()}

${tables.map(table => `
Table: ${table.name}
Records: ${table.records.length}

${table.fields.map(field => field.name).join('\t')}
${table.records.map(record => 
  table.fields.map(field => this.formatValueForDocx(record.data[field.id])).join('\t')
).join('\n')}
`).join('\n\n')}
`

    return new Blob([docxContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  }

  private static escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  private static formatValueForCSV(value: any): string {
    if (value === null || value === undefined) return ''
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  private static formatValueForHTML(value: any): string {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value).replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  private static formatValueForPDF(value: any): string {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  private static formatValueForDocx(value: any): string {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }
}