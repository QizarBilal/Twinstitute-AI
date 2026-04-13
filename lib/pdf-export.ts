/**
 * PDF Export Utility
 * Handles exporting resume as PDF using html2pdf
 */

export async function exportToPDF(
    elementId: string,
    filename: string
): Promise<boolean> {
    try {
        // Dynamically import html2pdf
        const html2pdf = (await import('html2pdf.js')).default

        const element = document.getElementById(elementId)
        if (!element) {
            console.error('Element not found:', elementId)
            return false
        }

        const options = {
            margin: [10, 10, 10, 10],
            filename: `${filename}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
        }

        await html2pdf().set(options).from(element).save()
        return true
    } catch (error) {
        console.error('Error exporting to PDF:', error)
        // Fallback to print
        fallbackPrint(elementId)
        return false
    }
}

/**
 * Fallback print function for PDF export
 * Opens print dialog which can save as PDF
 */
function fallbackPrint(elementId: string) {
    const element = document.getElementById(elementId)
    if (!element) return

    const printWindow = window.open('', '', 'width=1024,height=768')
    if (!printWindow) {
        alert('Please disable popup blocker to download PDF')
        return
    }

    const styles = `
        <style>
            * { margin: 0; padding: 0; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
            @media print {
                body { margin: 0; padding: 0; }
                .no-print { display: none; }
            }
        </style>
    `

    const content = element.innerHTML
    printWindow.document.write(`<!DOCTYPE html><html><head>${styles}</head><body>${content}</body></html>`)
    printWindow.document.close()

    setTimeout(() => {
        printWindow.print()
    }, 100)
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch (error) {
        console.error('Error copying to clipboard:', error)
        return false
    }
}
