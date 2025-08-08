import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import './App.css'

function App() {
  const [text, setText] = useState('https://example.com')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [savedPresets, setSavedPresets] = useState([])
  const qrRef = useRef(null)

  useEffect(() => {
    generateQRCode(text)
  }, [text])

  const generateQRCode = async (inputText) => {
    if (!inputText.trim()) {
      setQrCodeUrl('')
      return
    }

    try {
      const url = await QRCode.toDataURL(inputText, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })
      setQrCodeUrl(url)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const downloadQRCode = async () => {
    if (!qrRef.current) return

    try {
      const canvas = await html2canvas(qrRef.current, {
        backgroundColor: '#ffffff',
        scale: 2
      })
      
      const link = document.createElement('a')
      link.download = `qrcode-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('Error downloading QR code:', error)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const handleClear = () => {
    setText('')
  }

  const saveToPresets = () => {
    if (text.trim() && !savedPresets.includes(text.trim())) {
      const newPresets = [text.trim(), ...savedPresets].slice(0, 6) // Keep only last 6
      setSavedPresets(newPresets)
    }
  }

  const clearPresets = () => {
    setSavedPresets([])
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">QR Code Generator</h1>
          <p className="subtitle">Generate permanent QR codes that never expire</p>
        </header>

        <div className="main-content">
          <div className="input-section">
            <div className="input-group">
              <label htmlFor="text-input" className="label">
                Enter text or URL
              </label>
              <textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter any text, URL, email, or data..."
                className="text-input"
                rows={4}
              />
              <div className="input-actions">
                <button onClick={handleClear} className="btn btn-secondary">
                  Clear
                </button>
                <button onClick={copyToClipboard} className="btn btn-secondary">
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
                <button onClick={saveToPresets} className="btn btn-secondary">
                  Save to Presets
                </button>
              </div>
            </div>

            {savedPresets.length > 0 && (
              <div className="presets">
                <div className="presets-header">
                  <p className="presets-label">Saved presets:</p>
                  <button onClick={clearPresets} className="clear-presets-btn">
                    Clear All
                  </button>
                </div>
                <div className="preset-buttons">
                  {savedPresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => setText(preset)}
                      className="preset-btn"
                      title={preset}
                    >
                      {preset.length > 30 ? preset.substring(0, 30) + '...' : preset}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="qr-section">
            {qrCodeUrl ? (
              <div className="qr-container">
                <div ref={qrRef} className="qr-code-wrapper">
                  <img src={qrCodeUrl} alt="Generated QR Code" className="qr-code" />
                </div>
                <div className="qr-actions">
                  <button onClick={downloadQRCode} className="btn btn-primary">
                    Download QR Code
                  </button>
                </div>
                <div className="qr-info">
                  <p className="info-text">
                    ✓ This QR code is permanent and will never expire
                  </p>
                  <p className="info-text">
                    📱 Scan with any QR code reader
                  </p>
                </div>
              </div>
            ) : (
              <div className="placeholder">
                <div className="placeholder-icon">📱</div>
                <p>Enter text above to generate your QR code</p>
              </div>
            )}
          </div>
        </div>

        <footer className="footer">
          <p>QR codes generated are permanent and work offline</p>
        </footer>
      </div>
    </div>
  )
}

export default App