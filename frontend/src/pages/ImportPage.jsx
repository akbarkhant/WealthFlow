import React, { useState } from "react"
import { useTransactionRefresh } from '../context/TransactionContext'
import { useNavigate } from 'react-router-dom'
import * as XLSX from "xlsx"
import { importTransactions } from '../api/transactionsApi'

// ============ API SERVICE ============
// (Real API calls are made via importTransactions from transactionsApi.js)

// ============ VALIDATION ============
const validateTransaction = row => {
  const errors = []

  // Date validation
  if (!row.date || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
    errors.push("Invalid date format (expected YYYY-MM-DD)")
  } else {
    const date = new Date(row.date)
    if (date > new Date()) {
      errors.push("Date cannot be in the future")
    }
  }

  // Amount validation
  if (typeof row.amount !== "number" || row.amount <= 0) {
    errors.push("Amount must be a positive number")
  }

  // Merchant validation
  if (!row.merchant || row.merchant.trim().length < 3) {
    errors.push("Merchant must be at least 3 characters")
  }

  // Category validation
  if (!row.category || row.category.trim().length === 0) {
    errors.push("Category is required")
  }

  return errors
}

// ============ PARSER ============
const parseExcelFile = (file, columnMap) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target?.result)
        const workbook = XLSX.read(data, { type: "array" })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" })

        const parsed = jsonData.map((row, idx) => ({
          date: String(row[columnMap.date] || "").trim(),
          amount: parseFloat(row[columnMap.amount] || 0),
          merchant: String(row[columnMap.merchant] || "").trim(),
          category: String(row[columnMap.category] || "").trim(),
          notes: columnMap.notes
            ? String(row[columnMap.notes] || "").trim()
            : undefined,
          rowNumber: idx + 2
        }))

        resolve(parsed)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
}

const autoDetectColumns = headers => {
  const lowerHeaders = headers.map(h => h.toLowerCase())

  const dateIdx = lowerHeaders.findIndex(
    h => h.includes("date") || h.includes("transaction") || h === "date"
  )
  const amountIdx = lowerHeaders.findIndex(
    h => h.includes("amount") || h.includes("value") || h === "amount"
  )
  const merchantIdx = lowerHeaders.findIndex(
    h =>
      h.includes("merchant") || h.includes("description") || h.includes("name")
  )
  const categoryIdx = lowerHeaders.findIndex(
    h => h.includes("category") || h.includes("type") || h === "category"
  )

  if (dateIdx >= 0 && amountIdx >= 0 && merchantIdx >= 0 && categoryIdx >= 0) {
    return {
      date: headers[dateIdx],
      amount: headers[amountIdx],
      merchant: headers[merchantIdx],
      category: headers[categoryIdx]
    }
  }

  return null
}

// ============ SUB-COMPONENTS ============

