export async function loadScript(src) {
    return new Promise((resolve) => {
      const scriptelement = document.createElement('script');
      scriptelement.onload = () => resolve();
      scriptelement.src = src;
      document.documentElement.appendChild(scriptelement);
    });
}

export async function loadScriptModuleFromText(text) {
  return new Promise((resolve) => {
    const scriptelement = document.createElement('script');
    scriptelement.onload = () => resolve();
    scriptelement.src = URL.createObjectURL(new Blob([text], {type: "application/javascript"}));
    scriptelement.type = "module";
    document.documentElement.appendChild(scriptelement);
  });
}

export async function loadCSS(href) {
  return new Promise((resolve) => {
    const head  = document.getElementsByTagName('head')[0];
    const link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = href;
    link.media = 'all';
    head.appendChild(link);
    link.onload = () => resolve();
  });
}
