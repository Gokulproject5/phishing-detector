// PhishGuard AI - Production Grade Email Integration
console.log("PhishGuard AI: Real-time webmail protection active.");

const API_BASE = 'http://localhost:8000';

// Helper to get token (in a real extension, this would be in storage)
const getAuthHeaders = () => {
    // This is a placeholder for development; ideally, the extension would have its own token
    // or share it via storage if on the same domain.
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (localStorage.getItem('phish_token') || '')
    };
};

// 1. UI Injection Logic
const injectScanButton = (container, textSource, subject) => {
    if (container.querySelector('.phishguard-scan-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'phishguard-scan-btn';
    btn.innerHTML = '🛡️ Scan';
    btn.style.cssText = `
        margin-left: 10px;
        padding: 4px 10px;
        background: #6366F1;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        vertical-align: middle;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
    `;

    btn.onmouseover = () => btn.style.transform = 'translateY(-1px)';
    btn.onmouseout = () => btn.style.transform = 'translateY(0)';

    btn.onclick = async (e) => {
        e.stopPropagation();
        const originalText = btn.innerHTML;
        btn.innerHTML = '⌛ Analyzing...';
        btn.style.background = '#94A3B8';

        try {
            const emailContent = textSource();
            // 1. Get Prediction
            const predRes = await fetch(`${API_BASE}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: emailContent })
            });
            const data = await predRes.json();

            // 2. Ingest into history/alerts
            await fetch(`${API_BASE}/api/email/ingest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('phish_token') // Simulation
                },
                body: JSON.stringify({
                    url: `Email: ${subject}`,
                    result: data
                })
            });

            if (data.prediction === 'Phishing') {
                btn.innerHTML = '⚠ THREAT';
                btn.style.background = '#EF4444';
                btn.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                alert(`🛡️ PHISHGUARD PROTECTED:\n\nThreat detected in "${subject}".\n\nProbability: ${(data.probability * 100).toFixed(1)}%\n\nCaution: Do not interact with links or attachments.`);
            } else {
                btn.innerHTML = '✅ SAFE';
                btn.style.background = '#10B981';
                btn.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }
        } catch (err) {
            btn.innerHTML = '❌ ERROR';
            btn.style.background = '#F59E0B';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '#6366F1';
            }, 3000);
        }
    };

    container.appendChild(btn);
};

// 2. Webmail Specific Observers
const observeWebmail = () => {
    const observer = new MutationObserver(() => {
        // Gmail Integration
        const gmailSubjects = document.querySelectorAll('.hP');
        gmailSubjects.forEach(subject => {
            const subjectText = subject.innerText;
            injectScanButton(subject, () => {
                const body = document.querySelector('.a3s.aiL');
                return body ? body.innerText : subjectText;
            }, subjectText);
        });

        // Outlook Integration
        const outlookSubjects = document.querySelectorAll('[data-tester-id="full-screen-reading-pane-subject"]');
        outlookSubjects.forEach(subject => {
            const subjectText = subject.innerText;
            injectScanButton(subject, () => {
                const body = document.querySelector('.rps_7ea3');
                return body ? body.innerText : subjectText;
            }, subjectText);
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
};

// Initialize
observeWebmail();

// Link Highlighting
const suspiciousKeywords = ['verify', 'login', 'account', 'update', 'banking', 'secure', 'auth', 'signin'];
const scanLinks = () => {
    document.querySelectorAll('a').forEach(link => {
        if (link.dataset.phishVerified) return;
        const href = (link.href || '').toLowerCase();
        const text = (link.innerText || '').toLowerCase();

        if (suspiciousKeywords.some(kw => href.includes(kw) || text.includes(kw))) {
            link.style.borderBottom = "2px dashed #EF4444";
            link.title = "PhishGuard: Suspicious keywords detected.";
            link.dataset.phishVerified = "true";
        }
    });
};

setInterval(scanLinks, 2000);
