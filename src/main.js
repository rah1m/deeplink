function isAppInstalled(scheme) {
  return new Promise((resolve) => {
    const start = Date.now();
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = scheme;
    document.body.appendChild(iframe);

    setTimeout(() => {
      document.body.removeChild(iframe);
      // If browser switched focus to the app, page was likely hidden fast
      const elapsed = Date.now() - start;
      resolve(elapsed < 1500); // heuristic
    }, 1000);
  });
}

// Example for WhatsApp
isAppInstalled("whatsapp://").then((installed) => {
  console.log("WhatsApp installed:", installed);
});
