export async function loadScript(src) {
    return new Promise((resolve) => {
      const scriptelement = document.createElement('script');
      scriptelement.onload = () => resolve();
      scriptelement.src = src;
      document.documentElement.appendChild(scriptelement);
    });
}