const FileUploadZone = ({ onFileSelect, loading = false, error = null }) => {
  const [dragActive, setDragActive] = useState(false)
  const [showColumnMapper, setShowColumnMapper] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileHeaders, setFileHeaders] = useState([])
  const [manualMap, setManualMap] = useState(null)
  const fileInputRef = React.useRef(null)

  const extractHeaders = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const data = new Uint8Array(e.target?.result)
          const workbook = XLSX.read(data, { type: "array" })
          const worksheet = workbook.Sheets[workbook.SheetNames[0]]
          const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0]
          resolve(headers)
        } catch (error) {
          reject(error)
        }
      }
      reader.readAsArrayBuffer(file)
    })
  }

  const handleFile = async file => {
    setSelectedFile(file)
    const headers = await extractHeaders(file)
    setFileHeaders(headers)

    const detected = autoDetectColumns(headers)
    if (detected) {
      setManualMap(detected)
      onFileSelect(file, detected)
    } else {
      setShowColumnMapper(true)
    }
  }

  const handleDrag = e => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = e => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleConfirmMap = () => {
    if (selectedFile && manualMap) {
      onFileSelect(selectedFile, manualMap)
      setShowColumnMapper(false)
    }
  }

  return (
    <div style={styles.uploadContainer}>
      {!showColumnMapper ? (
        <>
          <div
            style={{
              ...styles.dropzone,
              ...(dragActive ? styles.dropzoneActive : {})
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <svg
              style={styles.uploadIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>

            <h3 style={styles.dropzoneTitle}>Upload Excel File</h3>
            <p style={styles.dropzoneSubtitle}>
              Drag & drop your .xlsx file here or click to browse
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={e =>
                e.target.files?.[0] && handleFile(e.target.files[0])
              }
              style={styles.hiddenFileInput}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              style={styles.browseButton}
              disabled={loading}
            >
              {loading ? "Processing..." : "Browse Files"}
            </button>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.requirements}>
            <h4 style={styles.requirementsTitle}>File Format</h4>
            <p style={styles.requirementsText}>
              Your Excel file should have columns for: <strong>Date</strong>,{" "}
              <strong>Amount</strong>,<strong>Merchant</strong>, and{" "}
              <strong>Category</strong>
            </p>
          </div>
        </>
      ) : (
        <div style={styles.mapperContainer}>
          <h3 style={styles.mapperTitle}>Map Your Columns</h3>
          <p style={styles.mapperSubtitle}>
            Select which column corresponds to each field
          </p>

          <div style={styles.mappingGrid}>
            {["date", "amount", "merchant", "category"].map(field => (
              <div key={field} style={styles.mappingRow}>
                <label style={styles.mappingLabel}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <select
                  value={manualMap?.[field] || ""}
                  onChange={e =>
                    setManualMap({ ...manualMap, [field]: e.target.value })
                  }
                  style={styles.mappingSelect}
                >
                  <option value="">Select column...</option>
                  {fileHeaders.map(header => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <button
            onClick={handleConfirmMap}
            style={styles.confirmMapButton}
            disabled={
              !manualMap?.date ||
              !manualMap?.amount ||
              !manualMap?.merchant ||
              !manualMap?.category
            }
          >
            Continue with this mapping
          </button>
        </div>
      )}
    </div>
  )
}

const PreviewTable = ({ rows }) => {
  const displayRows = rows.slice(0, 10)

  return (
    <div style={styles.previewContainer}>
      <h3 style={styles.previewTitle}>Preview (first 10 rows)</h3>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeader}>Date</th>
              <th style={styles.tableHeader}>Amount</th>
              <th style={styles.tableHeader}>Merchant</th>
              <th style={styles.tableHeader}>Category</th>
              <th style={styles.tableHeader}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  ...styles.tableRow,
                  ...(idx % 2 === 0 ? styles.tableRowEven : {})
                }}
              >
                <td style={styles.tableCell}>{row.date}</td>
                <td style={{ ...styles.tableCell, textAlign: "right" }}>
                  ${row.amount.toFixed(2)}
                </td>
                <td style={styles.tableCell}>{row.merchant}</td>
                <td style={styles.tableCell}>
                  <span style={styles.categoryBadge}>{row.category}</span>
                </td>
                <td
                  style={{
                    ...styles.tableCell,
                    fontSize: "12px",
                    color: "#888"
                  }}
                >
                  {row.notes || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > 10 && (
        <p style={styles.previewNote}>
          Showing 10 of {rows.length} rows. All rows will be validated.
        </p>
      )}
    </div>
  )
}

// ============ MAIN COMPONENT ============
const TransactionImportComplete = () => {
  // ============ ADD THESE HOOKS ============
  const { triggerRefresh } = useTransactionRefresh()
  const navigate = useNavigate()

  const [state, setState] = useState({
    step: "upload",
    rawRows: [],
    validRows: [],
    invalidRows: [],
    duplicateRows: [],
    columnMap: null,
    uploadError: null,
    result: null
  })

  const [loading, setLoading] = useState(false)

  const handleFileSelect = async (file, columnMap) => {
    setLoading(true)
    try {
      const parsed = await parseExcelFile(file, columnMap)

      const validRows = []
      const invalidRows = []

      parsed.forEach(row => {
        const errors = validateTransaction(row)
        if (errors.length === 0) {
          validRows.push(row)
        } else {
          invalidRows.push({ row, errors })
        }
      })

      setState(prev => ({
        ...prev,
        step: "validate",
        rawRows: parsed,
        validRows,
        invalidRows,
        columnMap
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        uploadError: `Failed to parse file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleValidationConfirm = async () => {
    // Skip mock duplicate detection — server will handle it on import.
    // Just move straight to the review step with all valid rows.
    setState(prev => ({
      ...prev,
      step: "review",
      duplicateRows: []
    }))
  }

  // ============ MODIFIED handleConfirmImport — calls real backend API ============
  const handleConfirmImport = async () => {
    setLoading(true)
    try {
      // Call the real backend import endpoint
      const response = await importTransactions(state.validRows)

      setState(prev => ({
        ...prev,
        step: "done",
        result: {
          imported: response?.imported ?? 0,
          duplicates: response?.duplicates ?? prev.duplicateRows.length,
          failed: response?.failed ?? 0
        }
      }))

      // Trigger the Transactions page to refresh its list
      await triggerRefresh()

    } catch (error) {
      alert(
        "Error importing: " +
          (error instanceof Error ? error.message : "Unknown")
      )
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setState({
      step: "upload",
      rawRows: [],
      validRows: [],
      invalidRows: [],
      duplicateRows: [],
      columnMap: null,
      uploadError: null,
      result: null
    })
  }

  const handleBack = () => {
    setState(prev => ({
      ...prev,
      step: "validate"
    }))
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Import Transactions</h1>
        <p style={styles.pageSubtitle}>
          Upload an Excel file to import multiple transactions at once
        </p>
      </div>

      {/* STEP INDICATOR */}
      <div style={styles.stepIndicator}>
        {["upload", "validate", "review", "done"].map((stepName, idx) => (
          <div key={stepName} style={styles.stepRow}>
            <div
              style={{
                ...styles.stepCircle,
                ...(state.step === stepName
                  ? styles.stepCircleActive
                  : state.rawRows.length > 0
                  ? styles.stepCircleComplete
                  : styles.stepCircleInactive)
              }}
            >
              {idx + 1}
            </div>
            <span
              style={{
                ...styles.stepLabel,
                ...(state.step === stepName ? styles.stepLabelActive : {})
              }}
            >
              {stepName === "upload" && "Upload"}
              {stepName === "validate" && "Validate"}
              {stepName === "review" && "Review"}
              {stepName === "done" && "Complete"}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: UPLOAD */}
      {state.step === "upload" && (
        <FileUploadZone
          onFileSelect={handleFileSelect}
          loading={loading}
          error={state.uploadError || undefined}
        />
      )}

      {/* STEP 2: VALIDATE */}
      {state.step === "validate" && (
        <div style={styles.stepContainer}>
          <PreviewTable rows={state.rawRows} />

          <div style={styles.validationSummary}>
            <div style={styles.validationCard}>
              <div style={styles.validationCardTitle}>Valid Rows</div>
              <div style={{ ...styles.validationCardValue, color: "#10b981" }}>
                {state.validRows.length}
              </div>
            </div>

            {state.invalidRows.length > 0 && (
              <div style={styles.validationCard}>
                <div style={styles.validationCardTitle}>Invalid Rows</div>
                <div
                  style={{ ...styles.validationCardValue, color: "#ef4444" }}
                >
                  {state.invalidRows.length}
                </div>
              </div>
            )}
          </div>

          {state.invalidRows.length > 0 && (
            <div style={styles.errorsContainer}>
              <h4 style={styles.errorsTitle}>Issues Found</h4>
              {state.invalidRows.slice(0, 5).map((item, idx) => (
                <div key={idx} style={styles.errorItem}>
                  <strong>Row {item.row.rowNumber}:</strong>{" "}
                  {item.errors.join("; ")}
                </div>
              ))}
              {state.invalidRows.length > 5 && (
                <p style={styles.errorNote}>
                  ...and {state.invalidRows.length - 5} more rows with errors
                </p>
              )}
            </div>
          )}

          <div style={styles.buttonGroup}>
            <button
              onClick={handleReset}
              style={{ ...styles.button, ...styles.buttonSecondary }}
            >
              Upload Different File
            </button>
            <button
              onClick={handleValidationConfirm}
              disabled={state.validRows.length === 0 || loading}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                ...(state.validRows.length === 0 || loading
                  ? styles.buttonDisabled
                  : {})
              }}
            >
              {loading
                ? "Checking for duplicates..."
                : `Continue with ${state.validRows.length} Valid Rows →`}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW */}
      {state.step === "review" && (
        <div style={styles.stepContainer}>
          <h3 style={styles.reviewTitle}>Review Import Summary</h3>

          <div style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryIcon}>📥</div>
              <div style={styles.summaryLabel}>To Import</div>
              <div style={styles.summaryValue}>{state.validRows.length}</div>
            </div>

            <div style={styles.summaryCard}>
              <div style={styles.summaryIcon}>⊝</div>
              <div style={styles.summaryLabel}>Duplicates</div>
              <div style={styles.summaryValue}>
                {state.duplicateRows.length}
              </div>
            </div>
          </div>

          {state.duplicateRows.length > 0 && (
            <div style={styles.duplicatesAlert}>
              <h4 style={styles.duplicatesTitle}>
                ⊝ Found {state.duplicateRows.length} duplicate(s)
              </h4>
              <p style={styles.duplicatesNote}>
                These transactions will be skipped as they already exist
              </p>
              <div style={styles.duplicatesList}>
                {state.duplicateRows.slice(0, 3).map((dup, idx) => (
                  <div key={idx} style={styles.duplicateItem}>
                    <div style={styles.duplicateItemContent}>
                      <strong>{dup.row.date}</strong> • $
                      {dup.row.amount.toFixed(2)} • {dup.row.merchant}
                    </div>
                    <div style={styles.duplicateItemMeta}>
                      Previously imported on {dup.matchingDate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={styles.confirmationBox}>
            <input
              type="checkbox"
              id="confirm-check"
              style={styles.checkboxInput}
            />
            <label htmlFor="confirm-check" style={styles.checkboxLabel}>
              I confirm that this data is correct and I want to import{" "}
              {state.validRows.length} transaction
              {state.validRows.length !== 1 ? "s" : ""}
            </label>
          </div>

          <div style={styles.reviewButtonGroup}>
            <button
              onClick={handleBack}
              style={{ ...styles.button, ...styles.buttonSecondary }}
              disabled={loading}
            >
              Back
            </button>
            <button
              onClick={() => {
                const checkbox = document.getElementById("confirm-check")
                if (checkbox?.checked) {
                  handleConfirmImport()
                } else {
                  alert("Please confirm to proceed")
                }
              }}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                ...(loading ? styles.buttonLoading : {})
              }}
              disabled={loading}
            >
              {loading ? "Importing..." : "Confirm & Import →"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DONE - MODIFIED with View Transactions button */}
      {state.step === "done" && state.result && (
        <div style={styles.resultContainer}>
          <div style={styles.resultCard}>
            <div style={styles.resultIcon}>✓</div>
            <h2 style={styles.resultTitle}>Import Complete!</h2>

            <div style={styles.resultSummary}>
              <div style={styles.resultItem}>
                <span style={styles.resultItemLabel}>Imported</span>
                <span style={{ ...styles.resultItemValue, color: "#10b981" }}>
                  {state.result.imported} transaction
                  {state.result.imported !== 1 ? "s" : ""}
                </span>
              </div>

              {state.result.duplicates > 0 && (
                <div style={styles.resultItem}>
                  <span style={styles.resultItemLabel}>
                    Skipped (duplicates)
                  </span>
                  <span style={{ ...styles.resultItemValue, color: "#f59e0b" }}>
                    {state.result.duplicates} transaction
                    {state.result.duplicates !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {state.result.failed > 0 && (
                <div style={styles.resultItem}>
                  <span style={styles.resultItemLabel}>Failed to import</span>
                  <span style={{ ...styles.resultItemValue, color: "#ef4444" }}>
                    {state.result.failed} transaction
                    {state.result.failed !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>

            <div style={styles.resultNote}>
              <p style={styles.resultNoteText}>
                Your transactions have been added to your account and are ready
                to categorize and review.
              </p>
            </div>

            {/* ============ MODIFIED: Added two buttons ============ */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={handleReset}
                style={{ ...styles.button, ...styles.buttonSecondary }}
              >
                Import More Transactions
              </button>
              <button
                onClick={() => navigate('/transactions')}
                style={{ ...styles.button, ...styles.buttonPrimary }}
              >
                View Transactions →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ STYLES ============
const styles = {
  pageContainer: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "2rem 1.5rem",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    backgroundColor: "#f9f7f4",
    minHeight: "100vh"
  },

  header: {
    marginBottom: "2rem",
    textAlign: "center"
  },

  pageTitle: {
    fontSize: "32px",
    fontWeight: "600",
    margin: "0 0 0.5rem 0",
    color: "#1a1a1a",
    letterSpacing: "-0.5px"
  },

  pageSubtitle: {
    fontSize: "15px",
    color: "#666",
    margin: 0
  },

  stepIndicator: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "2.5rem",
    padding: "0 2rem"
  },

  stepRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem"
  },

  stepCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.3s ease"
  },

  stepCircleActive: {
    backgroundColor: "#1a365d",
    color: "#fff",
    boxShadow: "0 0 0 3px rgba(26, 54, 93, 0.1)"
  },

  stepCircleComplete: {
    backgroundColor: "#10b981",
    color: "#fff"
  },

  stepCircleInactive: {
    backgroundColor: "#e5e7eb",
    color: "#999"
  },

  stepLabel: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },

  stepLabelActive: {
    color: "#1a365d",
    fontWeight: "600"
  },

  uploadContainer: {
    marginBottom: "2rem"
  },

  dropzone: {
    border: "2px dashed #d1ccc6",
    borderRadius: "12px",
    padding: "3rem 2rem",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backgroundColor: "#fff",
    marginBottom: "1.5rem"
  },

  dropzoneActive: {
    borderColor: "#1a365d",
    backgroundColor: "#f0f4f9",
    boxShadow: "0 4px 12px rgba(26, 54, 93, 0.08)"
  },

  uploadIcon: {
    width: "48px",
    height: "48px",
    color: "#999",
    marginBottom: "1rem"
  },

  dropzoneTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 0.5rem 0",
    color: "#1a1a1a"
  },

  dropzoneSubtitle: {
    fontSize: "14px",
    color: "#999",
    margin: "0 0 1.5rem 0"
  },

  hiddenFileInput: {
    display: "none"
  },

  browseButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#1a365d",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },

  requirements: {
    padding: "1.25rem",
    backgroundColor: "#fffbf9",
    borderLeft: "4px solid #f97316",
    borderRadius: "8px"
  },

  requirementsTitle: {
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#1a1a1a",
    margin: "0 0 0.5rem 0"
  },

  requirementsText: {
    fontSize: "13px",
    color: "#666",
    margin: 0
  },

  mapperContainer: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "2rem",
    border: "1px solid #e5e7eb"
  },

  mapperTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 0.5rem 0",
    color: "#1a1a1a"
  },

  mapperSubtitle: {
    fontSize: "14px",
    color: "#666",
    margin: "0 0 1.5rem 0"
  },

  mappingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1.5rem",
    marginBottom: "1.5rem"
  },

  mappingRow: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  },

  mappingLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1a1a1a",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },

  mappingSelect: {
    padding: "0.75rem",
    border: "1px solid #d1ccc6",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    cursor: "pointer"
  },

  confirmMapButton: {
    width: "100%",
    padding: "0.875rem",
    backgroundColor: "#1a365d",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },

  previewContainer: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "2rem",
    border: "1px solid #e5e7eb"
  },

  previewTitle: {
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 1rem 0",
    color: "#1a1a1a"
  },

  tableWrapper: {
    overflowX: "auto",
    marginBottom: "1rem"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px"
  },

  tableHeaderRow: {
    borderBottom: "2px solid #e5e7eb"
  },

  tableHeader: {
    padding: "0.75rem",
    textAlign: "left",
    fontWeight: "600",
    color: "#666",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },

  tableRow: {
    borderBottom: "1px solid #f3f0eb",
    transition: "background-color 0.2s ease"
  },

  tableRowEven: {
    backgroundColor: "#faf9f8"
  },

  tableCell: {
    padding: "0.75rem",
    color: "#1a1a1a"
  },

  categoryBadge: {
    display: "inline-block",
    padding: "0.25rem 0.75rem",
    backgroundColor: "#dbeafe",
    color: "#0c4a6e",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500"
  },

  previewNote: {
    fontSize: "12px",
    color: "#999",
    margin: "0.75rem 0 0 0"
  },

  validationSummary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem"
  },

  validationCard: {
    backgroundColor: "#fff",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    textAlign: "center"
  },

  validationCardTitle: {
    fontSize: "12px",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "0.5rem"
  },

  validationCardValue: {
    fontSize: "28px",
    fontWeight: "600"
  },

  errorsContainer: {
    backgroundColor: "#fef2f2",
    borderLeft: "4px solid #ef4444",
    borderRadius: "8px",
    padding: "1.25rem",
    marginBottom: "2rem"
  },

  errorsTitle: {
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#991b1b",
    margin: "0 0 0.75rem 0"
  },

  errorItem: {
    fontSize: "13px",
    color: "#7f1d1d",
    marginBottom: "0.5rem",
    lineHeight: "1.5"
  },

  errorNote: {
    fontSize: "12px",
    color: "#b91c1c",
    margin: "0.75rem 0 0 0",
    fontStyle: "italic"
  },

  stepContainer: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "2rem",
    border: "1px solid #e5e7eb"
  },

  buttonGroup: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
    marginTop: "2rem"
  },

  button: {
    padding: "0.875rem 1.5rem",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },

  buttonPrimary: {
    backgroundColor: "#1a365d",
    color: "#fff"
  },

  buttonSecondary: {
    backgroundColor: "transparent",
    color: "#1a365d",
    border: "1px solid #1a365d"
  },

  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed"
  },

  buttonLoading: {
    opacity: 0.7
  },

  reviewTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0 0 1.5rem 0",
    color: "#1a1a1a"
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem"
  },

  summaryCard: {
    backgroundColor: "#f9f7f4",
    padding: "1.25rem",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    textAlign: "center"
  },

  summaryIcon: {
    fontSize: "24px",
    marginBottom: "0.5rem"
  },

  summaryLabel: {
    fontSize: "12px",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "0.5rem"
  },

  summaryValue: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#1a1a1a"
  },

  duplicatesAlert: {
    backgroundColor: "#fffbf9",
    borderLeft: "4px solid #f97316",
    borderRadius: "8px",
    padding: "1.25rem",
    marginBottom: "2rem"
  },

  duplicatesTitle: {
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 0.5rem 0",
    color: "#92400e"
  },

  duplicatesNote: {
    fontSize: "13px",
    color: "#b45309",
    margin: "0 0 1rem 0"
  },

  duplicatesList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem"
  },

  duplicateItem: {
    backgroundColor: "#fff",
    padding: "0.75rem",
    borderRadius: "6px",
    border: "1px solid #fed7aa"
  },

  duplicateItemContent: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: "0.25rem"
  },

  duplicateItemMeta: {
    fontSize: "12px",
    color: "#b45309"
  },

  confirmationBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "1.25rem",
    backgroundColor: "#f0fdf4",
    borderRadius: "8px",
    marginBottom: "2rem"
  },

  checkboxInput: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    accentColor: "#1a365d"
  },

  checkboxLabel: {
    fontSize: "14px",
    color: "#1a1a1a",
    cursor: "pointer",
    flex: 1
  },

  reviewButtonGroup: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end"
  },

  resultContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
    padding: "2rem 1.5rem"
  },

  resultCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "3rem 2rem",
    border: "1px solid #e5e7eb",
    maxWidth: "500px",
    textAlign: "center"
  },

  resultIcon: {
    fontSize: "64px",
    marginBottom: "1rem"
  },

  resultTitle: {
    fontSize: "28px",
    fontWeight: "600",
    margin: "0 0 2rem 0",
    color: "#1a1a1a"
  },

  resultSummary: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginBottom: "2rem",
    padding: "1.5rem",
    backgroundColor: "#f9f7f4",
    borderRadius: "8px"
  },

  resultItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  resultItemLabel: {
    fontSize: "13px",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },

  resultItemValue: {
    fontSize: "18px",
    fontWeight: "600"
  },

  resultNote: {
    backgroundColor: "#fffbf9",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "2rem",
    border: "1px solid #fed7aa"
  },

  resultNoteText: {
    fontSize: "13px",
    color: "#92400e",
    margin: 0
  }
}

export default TransactionImportComplete