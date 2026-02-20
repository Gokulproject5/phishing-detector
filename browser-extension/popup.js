document.addEventListener('DOMContentLoaded', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const urlText = document.getElementById('url-text');
    const resultsDiv = document.getElementById('results');
    const scanBtn = document.getElementById('scan-btn');

    urlText.textContent = tab.url;

    scanBtn.addEventListener('click', async () => {
        resultsDiv.textContent = 'Analysing...';

        try {
            // In a real extension, we'd use an API key or stored token
            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: tab.url }) // Simplification: scanning the URL string
            });

            const data = await response.json();

            const isPhish = data.prediction === 'Phishing';
            resultsDiv.innerHTML = `
        <div class="${isPhish ? 'phish' : 'legit'}" style="font-weight: bold; font-size: 16px;">
          ${isPhish ? '⚠ Phishing Detected' : '✅ Legitimate Page'}
        </div>
        <div style="margin-top: 8px;">Confidence: ${(data.probability * 100).toFixed(1)}%</div>
      `;
        } catch (err) {
            resultsDiv.textContent = 'Error: Make sure backend is running on port 8000';
            resultsDiv.style.color = '#EF4444';
        }
    });
});
