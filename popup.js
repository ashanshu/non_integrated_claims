// Handle the "Copy Text" button in popup.html
document.getElementById("copyBtn").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: getInvoiceDetails
    }, (results) => {
        if (results && results[0] && results[0].result) {
            let value = results[0].result;
            navigator.clipboard.writeText(value).then(() => {
                document.getElementById("status").innerText = "Copied: " + value;
            }).catch(err => console.error("Failed to copy:", err));
        } else {
            document.getElementById("status").innerText = "Value not found!";
        }

        let text = results[0].result;
        
        // Store the copied text in Chrome storage
        chrome.storage.local.set({ copiedText: text }, () => {
            // alert("Copied: " + text);
        });
    });

        
});

function getInputValue() {
    let inputField = document.querySelector("input[data-testid='ClientContact']");
    return inputField ? inputField.value : "Not found";
}

function getInvoiceDetails() {
    const invoiceDetails = {};

    // Get Invoice ID
    const invoiceIdInput = document.querySelector("input[name='claimdata_config_Array[InfoFromVet][Conditions][0][Financial][Invoices][0][InvoiceId]']");
    invoiceDetails.invoiceId = invoiceIdInput ? invoiceIdInput.value : null;

    // Get Invoice Number
    const invoiceNumberInput = document.querySelector("input[id^='invoiceNumber']");
    invoiceDetails.invoiceNumber = invoiceNumberInput ? invoiceNumberInput.value : null;

    // Get Invoice Date
    const invoiceDateInput = document.querySelector("input[id^='Date-'][hidden]");
    invoiceDetails.invoiceDate = invoiceDateInput ? invoiceDateInput.value : null;

    // Get Total Ex. GST
    const totalExGstInput = document.querySelector("input[name='claimInvoiceTotal']");
    invoiceDetails.totalExGst = totalExGstInput ? parseFloat(totalExGstInput.value) : null;

    // Get Discount
    const discountInput = document.querySelector("input[name='claimInvoiceTotalDiscount']");
    invoiceDetails.discount = discountInput ? parseFloat(discountInput.value) : null;

    // Get GST
    const gstInput = document.querySelector("input[name='claimInvoiceTotalGST']");
    invoiceDetails.gst = gstInput ? parseFloat(gstInput.value) : null;

    // Get Total Inc. GST
    const totalIncGstInput = document.querySelector("input[name='claimInvoiceTotalInclVAT']");
    invoiceDetails.totalIncGst = totalIncGstInput ? parseFloat(totalIncGstInput.value) : null;

    // Get Invoice Items
    invoiceDetails.invoiceItems = [];
    const seenItems = new Set(); // Use Set to filter out duplicates

    document.querySelectorAll("div[id^='claimInvoiceItems'] div[id*='row'][id*='contentColumn']").forEach(row => {
        const descriptionInput = row.querySelector("input[name*='Description']");
        const amountExGstInput = row.querySelector("input[name*='AmountExVAT']");
        const gstInput = row.querySelector("input[name*='VAT']");
        const quantityInput = row.querySelector("input[name*='Quantity']");

        const item = {
            description: descriptionInput ? descriptionInput.value : null,
            amountExGst: amountExGstInput ? parseFloat(amountExGstInput.value) : null,
            gst: gstInput ? parseFloat(gstInput.value) : null,
            quantity: quantityInput ? parseInt(quantityInput.value, 10) : null
        };

        // Convert to string and store in Set to prevent duplicates
        const itemKey = JSON.stringify(item);
        if (!seenItems.has(itemKey)) {
            seenItems.add(itemKey);
            invoiceDetails.invoiceItems.push(item);
        }
    });

    return JSON.stringify(invoiceDetails);
}

// Handle the "Paste Text" button in popup.html
document.getElementById("pasteBtn").addEventListener("click", () => {
    chrome.storage.local.get("copiedText", (data) => {
        if (data.copiedText) {
            // Inject the copied text into the active webpage's input field
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: pasteTextToPage,
                    args: [data.copiedText]
                });
            });
        } else {
            alert("No text has been copied yet!");
        }
    });
});

// Function to paste copied text into the active webpage's input field
function pasteTextToPage(text) {
    let inputField = document.querySelector("input[type='text'], textarea"); // You can customize this selector for a specific input
    if (inputField) {
        inputField.value = text;
    } else {
        alert("No input field found to paste the text into!");
    }
}
