chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getValue") {
        // Try to find the input field using known attributes
        const inputField = document.querySelector("input[data-testid='ClientContact']");
        sendResponse({ value: inputField ? inputField.value : "Not found" });
    }
});
