export function triggerDownload(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.documentElement.appendChild(a);
    a.click();
    a.remove();
}